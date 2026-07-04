import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import QRCode from 'qrcode';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);

const uploadDir = process.env.UPLOAD_DIRECTORY || path.join(__dirname, '..', 'uploads');
const tempDir = path.join(uploadDir, 'accepted');
const pendingDir = path.join(uploadDir, 'pending');
const historyFile = path.join(uploadDir, 'history.json');

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(pendingDir, { recursive: true });

let history = [];
if (fs.existsSync(historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  } catch {
    history = [];
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pendingDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: Number(process.env.MAX_UPLOAD_SIZE || 1024 * 1024 * 1024) } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, deviceName: process.env.DEVICE_NAME || os.hostname(), ip: getLocalIp() });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ready', deviceName: process.env.DEVICE_NAME || os.hostname(), uploadDir, pendingCount: countFiles(pendingDir) });
});

app.post('/api/upload', upload.array('files', 20), (req, res) => {
  const files = req.files || [];
  const pendingFiles = files.map((file) => ({
    id: file.filename,
    originalName: file.originalname,
    size: file.size,
    path: file.path,
    uploadedAt: new Date().toISOString()
  }));

  history.push(...pendingFiles.map((file) => ({
    id: file.id,
    name: file.originalName,
    size: file.size,
    sender: process.env.DEVICE_NAME || os.hostname(),
    receiver: 'This device',
    status: 'Pending',
    createdAt: file.uploadedAt
  })));
  saveHistory();

  res.json({ ok: true, files: pendingFiles });
});

app.get('/api/files', (req, res) => {
  const files = listFiles(tempDir, 'accepted');
  const pendingFiles = listFiles(pendingDir, 'pending');

  res.json({ files, pendingFiles, history });
});

app.post('/api/accept/:id', (req, res) => {
  const transferId = req.params.id;
  const sourcePath = path.join(pendingDir, transferId);
  const targetPath = path.join(tempDir, transferId);

  if (!fs.existsSync(sourcePath)) {
    return res.status(404).json({ error: 'Pending file not found' });
  }

  fs.renameSync(sourcePath, targetPath);

  const historyEntry = history.find((item) => item.id === transferId);
  if (historyEntry) {
    historyEntry.status = 'Accepted';
    historyEntry.receiver = process.env.DEVICE_NAME || os.hostname();
    historyEntry.updatedAt = new Date().toISOString();
  }
  saveHistory();

  res.json({ ok: true, message: 'Transfer accepted' });
});

app.post('/api/reject/:id', (req, res) => {
  const transferId = req.params.id;
  const pendingPath = path.join(pendingDir, transferId);

  if (fs.existsSync(pendingPath)) {
    fs.unlinkSync(pendingPath);
  }

  const historyEntry = history.find((item) => item.id === transferId);
  if (historyEntry) {
    historyEntry.status = 'Rejected';
    historyEntry.updatedAt = new Date().toISOString();
  }
  saveHistory();

  res.json({ ok: true, message: 'Transfer rejected' });
});

app.get('/api/download/:id', (req, res) => {
  const filePath = path.join(tempDir, req.params.id);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.download(filePath);
});

app.delete('/api/history', (req, res) => {
  [tempDir, pendingDir].forEach((dir) => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach((name) => {
      fs.unlinkSync(path.join(dir, name));
    });
  });
  history = [];
  saveHistory();
  res.json({ ok: true });
});

app.get('/api/devices', (req, res) => {
  res.json({ devices: [{ name: process.env.DEVICE_NAME || os.hostname(), ip: getLocalIp(), platform: process.platform, online: true }] });
});

app.post('/api/pair', (req, res) => {
  const { deviceName } = req.body || {};
  history.push({
    id: crypto.randomUUID(),
    name: 'Connection request',
    size: 0,
    sender: deviceName || 'Unknown device',
    receiver: process.env.DEVICE_NAME || os.hostname(),
    status: 'Paired',
    createdAt: new Date().toISOString()
  });
  saveHistory();
  res.json({ ok: true, message: 'Pairing request received' });
});

app.get('/api/qr', async (req, res) => {
  const link = `http://${getLocalIp()}:${port}`;
  try {
    const dataUrl = await QRCode.toDataURL(link);
    res.json({ link, qr: dataUrl });
  } catch (error) {
    res.status(500).json({ error: 'QR generation failed' });
  }
});

app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.type('html').send('<h1>App is starting. Please run npm run build first.</h1>');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Local transfer backend listening on http://0.0.0.0:${port}`);
});

function saveHistory() {
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

function listFiles(dir, kind) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => fs.statSync(path.join(dir, name)).isFile())
    .map((name) => ({
      id: name,
      name,
      size: fs.statSync(path.join(dir, name)).size,
      kind,
      createdAt: fs.statSync(path.join(dir, name)).mtime.toISOString()
    }));
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((name) => fs.statSync(path.join(dir, name)).isFile()).length;
}

function getLocalIp() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName of Object.keys(networkInterfaces)) {
    for (const config of networkInterfaces[interfaceName] || []) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return '127.0.0.1';
}
