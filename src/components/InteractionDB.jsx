import React, { useState, useEffect } from 'react';
import { 
  Database, Search, Info, AlertCircle, 
  ChevronRight, ArrowUpRight, Activity, FlaskConical
} from 'lucide-react';
import { fetchMedications } from '../lib/api';

function InteractionDB() {
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMed, setSelectedMed] = useState(null);

  useEffect(() => {
    const loadMeds = async () => {
      try {
        const response = await fetchMedications();
        setMedications(response.medications || []);
        if (response.medications?.length > 0) {
          setSelectedMed(response.medications[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMeds();
  }, []);

  const filteredMeds = medications.filter(med => 
    med.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    med.drugClass?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-actions" style={{ marginBottom: '32px' }}>
        <div className="dashboard-header-text">
          <h1>Medical Knowledge Base</h1>
          <p>Reference drug-drug interactions, standard dosages, and therapeutic alternatives</p>
        </div>
        <div className="header-actions">
          <div className="status-pill green">
            <Database size={14} /> Database Online
          </div>
        </div>
      </div>

      <div className="main-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 450px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-body" style={{ padding: '20px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '48px', height: '56px', fontSize: '1rem', marginBottom: 0 }}
                  placeholder="Search medication name, class, or NDC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="card-title">Medication Catalog ({filteredMeds.length})</div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading medications...</div>
              ) : (
                <div className="med-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {filteredMeds.map((med, idx) => (
                    <div 
                      key={idx} 
                      className={`med-list-item ${selectedMed?.name === med.name ? 'active' : ''}`}
                      onClick={() => setSelectedMed(med)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', 
                        borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
                        transition: 'background 0.2s',
                        background: selectedMed?.name === med.name ? 'rgba(6, 182, 212, 0.08)' : 'transparent'
                      }}
                    >
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)'
                      }}>
                        <FlaskConical size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{med.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{med.drugClass}</div>
                      </div>
                      <ChevronRight size={18} className="text-muted" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          {selectedMed ? (
            <div className="card" style={{ position: 'sticky', top: '24px' }}>
              <div className="card-header" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{selectedMed.name}</h2>
                    <span 께={18} className="pill pill-outline-cyan" style={{ fontSize: '0.8rem' }}>{selectedMed.drugClass}</span>
                  </div>
                  <button className="btn btn-outline" style={{ padding: '8px' }}>
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
              
              <div className="card-body" style={{ padding: '24px', paddingTop: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Standard Dose</div>
                    <div style={{ fontWeight: '600', color: 'var(--cyan)' }}>{selectedMed.standardDose || "Review Lab"}</div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Safety Level</div>
                    <div style={{ fontWeight: '600', color: 'var(--green)' }}>Approved</div>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} className="text-muted" /> Therapeutic Description
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                  {selectedMed.description || `${selectedMed.name} is a member of the ${selectedMed.drugClass} class, commonly used in ${selectedMed.indication || 'the management of relevant clinical conditions'}.`}
                </p>

                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--red)' }}>
                  <AlertCircle size={16} /> Known Interactions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <strong>Anticoagulants:</strong> Simultaneous use may increase bleeding risks.
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <strong>NSAIDs:</strong> May exacerbate renal risks and gastric issues.
                  </div>
                </div>

                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} className="text-muted" /> Safer Alternatives
                </h4>
                <div className="alt-item" style={{ marginBottom: '8px' }}>
                  <div className="alt-new">{selectedMed.saferAlternative || "Clinical review required"}</div>
                  <span className="pill-safer">SAFER</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Database size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
              <p>Select a medication to view detailed safety profile and interactions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InteractionDB;
