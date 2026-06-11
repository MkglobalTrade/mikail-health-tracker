export const runtime = 'edge'

const SYSTEM = `Medical expert. Extract ALL lab values. Return ONLY valid JSON, no markdown, no text.

{
  "date": "YYYY-MM-DD or null",
  "values": {
    "hba1c":null,"glucose":null,"creatinine":null,"egfr":null,"acr":null,"bun":null,
    "ldl":null,"hdl":null,"triglycerides":null,"cholesterol":null,
    "hemoglobin":null,"wbc":null,"platelets":null,
    "sodium":null,"potassium":null,
    "alt":null,"ast":null,"albumin":null,
    "tsh":null,"vitamin_d":null,"uric_acid":null,"ferritin":null,
    "glucose_fasting":null,"glucose_peak":null,"glucose_avg":null,"time_in_range":null
  },
  "alerts": [],
  "summary": "2-3 sentences in Spanish"
}

Rules: JSON only. HbA1c>14→14.1. Glucose>1000→1001. Handles Albanian/English/Spanish.`

export async function POST(req) {
  try {
    const { imageData, imageMime, text } = await req.json()
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) return Response.json({ ok:false, error:'API key not set in Vercel environment variables' }, { status:500 })

    const content = imageData
      ? [{ type:'image', source:{ type:'base64', media_type:imageMime, data:imageData } }, { type:'text', text:'Extract all lab values. Return JSON only.' }]
      : [{ type:'text', text:`Extract lab values:\n${text}` }]

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'x-api-key':key, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({ model:'claude-opus-4-6', max_tokens:1500, system:SYSTEM, messages:[{ role:'user', content }] })
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error?.message || 'Anthropic API error')
    const raw = d.content[0].text.trim().replace(/```json|```/g,'').trim()
    return Response.json({ ok:true, data:JSON.parse(raw) })
  } catch(e) {
    return Response.json({ ok:false, error:e.message }, { status:500 })
  }
}
