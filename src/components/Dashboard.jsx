import React, { useState } from 'react';
import {
  Download, Plus, CloudUpload, Users, Type, AlertTriangle,
  RefreshCw, Clock, ArrowRight, AlertCircle, CheckCircle2,
  FileText, Info, Loader2
} from 'lucide-react';
import { createUploadPayload } from '../lib/api';

function Dashboard({
  patientDetails,
  onPatientDetailsChange,
  onAnalyze,
  isAnalyzing,
  reportData,
  historyItems,
  uploadedFile,
  setUploadedFile,
  onLoadHistory
}) {
  const [dragActive, setDragActive] = useState(false);
  const [isPreparingFile, setIsPreparingFile] = useState(false);
  const [textValue, setTextValue] = useState('Tab. Metformin 500mg - twice daily\nTab. Amlodipine 5mg - once daily\nTab. Warfarin 5mg - once daily\nTab. Ibuprofen 400mg - SOS for pain');

  const handleSelectedFile = async (file) => {
    if (!file) return;
    try {
      setIsPreparingFile(true);
      const payload = await createUploadPayload(file);
      setUploadedFile(payload);
    } finally {
      setIsPreparingFile(false);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    await handleSelectedFile(file);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    await handleSelectedFile(file);
  };

  const getRiskColor = (level) => {
    if (level === 'High') return 'red';
    if (level === 'Moderate') return 'orange';
    return 'cyan';
  };

  const getAlertClass = (severity) => {
    if (severity === 'High') return 'major';
    if (severity === 'Moderate') return 'moderate';
    return 'minor';
  };

  const stats = React.useMemo(() => {
    if (!historyItems || historyItems.length === 0) {
      return { count: 0, highSeverity: 0, prevented: 0, avgScore: 100 };
    }
    const count = historyItems.length;
    let highSeverity = 0;
    let prevented = 0;
    let totalScore = 0;

    historyItems.forEach(item => {
      totalScore += (item.safetyScore || 100);
      if (item.riskLevel === 'High') highSeverity++;
      if (item.report) {
        prevented += (item.report.dosageIssues?.length || 0);
        prevented += (item.report.patientRisks?.length || 0);
      }
    });

    return {
      count,
      highSeverity,
      prevented,
      avgScore: Math.round(totalScore / count)
    };
  }, [historyItems]);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-actions">
        <div className="dashboard-header-text">
          <h1>Prescription Safety Analysis</h1>
          <p>AI-powered drug interaction &amp; risk detection system</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">
            <Download size={16} /> Export Report
          </button>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <Plus size={18} /> New Analysis
          </button>
        </div>
      </div>

      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-title">Prescriptions Analyzed</span>
          <span className="metric-value">{stats.count === 0 ? '--' : stats.count}</span>
          <span className="metric-sub green">Total records found</span>
        </div>
        <div className="metric-card">
          <span className="metric-title">High Risk Flagged</span>
          <span className="metric-value red">{stats.highSeverity === 0 ? '--' : stats.highSeverity}</span>
          <span className="metric-sub red">Critical severity events</span>
        </div>
        <div className="metric-card">
          <span className="metric-title">Issues Detected</span>
          <span className="metric-value cyan">{stats.prevented === 0 ? '--' : stats.prevented}</span>
          <span className="metric-sub cyan">Dosage &amp; patient alerts</span>
        </div>
        <div className="metric-card">
          <span className="metric-title">Avg Risk Score</span>
          <span className="metric-value orange">{stats.count === 0 ? '--' : stats.avgScore}</span>
          <span className="metric-sub orange">Historical moving average</span>
        </div>
      </div>

      <div className="main-grid">
        {/* LEFT COL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div className="card upload-card">
            <label
              className={`upload-area ${dragActive ? 'active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <input type="file" accept="image/*,.pdf,.txt" hidden onChange={handleFileChange} />
              <div className="upload-icon">
                <CloudUpload size={24} />
              </div>
              <div className="upload-text">
                <h3>Upload Prescription</h3>
                <p>Drag &amp; drop or click to browse. OCR will extract medicine names automatically.</p>
              </div>
              <div className="upload-pills">
                <span className="upload-pill">.PDF</span>
                <span className="upload-pill">.PNG</span>
                <span className="upload-pill">.JPG</span>
                <span className="upload-pill">.TXT</span>
              </div>
            </label>
            {uploadedFile && (
              <div style={{ padding: '0 20px 20px', fontSize: '0.85rem', color: 'var(--cyan)' }}>
                File attached: {uploadedFile.name}
              </div>
            )}
            {isPreparingFile && (
              <div style={{ padding: '0 20px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Preparing file...
              </div>
            )}
            <div style={{ padding: '0 20px 20px' }}>
              <textarea
                className="form-input"
                style={{ width: '100%', minHeight: '60px', marginBottom: '0' }}
                placeholder="Or paste prescription text manually..."
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Users size={18} className="text-muted" /> Patient Details
              </div>
              <span className="pill pill-outline-cyan">Required</span>
            </div>
            <div className="card-body form-grid">
              <div className="form-group">
                <label>Age</label>
                <input type="text" className="form-input" value={patientDetails.age} onChange={(e) => onPatientDetailsChange({ ...patientDetails, age: e.target.value })} placeholder="e.g. 64 years" />
              </div>
              <div className="form-group">
                <label>Weight</label>
                <input type="text" className="form-input" value={patientDetails.weight} onChange={(e) => onPatientDetailsChange({ ...patientDetails, weight: e.target.value })} placeholder="e.g. 72 kg" />
              </div>
              <div className="form-group full">
                <label>Known Allergies (comma separated)</label>
                <input type="text" className="form-input" value={patientDetails.allergies} onChange={(e) => onPatientDetailsChange({ ...patientDetails, allergies: e.target.value })} placeholder="e.g. Penicillin, NSAIDs" />
              </div>
              <div className="form-group full">
                <label>Existing Conditions (comma separated)</label>
                <input type="text" className="form-input" value={patientDetails.conditions} onChange={(e) => onPatientDetailsChange({ ...patientDetails, conditions: e.target.value })} placeholder="e.g. Type 2 Diabetes, Hypertension" />
              </div>
              <button
                className="btn btn-primary btn-analyze full"
                onClick={() => onAnalyze({ text: textValue })}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? <><Loader2 className="spin-icon" size={18} /> Analyzing...</> : 'Analyze Prescription'}
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COL - Dynamic Rendering */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Type size={18} className="text-muted" /> OCR Extraction
              </div>
              {reportData?.averageConfidence && (
                <span className="confidence">confidence: {reportData.averageConfidence}%</span>
              )}
            </div>
            <div className="card-body">
              <div className="code-block" style={{ whiteSpace: 'pre-wrap' }}>
                {reportData?.extractedText ? (
                  reportData.extractedText
                ) : (
                  <span className="text-muted">No text extracted yet. Please upload a file or run analysis.</span>
                )}
              </div>
            </div>
          </div>

          {reportData?.medicines?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Identified Drugs ({reportData.medicines.length})</div>
              </div>
              <div className="card-body">
                <div className="drug-list">
                  {reportData.medicines.map((med, idx) => (
                    <div className="drug-item" key={med.id || idx}>
                      <div className="drug-info">
                        <div className={`drug-dot cyan`}></div>
                        <div>
                          <div className="drug-name">{med.editable || med.name}</div>
                          <div className="drug-class">{med.confidence}% confidence</div>
                        </div>
                      </div>
                      {med.dosage && <div className="drug-dosage">{med.dosage}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {reportData?.riskLevel && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <AlertTriangle size={18} className="text-muted" /> Risk Assessment
                </div>
              </div>
              <div className="card-body">
                <div className="risk-score-area">
                  <div className="circle-chart">
                    <svg className="circle-svg" viewBox="0 0 36 36">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle-progress" style={{ stroke: `var(--${getRiskColor(reportData.riskLevel)})` }} strokeDashoffset={200 - (reportData.safetyScore * 2)} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="circle-text">
                      <strong style={{ color: `var(--${getRiskColor(reportData.riskLevel)})` }}>{reportData.safetyScore}</strong>
                      <span>/100</span>
                    </div>
                  </div>
                  <div className="risk-summary">
                    <div className="risk-summary-title" style={{ color: `var(--${getRiskColor(reportData.riskLevel)})` }}>
                      <AlertTriangle size={18} /> {reportData.riskLevel} Risk
                    </div>
                    <p>{reportData.explanation || 'Review the alerts below for more information.'}</p>
                  </div>
                </div>

                <div className="risk-alerts">
                  {reportData.interactions?.map((interaction, idx) => (
                    <div className="alert-item major" key={`int-${idx}`}>
                      <AlertCircle size={18} className="alert-icon" />
                      <div className="alert-content">
                        <div className="alert-header">
                          <div className="alert-title">{typeof interaction === 'string' ? interaction : interaction.title}</div>
                          <span className="badge badge-red">INTERACTION</span>
                        </div>
                        {interaction.description && <div className="alert-desc">{interaction.description}</div>}
                      </div>
                    </div>
                  ))}

                  {reportData.dosageIssues?.map((issue, idx) => (
                    <div className="alert-item moderate" key={`dos-${idx}`}>
                      <AlertCircle size={18} className="alert-icon" />
                      <div className="alert-content">
                        <div className="alert-header">
                          <div className="alert-title">{typeof issue === 'string' ? issue : issue.title}</div>
                          <span className="badge badge-orange">DOSAGE</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {reportData.patientRisks?.map((risk, idx) => (
                    <div className="alert-item minor" key={`risk-${idx}`}>
                      <Info size={18} className="alert-icon" />
                      <div className="alert-content">
                        <div className="alert-header">
                          <div className="alert-title">{typeof risk === 'string' ? risk : risk.title}</div>
                          <span className="badge badge-blue">PATIENT RISK</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bottom-cols">

            {reportData?.recommendations?.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <RefreshCw size={18} className="text-muted" /> AI Recommendations
                  </div>
                </div>
                <div className="card-body" style={{ padding: '16px' }}>
                  {reportData.recommendations.map((rec, idx) => (
                    <div className="alt-item" key={idx}>
                      <div className="alt-content">
                        <div className="alt-new">
                          <ArrowRight size={14} /> {rec}
                        </div>
                      </div>
                      <span className="pill-safer">Suggested</span>
                    </div>
                  ))}
                  {reportData.recommendationHighlight && (
                    <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--cyan)' }}>
                      {reportData.recommendationHighlight}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Clock size={18} className="text-muted" /> Recent Analyses
                </div>
              </div>
              <div className="card-body" style={{ padding: '0 20px' }}>
                {historyItems?.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Patient Data</th>
                        <th>Score</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyItems.map((item) => (
                        <tr key={item.id} onClick={() => onLoadHistory(item)} style={{ cursor: 'pointer' }}>
                          <td>
                            <div className={`risk-level ${item.riskLevel === 'High' ? 'high' : item.riskLevel === 'Moderate' ? 'mod' : 'low'}`}>
                              {item.riskLevel}
                            </div>
                          </td>
                          <td className="patient-name" style={{ fontSize: '0.8rem' }}>
                            {item.patientAge}yr, {item.patientConditions}
                          </td>
                          <td className="td-drugs">{item.safetyScore}/100</td>
                          <td className="time-val">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-muted" style={{ padding: '20px 0', fontSize: '0.85rem' }}>No recent analyses found.</p>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
