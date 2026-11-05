import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const app = express();
const PORT = process.env.PORT || 8991;

app.use(cors());
app.use(express.json());

// List available datasets & cases
app.get('/api/cases', (req, res) => {
  try {
    const datasets = ['practice.json', 'smoke.json', 'training.json'];
    const result = {};

    for (const ds of datasets) {
      const fullPath = path.join(rootDir, ds);
      if (fs.existsSync(fullPath)) {
        const raw = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        result[ds] = raw.map((item, idx) => ({
          index: idx,
          case_id: item.world.case_id,
          condition: item.world.condition || 'ordinary',
          tickets_count: item.world.tickets.length,
          parts_count: item.world.parts.length,
        }));
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run live simulation on selected case
app.post('/api/run', (req, res) => {
  const dataset = req.body.dataset || 'practice.json';
  const index = parseInt(req.body.index ?? 0, 10);

  const scriptPath = path.join(rootDir, 'run_demo_case.py');

  execFile('python', [scriptPath, '--dataset', dataset, '--index', String(index)], {
    cwd: rootDir,
    maxBuffer: 10 * 1024 * 1024,
  }, (error, stdout, stderr) => {
    if (error) {
      console.error('Execution error:', error, stderr);
      return res.status(500).json({ error: error.message, stderr });
    }

    try {
      const parsed = JSON.parse(stdout);
      res.json(parsed);
    } catch (parseErr) {
      console.error('Failed to parse Python output:', stdout);
      res.status(500).json({ error: 'Invalid JSON from simulator', raw: stdout });
    }
  });
});

// Evaluate custom parts request ("What-If" sandbox)
app.post('/api/evaluate-custom', (req, res) => {
  const dataset = req.body.dataset || 'practice.json';
  const index = parseInt(req.body.index ?? 0, 10);
  const text = req.body.text || '';
  const v = req.body.voltage != null ? String(req.body.voltage) : '';
  const c = req.body.connector || '';
  const w = req.body.watts != null ? String(req.body.watts) : '';

  const scriptPath = path.join(rootDir, 'simulate_custom.py');
  const args = [scriptPath, '--dataset', dataset, '--index', String(index)];
  if (text) args.push('--text', text);
  if (v) args.push('--v', v);
  if (c) args.push('--c', c);
  if (w) args.push('--w', w);

  execFile('python', args, {
    cwd: rootDir,
    maxBuffer: 5 * 1024 * 1024,
  }, (error, stdout, stderr) => {
    if (error) {
      console.error('Evaluation error:', error, stderr);
      return res.status(500).json({ error: error.message, stderr });
    }

    try {
      const parsed = JSON.parse(stdout);
      res.json(parsed);
    } catch (parseErr) {
      console.error('Failed to parse Python custom output:', stdout);
      res.status(500).json({ error: 'Invalid JSON from simulator', raw: stdout });
    }
  });
});

// Overall datasets summary
app.get('/api/datasets-meta', (req, res) => {
  try {
    const meta = {
      practice: { name: 'Practice Dataset', cases: 12, file: 'practice.json', desc: '12 standard benchmark cases with varied conditions' },
      smoke: { name: 'Smoke Dataset', cases: 2, file: 'smoke.json', desc: '2 fast integrity sanity cases' },
      training: { name: 'Training Dataset', cases: 40, file: 'training.json', desc: '40 full-spectrum workshop cases' },
    };
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'PartSure AI Procurement Intelligence Server',
    version: '2.0.0 (Enhanced UI)',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend build if present
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  console.log(`PartSure AI Dashboard API server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
