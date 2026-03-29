import http from 'node:http';
import { randomUUID } from 'node:crypto';
import {
  findDetectedMedicines,
  getAllergyRisks,
  getConditionRisks,
  getDosageGuidance,
  getInteractionFindings,
  listAnalysisHistory,
  getMedicationCatalogPreview,
  saveAnalysisHistory,
} from './db.js';
import { extractPrescriptionText } from './extract.js';

const PORT = 8787;

const severityWeight = {
  high: 24,
  moderate: 12,
  safe: 0,
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(JSON.stringify(payload));
};

const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 25_000_000) {
        reject(new Error('Payload too large'));
      }
    });

    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', reject);
  });

const dedupeRecommendations = (...groups) =>
  [...new Set(groups.flat().filter(Boolean))];

const buildAnalysis = async ({ prescriptionText, file, patientDetails }) => {
  const { extractedText, source } = await extractPrescriptionText({ prescriptionText, file });

  if (!extractedText) {
    throw new Error('Extraction failed. Please paste prescription text or upload a supported file.');
  }

  const medicines = findDetectedMedicines(extractedText);
  const medicationIds = medicines.map((medicine) => medicine.id);

  if (medicines.length === 0) {
    throw new Error('No medicines could be matched from the extracted text. Please review the OCR source or edit the text input.');
  }

  const interactions = getInteractionFindings(medicationIds);
  const dosageIssues = getDosageGuidance(medicationIds);
  const conditionRisks = getConditionRisks(medicationIds, patientDetails?.conditions);
  const allergyRisks = getAllergyRisks(medicationIds, patientDetails?.allergies);
  const patientRisks = [...conditionRisks, ...allergyRisks];

  const age = Number.parseInt(patientDetails?.age || '0', 10);
  if (age >= 65 && medicines.some((medicine) => ['NSAID', 'Anticoagulant'].includes(medicine.drugClass))) {
    patientRisks.push({
      title: 'Age-related monitoring risk',
      severity: 'moderate',
      description: 'Older adults may be more sensitive to bleeding, renal, or gastric side effects.',
      recommendation: 'Confirm monitoring plan because patient age increases medicine risk.',
    });
  }

  if (patientRisks.length === 0) {
    patientRisks.push({
      title: 'No direct allergy or condition conflict detected',
      severity: 'safe',
      description: 'No medication in the extracted list directly conflicts with the entered allergies or conditions.',
      recommendation: 'Continue with routine clinical review before dispensing.',
    });
  }

  const recommendations = dedupeRecommendations(
    interactions.map((item) => item.recommendation),
    dosageIssues.map((item) => item.recommendation),
    patientRisks.map((item) => item.recommendation),
    medicines.map((medicine) =>
      medicine.saferAlternative && medicine.saferAlternative !== 'Clinical review required'
        ? `Consider ${medicine.saferAlternative} as a safer alternative to ${medicine.name} when clinically appropriate.`
        : ''
    )
  );

  const averageConfidence = Math.round(
    medicines.reduce((sum, medicine) => sum + medicine.confidence, 0) / medicines.length
  );

  const penalty =
    [...interactions, ...dosageIssues, ...patientRisks].reduce(
      (sum, item) => sum + severityWeight[item.severity],
      0
    );
  const safetyScore = Math.max(35, Math.min(98, 100 - penalty));
  const riskLevel = safetyScore >= 85 ? 'Safe' : safetyScore >= 60 ? 'Moderate' : 'High';

  return {
    medicines,
    extractedText,
    averageConfidence,
    safetyScore,
    riskLevel,
    extractedCount: medicines.length,
    interactions,
    dosageIssues,
    patientRisks,
    recommendations,
    recommendationHighlight:
      recommendations[0] || 'Review medicine choice against patient history.',
    explanation:
      interactions[0]?.description ||
      patientRisks[0]?.description ||
      'The AI did not detect a severe conflict, but the prescription was still checked against the medication database and patient profile.',
    source,
  };
};

const buildChatReply = ({ message, report }) => {
  const lowerMessage = (message || '').toLowerCase();

  if (!lowerMessage.trim()) {
    return {
      reply: 'Ask about medicine safety, interactions, confidence score, alternatives, or OCR results.',
    };
  }

  if (lowerMessage.includes('safe')) {
    return {
      reply: `Current risk level is ${report?.riskLevel || 'Moderate'} with a safety score of ${
        report?.safetyScore || 68
      }. Review the interaction and patient-risk cards before confirming the prescription.`,
    };
  }

  if (lowerMessage.includes('confidence') || lowerMessage.includes('ocr')) {
    return {
      reply: `The average extraction confidence is ${
        report?.averageConfidence || 0
      }%. You can edit the medicine list if the OCR output needs correction.`,
    };
  }

  if (lowerMessage.includes('explain') || lowerMessage.includes('risk')) {
    return {
      reply:
        report?.explanation ||
        'The warning was triggered because the extracted medicine list conflicts with the patient profile or another detected drug.',
    };
  }

  if (lowerMessage.includes('alternative')) {
    return {
      reply:
        report?.recommendationHighlight ||
        'A safer alternative may be available depending on the patient history and indication.',
    };
  }

  return {
    reply:
      'I can explain risk level, OCR confidence, detected interactions, patient-specific warnings, and recommended alternatives.',
  };
};

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    return sendJson(response, 204, {});
  }

  try {
    if (request.method === 'POST' && request.url === '/api/auth/login') {
      const body = await readJsonBody(request);
      const name = String(body.name || '').trim();

      if (!name) {
        return sendJson(response, 400, { error: 'Name is required.' });
      }

      return sendJson(response, 200, {
        name,
        sessionId: randomUUID(),
        welcomeMessage: `Hello ${name}, let’s ensure your prescription is safe.`,
      });
    }

    if (request.method === 'POST' && request.url === '/api/analyze') {
      const body = await readJsonBody(request);
      const analysis = await buildAnalysis(body);
      const historyId = saveAnalysisHistory({
        sessionId: body.sessionId,
        userName: body.userName,
        fileName: body.file?.name || '',
        patientDetails: body.patientDetails,
        analysis,
      });

      return sendJson(response, 200, {
        ...analysis,
        historyId,
      });
    }

    if (request.method === 'POST' && request.url === '/api/chat') {
      const body = await readJsonBody(request);
      return sendJson(response, 200, buildChatReply(body));
    }

    if (request.method === 'GET' && request.url === '/api/medications') {
      return sendJson(response, 200, {
        medications: getMedicationCatalogPreview(),
      });
    }

    if (request.method === 'GET' && request.url.startsWith('/api/history')) {
      const url = new URL(request.url, `http://localhost:${PORT}`);
      const name = url.searchParams.get('name') || '';
      return sendJson(response, 200, {
        items: listAnalysisHistory({ userName: name, limit: 8 }),
      });
    }

    if (request.method === 'GET' && request.url === '/api/health') {
      return sendJson(response, 200, { ok: true, service: 'MedSentinel AI API' });
    }

    return sendJson(response, 404, { error: 'Route not found.' });
  } catch (error) {
    return sendJson(response, 500, {
      error: error.message || 'Unexpected server error.',
    });
  }
});

server.listen(PORT, () => {
  console.log(`MedSentinel API running on http://localhost:${PORT}`);
});
