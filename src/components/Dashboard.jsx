import { Mic, UserRound } from 'lucide-react';
import UploadBox from './UploadBox';

function Dashboard({
  userName,
  patientDetails,
  onPatientDetailsChange,
  onAnalyze,
  onFileUpload,
  uploadedFileName,
  historyItems,
  isHistoryLoading,
  onOpenHistory,
}) {
  return (
    <section className="dashboard page-section">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>
            {userName
              ? `Hello ${userName}, let’s ensure your prescription is safe 💙`
              : 'Start a prescription safety check'}
          </h1>
          <p className="subtle-text">
            Upload a file, enter patient context, and run an explainable AI review.
          </p>
        </div>
        <div className="status-panel glass-card">
          <UserRound size={18} />
          <span>Secure patient-aware review</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <UploadBox onAnalyze={onAnalyze} onFileUpload={onFileUpload} uploadedFileName={uploadedFileName} />

        <div className="dashboard-side-column">
          <div className="glass-card patient-card">
            <div className="card-title-row">
              <h3>Patient Details</h3>
              <button className="icon-button" type="button" aria-label="Voice input">
                <Mic size={16} />
              </button>
            </div>

            <div className="form-grid">
              <label className="field-group">
                <span>Age</span>
                <input
                  className="text-input"
                  value={patientDetails.age}
                  onChange={(event) =>
                    onPatientDetailsChange({
                      ...patientDetails,
                      age: event.target.value,
                    })
                  }
                  placeholder="Enter age"
                />
              </label>

              <label className="field-group">
                <span>Medical conditions</span>
                <textarea
                  className="text-area"
                  value={patientDetails.conditions}
                  onChange={(event) =>
                    onPatientDetailsChange({
                      ...patientDetails,
                      conditions: event.target.value,
                    })
                  }
                  placeholder="Diabetes, hypertension..."
                />
              </label>

              <label className="field-group">
                <span>Allergies</span>
                <textarea
                  className="text-area"
                  value={patientDetails.allergies}
                  onChange={(event) =>
                    onPatientDetailsChange({
                      ...patientDetails,
                      allergies: event.target.value,
                    })
                  }
                  placeholder="Penicillin, peanuts..."
                />
              </label>
            </div>
          </div>

          <div className="glass-card history-card">
            <div className="card-title-row">
              <h3>Recent Reports</h3>
              <span className="status-badge">SQLite history</span>
            </div>

            <div className="history-list">
              {isHistoryLoading && <p className="subtle-text">Loading recent analyses...</p>}

              {!isHistoryLoading && historyItems.length === 0 && (
                <p className="subtle-text">
                  Saved reports will appear here after you complete an analysis.
                </p>
              )}

              {historyItems.map((item) => (
                <button
                  key={item.id}
                  className="history-item reset-button"
                  type="button"
                  onClick={() => onOpenHistory(item)}
                >
                  <div className="history-item-header">
                    <strong>{item.fileName || 'Manual prescription entry'}</strong>
                    <span className={`risk-chip ${item.riskLevel?.toLowerCase()}`}>
                      {item.riskLevel}
                    </span>
                  </div>
                  <span className="history-meta">
                    Safety score {item.safetyScore} • {item.createdAt.replace('T', ' ').slice(0, 16)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
