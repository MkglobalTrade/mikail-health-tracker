export const runtime = 'edge'

const SYSTEM = `You are a medical data extraction expert. Extract ALL lab values from the document.
Return ONLY a valid JSON object — no markdown, no explanation, just raw JSON.

Required structure:
{
  "date": "YYYY-MM-DD or null",
  "values": {
    "hba1c": null, "glucose": null, "creatinine": null, "egfr": null, "acr": null, "bun": null,
    "ldl": null, "hdl": null, "triglycerides": null, "cholesterol": null,
    "hemoglobin": null, "wbc": null, "platelets": null,
    "sodium": null, "potassium": null,
    "alt": null, "ast": null, "albumin": null,
    "tsh": null, "vitamin_d": null, "uric_acid": null, "ferritin": null,
    "glucose_fasting": null, "glucose_peak": null, "glucose_avg": null, "time_in_range": null,
    "systolic": null, "diastolic": null, "weight_kg": null
  },
  "alerts": [],
  "summary": "2-3 sentence clinical summary in English"
}

Rules:
- Output ONLY the JSON object, nothing else
- Use null for any value not found in the document
- Works for Albanian, English, Turkish, and Spanish documents
- HbA1c >14% → use 14.1
- Glucose >1000 → use 1001
- Extract blood pressure if present (systolic/diastolic)`

export async function POST(req) {
  try {
    const { imageData, imageMime, text } = await req.json()
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) return Response.json({ ok: false, error: 'ANTHROPIC_API_KEY not set in Vercel environment variables' }, { status: 500 })

    const content = imageData
      ? [{ type: 'image', source: { type: 'base64', media_type: imageMime, data: imageData } }, { type: 'text', text: 'Extract all lab values. Return JSON only.' }]
      : [{ type: 'text', text: `Extract all lab values from this document:\n\n${text}` }]

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-6', max_tokens: 2000, system: SYSTEM, messages: [{ role: 'user', content }] })
    })

    const d = await r.json()
    if (!r.ok) throw new Error(d.error?.message || 'Anthropic API error')

    const raw = d.content[0].text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(raw)
    return Response.json({ ok: true, data: parsed })
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 })
  }
}
