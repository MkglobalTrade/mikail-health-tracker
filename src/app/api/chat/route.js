export const runtime = 'edge'

export async function POST(req) {
  try {
    const { messages, context } = await req.json()
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) return Response.json({ ok: false, error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

    const system = `You are a knowledgeable medical AI assistant for Mikail Kocak, a 46-year-old patient based in Los Angeles, CA.

PATIENT CONTEXT:
${context}

Your role:
- Explain lab results in clear, understandable language
- Compare results across time periods when asked
- Give specific, actionable recommendations based on HIS actual values
- Flag critical values and explain their significance
- Be direct and specific — he prefers straight talk
- Always recommend consulting his doctor for treatment changes
- You have access to his full lab history above — use it

Keep responses concise and practical. No unnecessary disclaimers. Be the smartest medical friend he has.`

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    })

    const d = await r.json()
    if (!r.ok) throw new Error(d.error?.message || 'API error')
    return Response.json({ ok: true, message: d.content[0].text })
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 })
  }
}
