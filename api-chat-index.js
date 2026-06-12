export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })
  try {
    const { messages, context } = req.body
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) return res.status(500).json({ ok: false, error: 'ANTHROPIC_API_KEY not set in Vercel environment variables' })

    const system = `You are a knowledgeable medical AI assistant for Mikail Kocak, 46 years old, Los Angeles CA.
Diagnosed August 2025: Type 2 Diabetes (HbA1c 14.1%), severe mixed dyslipidemia (TG 1435), diabetic nephropathy (ACR 2265).
Current medications: Losartan 25mg, Atorvastatin 40mg, Fenofibrate 145mg, Metformin 500mg x2, plus vitamins/supplements.
By June 2026: HbA1c improved to 6.1%, TG down to 388, but ACR still elevated at 2265.

PATIENT CURRENT DATA:
${context}

Your role:
- Explain lab results in clear simple language
- Compare results across time periods when asked
- Give specific actionable advice based on HIS actual values
- Flag critical values and explain significance
- Be direct and specific — he prefers straight talk
- Always recommend consulting his doctor for treatment changes
- Reference his actual history when relevant

Keep responses concise, practical, and personalized.`

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-6', max_tokens: 1024, system, messages: messages.map(m => ({ role: m.role, content: m.content })) })
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error?.message || 'API error')
    res.status(200).json({ ok: true, message: d.content[0].text })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
