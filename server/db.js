import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
const dbPath = join(dataDir, 'medications.db');

mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY,
    generic_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    drug_class TEXT NOT NULL,
    common_dose TEXT NOT NULL,
    aliases_json TEXT NOT NULL,
    safer_alternative TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY,
    medication_a_id INTEGER NOT NULL,
    medication_b_id INTEGER NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    UNIQUE(medication_a_id, medication_b_id)
  );

  CREATE TABLE IF NOT EXISTS condition_risks (
    id INTEGER PRIMARY KEY,
    medication_id INTEGER NOT NULL,
    condition_keyword TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS allergy_risks (
    id INTEGER PRIMARY KEY,
    medication_id INTEGER NOT NULL,
    allergy_keyword TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS dosage_guidance (
    id INTEGER PRIMARY KEY,
    medication_id INTEGER NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS analysis_history (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_name TEXT,
    source TEXT,
    safety_score INTEGER,
    risk_level TEXT,
    patient_age TEXT,
    patient_conditions TEXT,
    patient_allergies TEXT,
    extracted_text TEXT,
    report_json TEXT NOT NULL
  );
`);

const medicationSeeds = [
  {
    generic_name: 'ibuprofen',
    display_name: 'Ibuprofen 400mg',
    drug_class: 'NSAID',
    common_dose: '200mg to 400mg',
    aliases: ['ibuprofen', 'advil', 'brufen', 'ibuprofen 400mg'],
    safer_alternative: 'Acetaminophen',
    notes: 'Use cautiously in patients with gastric ulcer history or anticoagulants.',
  },
  {
    generic_name: 'warfarin',
    display_name: 'Warfarin 5mg',
    drug_class: 'Anticoagulant',
    common_dose: 'As prescribed with INR monitoring',
    aliases: ['warfarin', 'warfarin 5mg', 'coumadin'],
    safer_alternative: 'Clinical review required',
    notes: 'High interaction potential with NSAIDs, aspirin, and macrolides.',
  },
  {
    generic_name: 'cetirizine',
    display_name: 'Cetirizine 10mg',
    drug_class: 'Antihistamine',
    common_dose: '10mg once daily',
    aliases: ['cetirizine', 'cetirizine 10mg', 'zyrtec'],
    safer_alternative: 'Clinical review required',
    notes: 'Generally low interaction burden.',
  },
  {
    generic_name: 'acetaminophen',
    display_name: 'Acetaminophen 500mg',
    drug_class: 'Analgesic',
    common_dose: '500mg to 650mg',
    aliases: ['acetaminophen', 'paracetamol', 'tylenol', 'crocin'],
    safer_alternative: 'Clinical review required',
    notes: 'Common substitute for NSAID pain relief in selected patients.',
  },
  {
    generic_name: 'amoxicillin',
    display_name: 'Amoxicillin 500mg',
    drug_class: 'Antibiotic',
    common_dose: '500mg three times daily',
    aliases: ['amoxicillin', 'amoxil', 'amoxicillin 500mg'],
    safer_alternative: 'Azithromycin',
    notes: 'Avoid in penicillin-allergic patients unless confirmed safe.',
  },
  {
    generic_name: 'metformin',
    display_name: 'Metformin 500mg',
    drug_class: 'Antidiabetic',
    common_dose: '500mg once or twice daily with meals',
    aliases: ['metformin', 'glycomet', 'metformin 500mg'],
    safer_alternative: 'Clinical review required',
    notes: 'Check renal status before long-term use.',
  },
  {
    generic_name: 'aspirin',
    display_name: 'Aspirin 75mg',
    drug_class: 'Antiplatelet',
    common_dose: '75mg once daily',
    aliases: ['aspirin', 'aspirin 75mg', 'ecosprin'],
    safer_alternative: 'Clinical review required',
    notes: 'Adds bleeding risk with anticoagulants or NSAIDs.',
  },
  {
    generic_name: 'lisinopril',
    display_name: 'Lisinopril 10mg',
    drug_class: 'ACE inhibitor',
    common_dose: '10mg once daily',
    aliases: ['lisinopril', 'lisinopril 10mg'],
    safer_alternative: 'Clinical review required',
    notes: 'Monitor renal function and potassium.',
  },
  {
    generic_name: 'amlodipine',
    display_name: 'Amlodipine 5mg',
    drug_class: 'Calcium channel blocker',
    common_dose: '5mg once daily',
    aliases: ['amlodipine', 'amlodipine 5mg'],
    safer_alternative: 'Clinical review required',
    notes: 'Usually low interaction burden.',
  },
  {
    generic_name: 'omeprazole',
    display_name: 'Omeprazole 20mg',
    drug_class: 'Proton pump inhibitor',
    common_dose: '20mg once daily',
    aliases: ['omeprazole', 'omeprazole 20mg', 'prilosec'],
    safer_alternative: 'Pantoprazole',
    notes: 'May affect activation of some antiplatelet medicines.',
  },
  {
    generic_name: 'azithromycin',
    display_name: 'Azithromycin 500mg',
    drug_class: 'Antibiotic',
    common_dose: '500mg once daily',
    aliases: ['azithromycin', 'azithromycin 500mg', 'zithromax'],
    safer_alternative: 'Clinical review required',
    notes: 'Review anticoagulant interactions.',
  },
  {
    generic_name: 'clopidogrel',
    display_name: 'Clopidogrel 75mg',
    drug_class: 'Antiplatelet',
    common_dose: '75mg once daily',
    aliases: ['clopidogrel', 'clopidogrel 75mg', 'plavix'],
    safer_alternative: 'Clinical review required',
    notes: 'Interaction concern with proton pump inhibitors such as Omeprazole.',
  },
  {
    generic_name: 'atorvastatin',
    display_name: 'Atorvastatin 20mg',
    drug_class: 'Statin',
    common_dose: '10mg to 20mg once daily',
    aliases: ['atorvastatin', 'atorvastatin 20mg', 'lipitor'],
    safer_alternative: 'Clinical review required',
    notes: 'Monitor muscle symptoms with interacting drugs.',
  },
  {
    generic_name: 'prednisone',
    display_name: 'Prednisone 10mg',
    drug_class: 'Corticosteroid',
    common_dose: 'As prescribed, often tapered',
    aliases: ['prednisone', 'prednisone 10mg', 'wysolone'],
    safer_alternative: 'Clinical review required',
    notes: 'May worsen glycemic control and GI irritation with NSAIDs.',
  },
  {
    generic_name: 'diclofenac',
    display_name: 'Diclofenac 50mg',
    drug_class: 'NSAID',
    common_dose: '50mg two or three times daily',
    aliases: ['diclofenac', 'diclofenac 50mg', 'voveran'],
    safer_alternative: 'Acetaminophen',
    notes: 'Avoid in ulcer history and anticoagulant therapy.',
  },
  {
    generic_name: 'naproxen',
    display_name: 'Naproxen 250mg',
    drug_class: 'NSAID',
    common_dose: '250mg to 500mg twice daily',
    aliases: ['naproxen', 'naproxen 250mg'],
    safer_alternative: 'Acetaminophen',
    notes: 'Avoid in ulcer history and anticoagulant therapy.',
  },
];

const interactionSeeds = [
  ['ibuprofen', 'warfarin', 'high', 'Combining Ibuprofen with Warfarin can significantly increase bleeding risk.', 'Replace Ibuprofen with Acetaminophen if clinically appropriate and review anticoagulant safety.'],
  ['ibuprofen', 'aspirin', 'high', 'Ibuprofen with Aspirin increases gastrointestinal irritation and bleeding risk.', 'Review need for dual NSAID or antiplatelet exposure before dispensing.'],
  ['warfarin', 'aspirin', 'high', 'Warfarin with Aspirin can markedly increase bleeding risk.', 'Confirm indication and monitoring plan before continuing this combination.'],
  ['diclofenac', 'warfarin', 'high', 'Diclofenac can increase bleeding risk when combined with Warfarin.', 'Avoid Diclofenac and choose a safer analgesic when possible.'],
  ['naproxen', 'warfarin', 'high', 'Naproxen with Warfarin can significantly increase bleeding risk.', 'Avoid Naproxen and review safer alternatives.'],
  ['prednisone', 'ibuprofen', 'moderate', 'Prednisone and Ibuprofen together may increase gastric irritation and ulcer risk.', 'Consider gastroprotection or a non-NSAID analgesic.'],
  ['azithromycin', 'warfarin', 'moderate', 'Azithromycin may increase anticoagulant effect in some patients on Warfarin.', 'Review INR monitoring and counsel on bleeding signs.'],
  ['clopidogrel', 'omeprazole', 'moderate', 'Omeprazole may reduce activation of Clopidogrel.', 'Consider Pantoprazole if gastric protection is still needed.'],
  ['aspirin', 'clopidogrel', 'moderate', 'Dual antiplatelet therapy increases bleeding risk.', 'Confirm that dual antiplatelet therapy is intentional and monitored.'],
];

const conditionRiskSeeds = [
  ['ibuprofen', 'ulcer', 'moderate', 'Ibuprofen may worsen gastric irritation and ulcer history.', 'Add gastroprotection review or select a non-NSAID alternative.'],
  ['diclofenac', 'ulcer', 'moderate', 'Diclofenac may aggravate gastric ulcer history.', 'Choose a non-NSAID alternative or review gastroprotection.'],
  ['naproxen', 'ulcer', 'moderate', 'Naproxen may aggravate gastric ulcer history.', 'Choose a non-NSAID alternative or review gastroprotection.'],
  ['metformin', 'kidney', 'moderate', 'Metformin requires renal function review in patients with kidney disease.', 'Confirm renal status before continuing Metformin.'],
  ['prednisone', 'diabetes', 'moderate', 'Prednisone may worsen blood glucose control in patients with diabetes.', 'Review glucose monitoring and steroid need.'],
];

const allergyRiskSeeds = [
  ['amoxicillin', 'penicillin', 'high', 'Amoxicillin is a penicillin-family antibiotic and may be unsafe in penicillin-allergic patients.', 'Avoid Amoxicillin and verify a non-penicillin alternative.'],
];

const dosageGuidanceSeeds = [
  ['ibuprofen', 'moderate', 'Ibuprofen prescriptions should include a clear maximum daily dose and timing.', 'Confirm the intended frequency and total daily dose.'],
  ['warfarin', 'moderate', 'Warfarin therapy should include monitoring guidance and dose confirmation.', 'Verify INR follow-up and confirm the exact maintenance dose.'],
  ['metformin', 'moderate', 'Metformin should usually be taken with meals and matched to renal status.', 'Confirm meal timing and renal review details.'],
  ['prednisone', 'moderate', 'Prednisone often requires timing and taper instructions.', 'Confirm taper schedule and duration before dispensing.'],
];

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const seedReferenceData = () => {
  const insertMedication = db.prepare(`
    INSERT INTO medications (
      generic_name,
      display_name,
      drug_class,
      common_dose,
      aliases_json,
      safer_alternative,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertInteraction = db.prepare(`
    INSERT INTO interactions (
      medication_a_id,
      medication_b_id,
      severity,
      description,
      recommendation
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const insertConditionRisk = db.prepare(`
    INSERT INTO condition_risks (
      medication_id,
      condition_keyword,
      severity,
      description,
      recommendation
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const insertAllergyRisk = db.prepare(`
    INSERT INTO allergy_risks (
      medication_id,
      allergy_keyword,
      severity,
      description,
      recommendation
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const insertDosageGuidance = db.prepare(`
    INSERT INTO dosage_guidance (
      medication_id,
      severity,
      description,
      recommendation
    ) VALUES (?, ?, ?, ?)
  `);

  db.exec('BEGIN');

  try {
    db.exec(`
      DELETE FROM interactions;
      DELETE FROM condition_risks;
      DELETE FROM allergy_risks;
      DELETE FROM dosage_guidance;
      DELETE FROM medications;
    `);

    for (const medication of medicationSeeds) {
      insertMedication.run(
        medication.generic_name,
        medication.display_name,
        medication.drug_class,
        medication.common_dose,
        JSON.stringify(medication.aliases),
        medication.safer_alternative,
        medication.notes
      );
    }

    const byName = Object.fromEntries(
      db
        .prepare('SELECT id, generic_name FROM medications')
        .all()
        .map((row) => [row.generic_name, row.id])
    );

    for (const [medA, medB, severity, description, recommendation] of interactionSeeds) {
      insertInteraction.run(byName[medA], byName[medB], severity, description, recommendation);
    }

    for (const [medication, keyword, severity, description, recommendation] of conditionRiskSeeds) {
      insertConditionRisk.run(
        byName[medication],
        keyword,
        severity,
        description,
        recommendation
      );
    }

    for (const [medication, keyword, severity, description, recommendation] of allergyRiskSeeds) {
      insertAllergyRisk.run(
        byName[medication],
        keyword,
        severity,
        description,
        recommendation
      );
    }

    for (const [medication, severity, description, recommendation] of dosageGuidanceSeeds) {
      insertDosageGuidance.run(byName[medication], severity, description, recommendation);
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

seedReferenceData();

export const findDetectedMedicines = (text) => {
  const normalizedText = normalize(text);
  const rows = db.prepare('SELECT * FROM medications ORDER BY display_name').all();

  return rows
    .map((row) => {
      const aliases = JSON.parse(row.aliases_json);
      const match = aliases.find((alias) => {
        const normalizedAlias = normalize(alias);
        return (
          normalizedText === normalizedAlias ||
          normalizedText.includes(` ${normalizedAlias} `) ||
          normalizedText.startsWith(`${normalizedAlias} `) ||
          normalizedText.endsWith(` ${normalizedAlias}`) ||
          normalizedText.includes(normalizedAlias)
        );
      });

      if (!match) {
        return null;
      }

      const confidence = normalize(match) === normalize(row.generic_name) ? 95 : 90;
      return {
        id: row.id,
        key: row.generic_name,
        name: row.display_name,
        editable: row.display_name,
        confidence,
        drugClass: row.drug_class,
        commonDose: row.common_dose,
        saferAlternative: row.safer_alternative,
        notes: row.notes,
      };
    })
    .filter(Boolean);
};

export const getInteractionFindings = (medicationIds) => {
  if (medicationIds.length < 2) {
    return [];
  }

  const query = db.prepare(`
    SELECT
      interactions.severity,
      interactions.description,
      interactions.recommendation,
      a.display_name AS medication_a_name,
      b.display_name AS medication_b_name
    FROM interactions
    JOIN medications a ON a.id = interactions.medication_a_id
    JOIN medications b ON b.id = interactions.medication_b_id
    WHERE
      (interactions.medication_a_id = ? AND interactions.medication_b_id = ?)
      OR
      (interactions.medication_a_id = ? AND interactions.medication_b_id = ?)
  `);

  const findings = [];

  for (let index = 0; index < medicationIds.length; index += 1) {
    for (let inner = index + 1; inner < medicationIds.length; inner += 1) {
      const aId = medicationIds[index];
      const bId = medicationIds[inner];
      const rows = query.all(aId, bId, bId, aId);

      for (const row of rows) {
        findings.push({
          title: `${row.medication_a_name} + ${row.medication_b_name}`,
          severity: row.severity,
          description: row.description,
          recommendation: row.recommendation,
        });
      }
    }
  }

  return findings;
};

export const getConditionRisks = (medicationIds, conditions) => {
  const normalizedConditions = normalize(conditions);
  if (!normalizedConditions) {
    return [];
  }

  const query = db.prepare(`
    SELECT
      medications.display_name AS medication_name,
      condition_risks.condition_keyword,
      condition_risks.severity,
      condition_risks.description,
      condition_risks.recommendation
    FROM condition_risks
    JOIN medications ON medications.id = condition_risks.medication_id
    WHERE condition_risks.medication_id = ?
  `);

  return medicationIds.flatMap((medicationId) =>
    query
      .all(medicationId)
      .filter((row) => normalizedConditions.includes(normalize(row.condition_keyword)))
      .map((row) => ({
        title: `${row.medication_name} + ${row.condition_keyword} history`,
        severity: row.severity,
        description: row.description,
        recommendation: row.recommendation,
      }))
  );
};

export const getAllergyRisks = (medicationIds, allergies) => {
  const normalizedAllergies = normalize(allergies);
  if (!normalizedAllergies) {
    return [];
  }

  const query = db.prepare(`
    SELECT
      medications.display_name AS medication_name,
      allergy_risks.allergy_keyword,
      allergy_risks.severity,
      allergy_risks.description,
      allergy_risks.recommendation
    FROM allergy_risks
    JOIN medications ON medications.id = allergy_risks.medication_id
    WHERE allergy_risks.medication_id = ?
  `);

  return medicationIds.flatMap((medicationId) =>
    query
      .all(medicationId)
      .filter((row) => normalizedAllergies.includes(normalize(row.allergy_keyword)))
      .map((row) => ({
        title: `${row.medication_name} allergy alert`,
        severity: row.severity,
        description: row.description,
        recommendation: row.recommendation,
      }))
  );
};

export const getDosageGuidance = (medicationIds) => {
  const query = db.prepare(`
    SELECT
      medications.display_name AS medication_name,
      dosage_guidance.severity,
      dosage_guidance.description,
      dosage_guidance.recommendation
    FROM dosage_guidance
    JOIN medications ON medications.id = dosage_guidance.medication_id
    WHERE dosage_guidance.medication_id = ?
  `);

  return medicationIds.flatMap((medicationId) =>
    query.all(medicationId).map((row) => ({
      title: `${row.medication_name} dosage review`,
      severity: row.severity,
      description: row.description,
      recommendation: row.recommendation,
    }))
  );
};

export const saveAnalysisHistory = ({
  sessionId,
  userName,
  fileName,
  patientDetails,
  analysis,
}) => {
  const id = randomUUID();

  db.prepare(`
    INSERT INTO analysis_history (
      id,
      session_id,
      user_name,
      file_name,
      source,
      safety_score,
      risk_level,
      patient_age,
      patient_conditions,
      patient_allergies,
      extracted_text,
      report_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    sessionId || '',
    userName || 'Guest',
    fileName || '',
    analysis.source,
    analysis.safetyScore,
    analysis.riskLevel,
    patientDetails?.age || '',
    patientDetails?.conditions || '',
    patientDetails?.allergies || '',
    analysis.extractedText,
    JSON.stringify(analysis)
  );

  return id;
};

export const listAnalysisHistory = ({ userName, limit = 8 }) => {
  const rows = userName
    ? db
        .prepare(`
          SELECT * FROM analysis_history
          WHERE user_name = ?
          ORDER BY datetime(created_at) DESC
          LIMIT ?
        `)
        .all(userName, limit)
    : db
        .prepare(`
          SELECT * FROM analysis_history
          ORDER BY datetime(created_at) DESC
          LIMIT ?
        `)
        .all(limit);

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    fileName: row.file_name,
    source: row.source,
    safetyScore: row.safety_score,
    riskLevel: row.risk_level,
    patientAge: row.patient_age,
    patientConditions: row.patient_conditions,
    patientAllergies: row.patient_allergies,
    report: JSON.parse(row.report_json),
  }));
};

export const getMedicationCatalogPreview = () =>
  db
    .prepare(`
      SELECT generic_name, display_name, drug_class, common_dose, safer_alternative
      FROM medications
      ORDER BY display_name
    `)
    .all();
