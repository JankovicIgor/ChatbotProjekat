// Minimal local RAG: keyword overlap search over text files in ../kb
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KB_DIR = path.resolve(__dirname, '../../../kb');

function tokenize(s){
  return (s||'').toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(Boolean);
}

function score(queryTokens, text){
  const t = tokenize(text);
  let s = 0;
  for(const q of queryTokens){
    if(t.includes(q)) s += 1;
  }
  return s;
}

export async function retrieveChunks(query, k=4){
  const queryTokens = tokenize(query);
  const files = fs.readdirSync(KB_DIR).filter(f=>f.endsWith('.txt'));
  const docs = files.map(fname => {
    const full = path.join(KB_DIR, fname);
    const txt = fs.readFileSync(full, 'utf8');
    return { fname, txt };
  });
  const ranked = docs.map(d => ({...d, score: score(queryTokens, d.txt)}))
                     .sort((a,b)=>b.score - a.score)
                     .slice(0, k)
                     .map(d => `# ${d.fname}\n${d.txt.trim()}`);
  return ranked;
}
