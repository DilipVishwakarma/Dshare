import { useEffect, useState } from 'react';

const API_BASE = '/api';

export default function App() {
  const [status, setStatus] = useState(null);
  const [files, setFiles] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [pairingName, setPairingName] = useState('');
  const [qr, setQr] = useState(null);
  const [qrLink, setQrLink] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/status`)
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => setStatus({ status: 'offline' }));
    loadFiles();
    loadQr();
  }, []);

  const loadFiles = async () => {
    const res = await fetch(`${API_BASE}/files`);
    const data = await res.json();
    setFiles(data.files || []);
    setPendingFiles(data.pendingFiles || []);
    setHistory(data.history || []);
  };

  const loadQr = async () => {
    const res = await fetch(`${API_BASE}/qr`);
    const data = await res.json();
    setQrLink(data.link || '');
    setQr(data.qr || '');
  };

  const onUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('files', file));
    setUploading(true);
    setMessage('Uploading...');

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    setUploading(false);
    setMessage(data.ok ? `Uploaded ${data.files.length} file(s)` : 'Upload failed');
    await loadFiles();
  };

  const onClearHistory = async () => {
    await fetch(`${API_BASE}/history`, { method: 'DELETE' });
    await loadFiles();
    setMessage('History cleared');
  };

  const onPair = async () => {
    if (!pairingName.trim()) return;
    await fetch(`${API_BASE}/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceName: pairingName })
    });
    setPairingName('');
    setMessage(`Pairing request sent to ${pairingName}`);
    await loadFiles();
  };

  const onDecision = async (id, action) => {
    const res = await fetch(`${API_BASE}/${action}/${id}`, { method: 'POST' });
    const data = await res.json();
    setMessage(data.message || `Transfer ${action}d`);
    await loadFiles();
  };

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Local-first transfer app</p>
          <h1>Share files between laptop and phone over your LAN</h1>
          <p className="subtitle">Built from your project brief with a modern dashboard, upload flow, and device status.</p>
        </div>
        <div className="pill">{status?.status || 'checking'} · {status?.deviceName || 'device'}</div>
      </header>

      <section className="grid">
        <div className="card">
          <h2>Upload files</h2>
          <label className="upload-zone">
            <input type="file" multiple onChange={onUpload} />
            <span>Drag or choose files</span>
          </label>
          <p className="muted">{uploading ? 'Uploading...' : message || 'Ready to transfer files locally.'}</p>
        </div>

        <div className="card">
          <h2>Connection details</h2>
          <ul>
            <li><strong>Device:</strong> {status?.deviceName || 'Unknown'}</li>
            <li><strong>IP:</strong> {status?.ip || 'Unknown'}</li>
            <li><strong>Upload directory:</strong> {status?.uploadDir || 'local uploads'}</li>
          </ul>
          <div className="pair-box">
            <input value={pairingName} onChange={(e) => setPairingName(e.target.value)} placeholder="Device name" />
            <button onClick={onPair}>Pair device</button>
          </div>
          {qr ? <img className="qr" src={qr} alt="QR code for LAN access" /> : null}
          {qrLink ? <p className="tiny">Open: {qrLink}</p> : null}
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Transfer queue</h2>
          <button onClick={onClearHistory}>Clear history</button>
        </div>
        {files.length === 0 ? (
          <p className="muted">No files yet. Upload a file to start a transfer.</p>
        ) : (
          <ul className="file-list">
            {files.map((file) => (
              <li key={file.id}>
                <span>{file.name}</span>
                <a href={`${API_BASE}/download/${file.id}`} target="_blank" rel="noreferrer">Download</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Incoming transfers</h2>
        {pendingFiles.length === 0 ? (
          <p className="muted">No incoming transfers waiting for approval.</p>
        ) : (
          <ul className="file-list">
            {pendingFiles.map((file) => (
              <li key={file.id}>
                <span>{file.name}</span>
                <div className="action-row">
                  <button onClick={() => onDecision(file.id, 'accept')}>Accept</button>
                  <button className="reject" onClick={() => onDecision(file.id, 'reject')}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Transfer history</h2>
        {history.length === 0 ? (
          <p className="muted">No history yet.</p>
        ) : (
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <div className="tiny">{item.sender} → {item.receiver}</div>
                </div>
                <div className="tiny">{item.status}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
