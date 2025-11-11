/*! Simple Chat Widget (no external deps) */
(function(){
  const API = window.UM_WIDGET_API || (location.origin + '/api/chat');
  const CLIENT_ID = window.UM_CLIENT_ID || 'metropolitan';

  // Styles
  const style = document.createElement('style');
  style.textContent = `
  .um-bubble{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:50%;
    background:#8b0c2a;color:#fff;display:flex;align-items:center;justify-content:center;
    box-shadow:0 8px 24px rgba(0,0,0,.2);cursor:pointer;font:600 18px/1 system-ui;}
  .um-panel{position:fixed;right:20px;bottom:88px;width:340px;max-height:70vh;background:#fff;
    border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,.25);display:none;flex-direction:column;overflow:hidden;}
  .um-head{background:#8b0c2a;color:#fff;padding:12px 14px;font:600 14px/1 system-ui;}
  .um-body{padding:12px;overflow-y:auto;max-height:54vh;background:#f7f7fb;}
  .um-msg{padding:10px 12px;border-radius:10px;margin:6px 0;max-width:85%;font:14px/1.35 system-ui;white-space:pre-wrap;}
  .um-you{background:#e9eef8;margin-left:auto;}
  .um-bot{background:#f3e8eb;}
  .um-input{display:flex;gap:8px;padding:10px;background:#fff;border-top:1px solid #eee;}
  .um-input input{flex:1;padding:10px;border:1px solid #ddd;border-radius:10px;font:14px system-ui;}
  .um-input button{padding:10px 14px;border:0;border-radius:10px;background:#8b0c2a;color:#fff;font:600 14px system-ui;cursor:pointer;}
  .um-status{font:12px/1.3 system-ui;opacity:.8;margin:6px 10px 0;}
  `;
  document.head.appendChild(style);

  // Elements
  const bubble = document.createElement('div');
  bubble.className = 'um-bubble';
  bubble.textContent = '💬';
  const panel = document.createElement('div');
  panel.className = 'um-panel';
  panel.innerHTML = `
    <div class="um-head">UM Asistent</div>
    <div class="um-status" id="um-status"></div>
    <div class="um-body"></div>
    <div class="um-input">
      <input placeholder="Pitaj: upis, školarine, stipendije...">
      <button>Pošalji</button>
    </div>`;
  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  const statusEl = panel.querySelector('#um-status');
  const body = panel.querySelector('.um-body');
  const input = panel.querySelector('input');
  const btn = panel.querySelector('button');

  const history = []; // [{role:'user'|'assistant', content:'...'}]

  function addMsg(text, who){
    const div = document.createElement('div');
    div.className = 'um-msg ' + (who==='you'?'um-you':'um-bot');
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  async function send(){
    const msg = (input.value||'').trim();
    if(!msg) return;
    addMsg(msg, 'you');
    input.value = '';

    const thinking = addMsg('⏳ Razmišljam…', 'bot');

    try{
      statusEl.textContent = '• povezujem se sa asistentom';
      const res = await fetch(API, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          client_id: CLIENT_ID,
          user: msg,
          history: history.slice(-8) // malo istorije za kontekst
          // retrieved: [] // možeš dodati RAG pasuse ovde po želji
        })
      });

      const rawText = await res.text();
      console.log('[BOT RESP]', res.status, rawText);

      let data = null;
      try { data = JSON.parse(rawText); } catch(e){ /* not JSON */ }

      if(!res.ok){
        const errMsg = (data && (data.error?.message || data.error)) || rawText || `HTTP ${res.status}`;
        thinking.textContent = `⚠️ Greška: ${errMsg}`;
        statusEl.textContent = '';
        return;
      }

      // Prihvati više formata: OpenAI raw ili naš wrapper sa answer
      const answer = (data && (
        data.answer?.trim?.() ||
        data.choices?.[0]?.message?.content?.trim?.()
      )) || 'Nema odgovora.';

      thinking.textContent = answer;

      history.push({ role:'user', content: msg }, { role:'assistant', content: answer });
      statusEl.textContent = '';
    }catch(e){
      console.error('[BOT ERR]', e);
      thinking.textContent = '⚠️ Server trenutno nije dostupan. Pokušajte ponovo.';
      statusEl.textContent = '';
    }
  }

  bubble.addEventListener('click', () => {
    panel.style.display = panel.style.display==='flex' ? 'none' : 'flex';
    if(panel.style.display==='flex'){ input.focus(); }
  });
  btn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if(e.key==='Enter') send(); });

  // Greet
  setTimeout(()=>{
    addMsg('Zdravo! Ja sam UM asistent za pitanja o upisu, školarinama, stipendijama i kontaktima. Pitaj slobodno. 😊', 'bot');
  }, 400);
})();
