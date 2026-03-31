import React, { useState } from 'react';
import { 
  FileText, Search, Filter, Download, ExternalLink, 
  ChevronRight, Calendar, AlertTriangle, CheckCircle2 
} from 'lucide-react';

function SafetyReports({ historyItems, onLoadHistory }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredItems = historyItems?.filter(item => {
    const matchesSearch = item.patientConditions?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.riskLevel?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.riskLevel?.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-actions" style={{ marginBottom: '32px' }}>
        <div className="dashboard-header-text">
          <h1>Safety Reports Archive</h1>
          <p>Comprehensive history of analyzed prescriptions and risk assessments</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">
            <Download size={16} /> Batch Export (JSON/PDF)
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '40px', marginBottom: 0 }} 
              placeholder="Search by patient condition, medication or risk level..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} 
              onClick={() => setFilter('all')}
            >All</button>
            <button 
              className={`btn ${filter === 'high' ? 'btn-primary' : 'btn-outline'}`} 
              onClick={() => setFilter('high')}
              style={{ borderColor: filter === 'high' ? 'var(--red)' : '', backgroundColor: filter === 'high' ? 'var(--red)' : '' }}
            >High Risk</button>
            <button 
              className={`btn ${filter === 'moderate' ? 'btn-primary' : 'btn-outline'}`} 
              onClick={() => setFilter('moderate')}
              style={{ borderColor: filter === 'moderate' ? 'var(--orange)' : '', backgroundColor: filter === 'moderate' ? 'var(--orange)' : '' }}
            >Moderate</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px', background: 'transparent' }}>
            <thead style={{ background: 'var(--card-bg)' }}>
              <tr>
                <th style={{ padding: '16px' }}>Date & Time</th>
                <th>Patient Profile</th>
                <th>Safety Score</th>
                <th>Risk Level</th>
                <th>Medications</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems?.length > 0 ? (
                filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className="report-row"
                    onClick={() => onLoadHistory(item)}
                    style={{ 
                      cursor: 'pointer', 
                      background: 'rgba(255, 255, 255, 0.02)',
                      transition: 'transform 0.2s, background 0.2s'
                    }}
                  >
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={16} className="text-muted" />
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{item.patientAge}yr Patient</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.patientConditions}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '36px', height: '36px', borderRadius: '50%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `2px solid var(--${item.safetyScore >= 80 ? 'green' : item.safetyScore >= 60 ? 'orange' : 'red'})`,
                          fontSize: '0.8rem', fontWeight: 'bold'
                        }}>
                          {item.safetyScore}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${item.riskLevel === 'High' ? 'pill-red' : item.riskLevel === 'Moderate' ? 'pill-orange' : 'pill-cyan'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {item.report?.medicines?.slice(0, 3).map((m, i) => (
                          <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                            {m.name}
                          </span>
                        ))}
                        {item.report?.medicines?.length > 3 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{item.report.medicines.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" style={{ padding: '6px' }} title="Full Report">
                          <ExternalLink size={16} />
                        </button>
                        <button className="btn btn-primary" style={{ padding: '6px' }}>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <AlertTriangle size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                    <p>No reports found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SafetyReports;
