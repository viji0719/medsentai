import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import ReportCard from './components/ReportCard';
import {
  analyzePrescription,
  askAssistant,
  fetchAnalysisHistory,
  loginUser,
} from './lib/api';

const emptyReport = {
  medicines: [],
  extractedText: '',
  averageConfidence: 0,
  safetyScore: 0,
  riskLevel: 'Safe',
  extractedCount: 0,
  interactions: [],
  dosageIssues: [],
  patientRisks: [],
  recommendations: [],
  recommendationHighlight: '',
  explanation: '',
  source: '',
};

const starterPrompts = [
  'Is this medicine safe?',
  'Explain this risk',
  'What is the confidence score?',
];

function App() {
  const [theme, setTheme] = useState('light');
  const [currentView, setCurrentView] = useState('landing');
  const [userName, setUserName] = useState('');
  const [draftName, setDraftName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [toast, setToast] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [historyItems, setHistoryItems] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [patientDetails, setPatientDetails] = useState({
    age: '67',
    conditions: 'Hypertension, Gastric ulcer history',
    allergies: 'Penicillin',
  });
  const [reportData, setReportData] = useState(emptyReport);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    if (currentView !== 'analysis' || !isAnalyzing) {
      return undefined;
    }

    const stageTimers = [
      window.setTimeout(() => setAnalysisStage(1), 350),
      window.setTimeout(() => setAnalysisStage(2), 980),
      window.setTimeout(() => setAnalysisStage(3), 1550),
    ];

    return () => stageTimers.forEach((timer) => window.clearTimeout(timer));
  }, [currentView, isAnalyzing]);

  const averageConfidence = useMemo(() => {
    if (medicines.length === 0) {
      return reportData.averageConfidence || 0;
    }

    return Math.round(
      medicines.reduce((sum, medicine) => sum + medicine.confidence, 0) / medicines.length
    );
  }, [medicines, reportData.averageConfidence]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(''), 2800);
  };

  const loadHistory = async (name) => {
    if (!name) {
      setHistoryItems([]);
      return;
    }

    try {
      setIsHistoryLoading(true);
      const response = await fetchAnalysisHistory(name);
      setHistoryItems(response.items || []);
    } catch (error) {
      showToast(error.message || 'Unable to load report history.');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(userName);
  }, [userName]);

  const handleLogin = async () => {
    const safeName = draftName.trim();
    if (!safeName) {
      showToast('Please enter your name to continue.');
      return;
    }

    try {
      setIsLoggingIn(true);
      const response = await loginUser(safeName);
      setUserName(response.name);
      setSessionId(response.sessionId);
      setCurrentView('dashboard');
      showToast(response.welcomeMessage);
    } catch (error) {
      showToast(error.message || 'Unable to log in right now.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAnalyze = async ({ text, file }) => {
    setAnalysisError('');
    setAnalysisStage(0);
    setCurrentView('analysis');
    setIsAnalyzing(true);

    try {
      const response = await analyzePrescription({
        prescriptionText: text,
        file: file || uploadedFile,
        patientDetails,
        sessionId,
        userName,
      });

      setUploadedFile(file || uploadedFile);
      setMedicines(response.medicines || []);
      setReportData(response);
      loadHistory(userName);
      setCurrentView('report');
      showToast('Prescription analysis completed.');
    } catch (error) {
      setAnalysisError(
        error.message ||
          'Extraction failed. Please upload an image, PDF, or paste prescription text.'
      );
      setMedicines([]);
      setReportData(emptyReport);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMedicineEdit = (id, value) => {
    setMedicines((current) =>
      current.map((medicine) =>
        medicine.id === id ? { ...medicine, editable: value } : medicine
      )
    );
  };

  const handleTryAgain = () => {
    setAnalysisError('');
    setCurrentView('dashboard');
  };

  const handleAssistantPrompt = async (message) => {
    const response = await askAssistant({
      message,
      report: {
        ...reportData,
        averageConfidence,
        medicines,
      },
    });

    return response.reply;
  };

  const riskClassName =
    reportData.riskLevel === 'High'
      ? 'high'
      : reportData.riskLevel === 'Moderate'
        ? 'moderate'
        : 'safe';

  const displayFileName = uploadedFile?.name || '';

  const openHistoryReport = (item) => {
    setReportData(item.report);
    setMedicines(item.report.medicines || []);
    setPatientDetails({
      age: item.patientAge || '',
      conditions: item.patientConditions || '',
      allergies: item.patientAllergies || '',
    });
    setCurrentView('report');
    showToast('Loaded a saved analysis report.');
  };

  return (
    <div className={`app-shell theme-${theme}`}>
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
        onNavigate={setCurrentView}
        currentView={currentView}
      />

      {currentView === 'landing' && (
        <LandingPage
          onAnalyzeClick={() => setCurrentView('welcome')}
          onGetStarted={() => setCurrentView('welcome')}
        />
      )}

      {currentView === 'welcome' && (
        <section className="welcome-screen page-section">
          <div className="floating-particles" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className={`particle particle-${(index % 4) + 1}`}
                style={{
                  left: `${8 + index * 7}%`,
                  animationDelay: `${index * 0.5}s`,
                }}
              />
            ))}
          </div>

          <div className="welcome-card glass-card">
            <div className="welcome-badge">
              <Sparkles size={16} />
              Friendly secure onboarding
            </div>
            <h1>Welcome to MedSentinel AI</h1>
            <p>Enter your name to begin your prescription safety review.</p>

            <label className="field-label" htmlFor="name-input">
              Your name
            </label>
            <input
              id="name-input"
              className="text-input"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Dr. Maya / Priya / Alex"
            />

            <button className="primary-button" onClick={handleLogin} disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <LoaderCircle size={18} className="spin-icon" />
                  Connecting...
                </>
              ) : (
                'Continue to dashboard'
              )}
            </button>

            {userName && (
              <p className="welcome-message">
                Hello {userName}, let&apos;s ensure your prescription is safe 💙
              </p>
            )}
          </div>
        </section>
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          userName={userName}
          patientDetails={patientDetails}
          onPatientDetailsChange={setPatientDetails}
          onAnalyze={handleAnalyze}
          onFileUpload={setUploadedFile}
          uploadedFileName={displayFileName}
          historyItems={historyItems}
          isHistoryLoading={isHistoryLoading}
          onOpenHistory={openHistoryReport}
        />
      )}

      {currentView === 'analysis' && (
        <section className="page-section analysis-screen">
          <div className="analysis-panel glass-card">
            <div className="analysis-spinner" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="eyebrow">Live AI extraction</p>
            <h2>Analyzing prescription using AI...</h2>
            <p>
              Running OCR, interaction checks, dosage validation, and patient-specific
              safety rules.
            </p>

            {displayFileName && <div className="file-chip">Source: {displayFileName}</div>}

            {isAnalyzing && (
              <>
                <div className="scan-preview">
                  <div className="scan-frame">
                    <div className="scan-placeholder shimmer-block">
                      <span>{displayFileName || 'Prescription text input'}</span>
                      <div className="scan-line" />
                    </div>
                  </div>
                </div>

                <div className="thinking-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="analysis-steps">
                  <div className={analysisStage >= 1 ? 'analysis-step visible' : 'analysis-step'}>
                    <strong>Medicines detected</strong>
                    <div className="inline-medicine-list">
                      <div className="mini-pill">Parsing prescription text</div>
                      <div className="mini-pill">Reading patient profile</div>
                    </div>
                  </div>

                  <div className={analysisStage >= 2 ? 'analysis-step visible' : 'analysis-step'}>
                    <strong>Risk summary</strong>
                    <p>Checking interactions, dosage issues, and patient-specific risks.</p>
                  </div>

                  <div className={analysisStage >= 3 ? 'analysis-step visible' : 'analysis-step'}>
                    <strong>AI recommendation</strong>
                    <p>Generating safer alternatives and explainable warning details.</p>
                  </div>
                </div>
              </>
            )}

            {analysisError && (
              <div className="error-banner">
                <FileWarning size={18} />
                <span>{analysisError}</span>
              </div>
            )}

            {analysisError && (
              <button className="secondary-button" onClick={handleTryAgain}>
                Return to dashboard
              </button>
            )}
          </div>
        </section>
      )}

      {currentView === 'report' && (
        <section className="page-section report-screen">
          <div className="report-header">
            <div>
              <p className="eyebrow">Safety report</p>
              <h1>Prescription Risk Overview</h1>
              <p className="subtle-text">
                Review extracted medicines, confidence scores, warnings, and safer
                alternatives.
              </p>
            </div>
            <button className="primary-button" onClick={() => setCurrentView('dashboard')}>
              Analyze another prescription
            </button>
          </div>

          <div className="report-grid">
            <div className="glass-card score-card">
              <div
                className="score-ring"
                style={{
                  background: `conic-gradient(var(--accent-blue) ${
                    reportData.safetyScore * 3.6
                  }deg, rgba(148, 163, 184, 0.18) 0deg)`,
                }}
              >
                <div className="score-ring-inner">
                  <strong>{reportData.safetyScore}</strong>
                  <span>Safety Score</span>
                </div>
              </div>

              <div className={`risk-chip ${riskClassName}`}>{reportData.riskLevel} Risk</div>
              <div className="stats-row">
                <div>
                  <strong>{medicines.length}</strong>
                  <span>Medicines detected</span>
                </div>
                <div>
                  <strong>{averageConfidence}%</strong>
                  <span>OCR confidence avg</span>
                </div>
              </div>
            </div>

            <div className="glass-card medicine-card">
              <div className="card-title-row">
                <h3>Extracted Medicines</h3>
                <span className="status-badge">
                  <ShieldCheck size={16} />
                  Editable list
                </span>
              </div>

              {medicines.length ? (
                <div className="medicine-edit-list">
                  {medicines.map((medicine) => (
                    <div className="medicine-edit-item" key={medicine.id}>
                      <input
                        className="text-input"
                        value={medicine.editable}
                        onChange={(event) =>
                          handleMedicineEdit(medicine.id, event.target.value)
                        }
                      />
                      <span className="confidence-chip">{medicine.confidence}% confidence</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="error-banner">
                  <AlertTriangle size={18} />
                  <span>No medicines extracted. Please retry with a clearer file.</span>
                </div>
              )}
            </div>

            <ReportCard
              title="Drug Interactions"
              icon={<AlertTriangle size={18} />}
              items={reportData.interactions}
            />
            <ReportCard
              title="Dosage Issues"
              icon={<FileWarning size={18} />}
              items={reportData.dosageIssues}
            />
            <ReportCard
              title="Patient-specific Risks"
              icon={<CheckCircle2 size={18} />}
              items={reportData.patientRisks}
            />

            <div className="glass-card recommendation-card">
              <div className="card-title-row">
                <h3>AI Recommendations</h3>
                <span className="status-badge">
                  <Sparkles size={16} />
                  Safer options
                </span>
              </div>
              <div className="recommendation-list">
                {reportData.recommendations.map((item) => (
                  <div key={item} className="recommendation-item">
                    {item}
                  </div>
                ))}
              </div>
              {reportData.recommendationHighlight && (
                <div className="recommendation-highlight">
                  {reportData.recommendationHighlight}
                </div>
              )}
            </div>

            <details className="glass-card explain-card">
              <summary>Why this warning?</summary>
              <p>{reportData.explanation}</p>
              <p className="subtle-text">
                Extraction source:{' '}
                {reportData.source === 'direct-text'
                  ? 'manual text'
                  : reportData.source === 'text-file'
                    ? 'text file'
                    : reportData.source === 'image-ocr'
                      ? 'image OCR'
                      : reportData.source === 'pdf-text'
                        ? 'PDF text extraction'
                        : reportData.source === 'pdf-ocr'
                          ? 'scanned PDF OCR'
                          : 'uploaded file'}
              </p>
            </details>
          </div>
        </section>
      )}

      <Chatbot prompts={starterPrompts} onPrompt={handleAssistantPrompt} />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
