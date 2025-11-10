// Lightweight Express server for chatbot widget
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { chatWithModel } from './providers/openai.js';
import { retrieveChunks } from './rag/retrieve.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.length===0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS: ' + origin));
  }
}));

// Health
app.get('/api/health', (_, res) => res.json({ ok:true }));

// Core chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversation=[] } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    // Guardrails: limit domain (UM admissions/info)
    const DOMAIN_NOTE = 'Odgovaraj samo na pitanja vezana za Univerzitet Metropolitan: upis, stipendije, školarine, kontakti, lokacije, programi. Ako je pitanje van ove teme, ljubazno odbij i predloži relevantne teme.';

    // RAG: retrieve context from local KB (simple keyword match for skeleton)
    const context = await retrieveChunks(message);

    // Compose messages
    const system = [
      'Ti si koristan asistent Univerziteta Metropolitan.',
      'Budi kratak, tačan i ljubazan.',
      'Ako je cifra/rok potencijalno zastareo, uputi na zvaničnu stranicu ili PDF.',
      'Nikada ne nudiš da kontaktiraš nekoga umesto korisnika; samo daj informacije i link/putanju.',
      'Ako je pitanje van teme, odbij sa kratkim objašnjenjem i predloži relevantne teme.',
      DOMAIN_NOTE
    ].join('\n');

    const reply = await chatWithModel({
      system,
      user: message,
      retrieved: context,
      history: conversation
    });

    return res.json({ reply, context });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Serve static demo (optional): ../public
// Serve static demo robustly
import { existsSync } from 'fs';


const candidates = [
  resolve(__dirname, '../../public'),   // root/public  (default na macOS/Linux)
  resolve(__dirname, '../public'),      // server/public (ako si prebacio)
  resolve(process.cwd(), '../public'),  // ako si u server/ a public je u ../public
  resolve(process.cwd(), 'public')      // ako je public odmah u server/public
];

const STATIC_DIR = candidates.find(p => existsSync(p));
console.log('Serving static from:', STATIC_DIR || '(not found)');

if (STATIC_DIR) {
  app.use('/', express.static(STATIC_DIR));
  app.get('/demo.html', (req, res) => res.sendFile(resolve(STATIC_DIR, 'demo.html')));
}

app.use('/', express.static(resolve(__dirname, '../../public')));

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
