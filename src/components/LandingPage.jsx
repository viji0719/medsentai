import {
  Activity,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  MinusCircle,
  Pill,
  ShieldCheck,
  Syringe,
  TriangleAlert,
} from 'lucide-react';

function LandingPage({ onAnalyzeClick, onGetStarted }) {
  return (
    <main className="landing-page">
      <section className="hero-section hero-screen page-section">
        <div className="hero-copy">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            Trusted AI safety screening
          </div>
          <h1>MedSentinel AI</h1>
          <p className="hero-tagline">
            AI-Powered Prescription Safety &amp; Drug Interaction Detection
          </p>
          <p className="hero-description">
            A modern healthcare workflow for prescription OCR, medicine risk checks,
            and explainable AI guidance.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onAnalyzeClick}>
              Analyze Prescription
              <ArrowRight size={18} />
            </button>
            <button className="secondary-button" onClick={onGetStarted}>
              Explore Dashboard
            </button>
          </div>
          <div className="hero-inline-stats">
            <span>1.5M+ medication errors prevented</span>
            <span>99.2% OCR precision</span>
          </div>
        </div>

        <div className="hero-visual glass-card">
          <div className="hero-visual-overlay" aria-hidden="true" />
          <div className="visual-grid" aria-hidden="true">
            <div className="floating-icon icon-pill">
              <Pill size={28} />
            </div>
            <div className="floating-icon icon-heart">
              <HeartPulse size={28} />
            </div>
            <div className="floating-icon icon-shield">
              <ShieldCheck size={28} />
            </div>
            <div className="floating-icon icon-wave">
              <Activity size={28} />
            </div>
            <div className="floating-icon icon-care">
              <Syringe size={28} />
            </div>
          </div>
          <div className="visual-content live-preview-card">
            <div className="preview-header">
              <div>
                <span className="preview-label">Live AI Preview</span>
                <h3>Prescription Safety Command Center</h3>
              </div>
              <div className="mini-score-ring">
                <div className="mini-score-ring-track" />
                <div className="mini-score-ring-value">
                  <strong>92</strong>
                </div>
              </div>
            </div>

            <div className="preview-metrics">
              <div className="preview-metric">
                <div className="metric-icon safe">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <span>Detected Medicines</span>
                  <strong>3</strong>
                </div>
              </div>
              <div className="preview-metric">
                <div className="metric-icon alert">
                  <TriangleAlert size={16} />
                </div>
                <div>
                  <span>Safety Score</span>
                  <strong>92</strong>
                </div>
              </div>
              <div className="preview-metric">
                <div className="metric-icon neutral">
                  <MinusCircle size={16} />
                </div>
                <div>
                  <span>System Flag</span>
                  <strong>Minor interaction detected</strong>
                </div>
              </div>
            </div>

            <div className="preview-activity">
              <div className="activity-line">
                <span className="activity-dot" />
                OCR extraction complete
              </div>
              <div className="activity-line">
                <span className="activity-dot" />
                Drug interaction rules checked
              </div>
              <div className="activity-line">
                <span className="activity-dot" />
                Safer alternatives generated
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
