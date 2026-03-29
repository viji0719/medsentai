import { useState } from 'react';
import { FileImage, FileText, UploadCloud } from 'lucide-react';
import { createUploadPayload } from '../lib/api';

function UploadBox({ onAnalyze, onFileUpload, uploadedFileName }) {
  const [textValue, setTextValue] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isPreparingFile, setIsPreparingFile] = useState(false);

  const handleSelectedFile = async (file) => {
    if (!file) {
      return;
    }

    try {
      setIsPreparingFile(true);
      const payload = await createUploadPayload(file);
      onFileUpload(payload);
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

  return (
    <div className="glass-card upload-card">
      <div className="card-title-row">
        <h3>Upload Prescription</h3>
        <span className="status-badge">
          <FileImage size={16} />
          Image / PDF / Text
        </span>
      </div>

      <label
        className={dragActive ? 'upload-dropzone active' : 'upload-dropzone'}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <input type="file" accept="image/*,.pdf,.txt" hidden onChange={handleFileChange} />
        <UploadCloud size={28} />
        <strong>Drag and drop prescription files here</strong>
        <span>or tap to browse from your device</span>
      </label>

      {uploadedFileName && <div className="file-chip">Uploaded: {uploadedFileName}</div>}
      {isPreparingFile && <div className="file-chip">Preparing file for analysis...</div>}

      <label className="field-group">
        <span>Paste prescription text</span>
        <textarea
          className="text-area"
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
          placeholder="Example: Tab Ibuprofen 400mg twice daily after food..."
        />
      </label>

      <div className="upload-actions">
        <div className="hint-row">
          <FileText size={16} />
          <span>OCR mistakes can be corrected after extraction.</span>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => onAnalyze({ file: null, text: textValue })}
        >
          Analyze Prescription
        </button>
      </div>
    </div>
  );
}

export default UploadBox;
