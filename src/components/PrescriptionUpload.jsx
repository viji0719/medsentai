import React, { useState, useEffect } from 'react';
import { 
  CloudUpload, FileText, CheckCircle2, AlertCircle, 
  X, User, Calendar, MessageSquare, Image as ImageIcon
} from 'lucide-react';

function PrescriptionUpload({ onAnalyze, isAnalyzing }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    age: ''
  });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Cleanup preview URL if it exists
    return () => {
      if (preview && typeof preview === 'string' && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setError('');

    if (!selectedFile) return;

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    } else if (selectedFile.type === 'application/pdf') {
      setPreview('pdf-icon'); // Marker for PDF files
    } else {
      setPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError('');
  };

  const handleUpload = () => {
    if (!file) {
      setError('Please select a prescription file to upload.');
      return;
    }

    // Prepare metadata if needed, but the primary user requested components are:
    // title, file input, preview, patient details, notes, upload button.
    onAnalyze({
      file,
      patientDetails,
      notes
    });
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-text" style={{ marginBottom: '8px' }}>
        <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>Prescription Upload</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Securely digitize and analyze prescriptions using AI-powered OCR</p>
      </div>

      <div className="main-grid" style={{ gridTemplateColumns: '1fr 400px', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* UPLOAD & PREVIEW AREA */}
          <div className="card" style={{ flex: 1, minHeight: '450px', justifyContent: 'center' }}>
            <div className="card-body" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {!file ? (
                <label className="upload-area large" style={{ cursor: 'pointer', flex: 1, padding: '40px' }}>
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*,application/pdf" 
                    onChange={handleFileChange}
                  />
                  <div className="upload-icon-large" style={{ 
                    width: '72px', height: '72px', borderRadius: '50%', background: 'var(--cyan-dim)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)',
                    marginBottom: '20px'
                  }}>
                    <CloudUpload size={36} />
                  </div>
                  <h3 style={{ marginBottom: '10px' }}>Select Prescription File</h3>
                  <p style={{ maxWidth: '300px', margin: '0 auto', fontSize: '0.9rem' }}>
                    Click to browse or drag and drop. <br/>
                    Supports PNG, JPG, WEBP and PDF.
                  </p>
                </label>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan)' }}>
                      <CheckCircle2 size={18} />
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{file.name}</span>
                    </div>
                    <button onClick={handleRemoveFile} className="btn-outline" style={{ padding: '6px', borderRadius: '50%' }}>
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div style={{ 
                    flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                  }}>
                    {preview === 'pdf-icon' ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileText size={64} strokeWidth={1} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>PDF Document Attached</p>
                      </div>
                    ) : preview ? (
                      <img src={preview} alt="Prescription preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        <ImageIcon size={64} strokeWidth={1} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No preview available for this file type</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* PATIENT DETAILS & NOTES */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Analysis Parameters</div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} /> Patient Name (Optional)
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Arjun Mehta" 
                    value={patientDetails.name}
                    onChange={(e) => setPatientDetails({...patientDetails, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} /> Patient Age (Optional)
                  </label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 64" 
                    value={patientDetails.age}
                    onChange={(e) => setPatientDetails({...patientDetails, age: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={14} /> Clinical Notes
                  </label>
                  <textarea 
                    className="form-input" 
                    style={{ minHeight: '100px', resize: 'none' }}
                    placeholder="Enter dosage notes or specific concerns..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--red)', fontSize: '0.85rem', background: 'var(--red-dim)', padding: '10px', borderRadius: '8px', border: '1px solid var(--red-border)' }}>
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <button 
                  className="btn btn-primary btn-analyze" 
                  style={{ marginTop: '8px' }}
                  onClick={handleUpload}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "Processing AI Analysis..." : "Upload & Analyze"}
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="card-header">
              <div className="card-title">Digitization Status</div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Secure Transfer</span>
                  <span style={{ color: 'var(--green)' }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>OCR Engines</span>
                  <span style={{ color: 'var(--cyan)' }}>Engaged</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Format Matching</span>
                  <span style={{ color: 'var(--cyan)' }}>Precise</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionUpload;
