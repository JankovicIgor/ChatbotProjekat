export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);

    // CORS preflight
    if (req.method === 'OPTIONS') {
      if (!origin || allowed.includes(origin)) {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Vary': 'Origin'
          }
        });
      }
      return new Response('CORS', { status: 403 });
    }

    if (url.pathname === '/healthz') {
      return json({ ok: true, model: env.OPENAI_MODEL });
    }

    if (url.pathname === '/api/chat' && req.method === 'POST') {
      if (origin && allowed.length && !allowed.includes(origin)) {
        return json({ error: `Not allowed by CORS: ${origin}` }, 403, origin);
      }
      const body = await req.json().catch(()=> ({}));
      const {
        client_id = 'default',
        user = '',
        history = [],
        retrieved = [],
        system = defaultSystem(client_id)
      } = body;

      const model = pickModelFor(client_id, env.OPENAI_MODEL);

      const payload = {
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Context:\n${(retrieved||[]).join('\n\n')}` },
          ...history,
          { role: 'user', content: user }
        ],
        temperature: 0.5,
        max_tokens: 350
      };

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const text = await r.text();
      return new Response(text, {
        status: r.status,
        headers: {
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': origin || '*',
          'Vary': 'Origin'
        }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};

function json(obj, status=200, origin='*') {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
      'Vary': 'Origin'
    }
  });
}

function defaultSystem(client_id) {
  const base = [
    'You are an assistant for a university.',
    'Answer only about admissions, tuition, programs, deadlines, locations, contacts.',
    'Politely refuse off-topic questions and suggest relevant topics.',
    'Never offer to contact someone on the user’s behalf; provide info/links only.',
    'Reply in the user’s language (Serbian/English/Russian or the language used).',
    'Tone: warm, concise, helpful.'
  ];
  if (client_id === 'metropolitan') {
    base.push('Institution: Univerzitet Metropolitan (Belgrade/Niš).');
  }
  return base.join('\n');
}

function pickModelFor(client_id, fallback) {
  const map = {
    'metropolitan': 'gpt-4o-mini',
    // 'gym-xyz': 'gpt-4o-mini',
  };
  return map[client_id] || fallback || 'gpt-4o-mini';
}
