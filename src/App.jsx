import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile);
      setResults(null);
      setError("");
    } else {
      setError("Please upload a valid audio file.");
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setError("");

    try {
      const response = await axios.post('http://localhost:8000/detect-birds/', formData);
      setResults(response.data);
    } catch (err) {
      setError("Analysis failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 85) return '#2e7d32';
    if (score >= 60) return '#f9a825';
    return '#d32f2f';
  };

  return (
    <div className="app-container">
      <header>
        <h1>WildWave</h1>
        <p>AI-Powered Avian Acoustic Detection</p>
      </header>

      <div 
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <input 
          type="file" 
          id="fileInput"
          accept="audio/*" 
          onChange={(e) => handleFileChange(e.target.files[0])} 
          hidden
        />
        <label htmlFor="fileInput" className="drop-label">
          <div className="upload-icon">{file ? '🎵' : '☁️'}</div>
          {file ? <strong>{file.name}</strong> : "Drag audio here or click to browse"}
        </label>
      </div>

      <button 
        onClick={uploadFile} 
        disabled={loading || !file}
        className={`action-button ${loading ? 'loading' : ''}`}
      >
        {loading ? <div className="spinner"></div> : "Identify Species"}
      </button>

      {error && <div className="error-toast">{error}</div>}

      {results && (
        <div className="results-grid">
          {results.birds.map((bird, index) => (
            <div className="bird-card" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="card-header">
                <h3>{bird.name}</h3>
                <span className="rank">#{index + 1}</span>
              </div>
              <div className="confidence-section">
                <div className="gauge-container">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path 
                      className="circle" 
                      stroke={getConfidenceColor(bird.confidence)}
                      strokeDasharray={`${bird.confidence}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                  </svg>
                  <div className="percentage">{bird.confidence}%</div>
                </div>
                <p>Match Accuracy</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;