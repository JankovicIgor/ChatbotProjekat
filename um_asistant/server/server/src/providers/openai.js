// Provider wrapper: real OpenAI call if key present, else fake response
import OpenAI from 'openai';
export async function chatWithModel({ system, user, retrieved, history=[] }) {
  const key = process.env.OPENAI_API_KEY;

  const prompt = [
    'SYSTEM:\n' + system.trim(),
    'CONTEXT:\n' + (retrieved?.join('\n\n') || ''),
    'HISTORY:\n' + history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n'),
    'USER:\n' + user.trim()
  ].join('\n\n');

  if (!key || key.includes('sk-your-real-key-here')) {
    // Fake response for local testing without API key
    const hint = retrieved && retrieved.length ? ' (na osnovu lokalne baze znanja)' : '';
    return `Demo odgovor${hint}: Proverite Upis, Školarine ili Kontakt. Ako vam treba tačan iznos, otvorite zvaničnu stranicu školarina/PDF. (Napomena: ubacite OPENAI_API_KEY za prave AI odgovore.)`;
  }

  // --- Real call (uncomment after installing openai SDK if desired) ---
   
   const client = new OpenAI({ apiKey: key });
   const resp = await client.chat.completions.create({
     model: 'gpt-4o-mini',
     messages: [
       { role: 'system', content: system },
       { role: 'user', content: `Kontekst (odlomci):\n${(retrieved||[]).join('\n\n')}` },
       ...history,
      { role: 'user', content: user }
     ],
     temperature: 0.3,
     max_tokens: 300
   });
   console.log('✅ OpenAI call OK • request_id:', resp?.id, 'usage:', resp?.usage);

   return resp.choices?.[0]?.message?.content?.trim() || 'Nema odgovora.';
   

  // Using fake response since this skeleton ships without dependencies by default.
}
