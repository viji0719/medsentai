import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, Activity, AlertCircle, Users,
  BarChart2, Settings, Layers
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import { analyzePrescription, fetchAnalysisHistory } from './lib/api';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [patientDetails, setPatientDetails] = useState({
    name: 'Arjun Mehta',
    id: 'PT-2024-00847',
    age: '64',
    weight: '72',
    allergies: 'Penicillin, NSAIDs',
    conditions: 'Type 2 Diabetes, Hypertension, CKD Stage 2'
  });

  const loadHistory = async (autoMock = false) => {
    try {
      const response = await fetchAnalysisHistory('DemoUser');
      const items = response.items || [];
      setHistoryItems(items);

      if (items.length > 0) {
        setReportData(prev => {
          if (!prev) {
            const latest = items[0];
            setTimeout(() => {
              setPatientDetails({
                name: 'Arjun Mehta',
                id: 'PT-2024-00847',
                age: latest.patientAge || '64',
                weight: '72',
                allergies: latest.patientAllergies || 'Penicillin, NSAIDs',
                conditions: latest.patientConditions || 'Type 2 Diabetes, Hypertension, CKD Stage 2'
              });
            }, 0);
            return latest.report;
          }
          return prev;
        });
      } else if (autoMock) {
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            const btn = document.querySelector('.btn-analyze');
            if (btn) btn.click();
          }, 500);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory(true);
  }, []);

  const handleAnalyze = async (payload) => {
    setIsAnalyzing(true);
    try {
      const response = await analyzePrescription({
        prescriptionText: payload.text || "",
        file: uploadedFile || null,
        patientDetails: {
          age: patientDetails.age,
          conditions: patientDetails.conditions,
          allergies: patientDetails.allergies
        },
        sessionId: "demo-session",
        userName: "DemoUser"
      });
      setReportData(response);
      loadHistory();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to analyze prescription');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadHistoricalReport = (item) => {
    if (item.report) {
      setReportData(item.report);
      setPatientDetails({
        name: 'Arjun Mehta',
        id: 'PT-2024-00847',
        age: item.patientAge || patientDetails.age,
        weight: patientDetails.weight,
        allergies: item.patientAllergies || patientDetails.allergies,
        conditions: item.patientConditions || patientDetails.conditions
      });
      setCurrentView('dashboard'); // jump back if they load history from another view
    }
  };

  const navWorkspace = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'upload', icon: <FileText size={18} />, label: 'Prescription Upload' },
    { id: 'reports', icon: <Activity size={18} />, label: 'Safety Reports' },
    { id: 'db', icon: <AlertCircle size={18} />, label: 'Interaction DB' },
    { id: 'patients', icon: <Users size={18} />, label: 'Patients' },
  ];

  const navAnalytics = [
    { id: 'risk', icon: <BarChart2 size={18} />, label: 'Risk Analytics' },
    { id: 'logs', icon: <Activity size={18} />, label: 'Audit Logs' },
  ];

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <Layers size={20} strokeWidth={2.5} />
          </div>
          <span className="sidebar-title">MedSentinel AI</span>
        </div>

        <div className="nav-section">
          <div className="nav-heading">WORKSPACE</div>
          {navWorkspace.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-heading">ANALYTICS</div>
          {navAnalytics.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        <div className="nav-bottom">
          <button
            className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentView('settings')}
          >
            <Settings size={18} /> Settings
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="top-bar">
          <div></div>
          <div className="header-actions">
            <div className="status-pill">
              <div className="status-dot"></div> System Active
            </div>
            <div className="user-avatar">DR</div>
          </div>
        </div>

        {currentView === 'dashboard' ? (
          <Dashboard
            patientDetails={patientDetails}
            onPatientDetailsChange={setPatientDetails}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            reportData={reportData}
            historyItems={historyItems}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            onLoadHistory={loadHistoricalReport}
          />
        ) : (
          <div className="dashboard-wrapper" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', width: '100%', maxWidth: '500px' }}>
              <Activity size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Module not ready</h3>
              <p>The {currentView.replace('-', ' ')} interface is coming in a future update.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
