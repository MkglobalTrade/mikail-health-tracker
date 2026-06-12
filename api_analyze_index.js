export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  try {
    const { imageData, imageMime, text, filename } = req.body
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) return res.status(500).json({ ok: false, error: 'ANTHROPIC_API_KEY not configured in Vercel Environment Variables' })

    const SYSTEM = `You are an expert medical data extraction system. Your job is to extract ALL health data from uploaded documents.

The document may be a lab report, medical record, Stelo/CGM export, blood test, urine test, imaging report, or any health document.
It may be in Albanian, English, Turkish, or Spanish — handle all automatically.

Extract every value you find and return ONLY this JSON (no markdown, no explanation):

{
  "date": "YYYY-MM-DD or null",
  "document_type": "lab_report | cgm_export | medical_record | imaging | other",
  "patient_name": "name if found or null",
  "values": {
    "hba1c": null,
    "glucose": null,
    "creatinine": null,
    "egfr": null,
    "acr": null,
    "bun": null,
    "ldl": null,
    "hdl": null,
    "triglycerides": null,
    "cholesterol": null,
    "hemoglobin": null,
    "wbc": null,
    "platelets": null,
    "sodium": null,
    "potassium": null,
    "chloride": null,
    "co2": null,
    "alt": null,
    "ast": null,
    "albumin": null,
    "tsh": null,
    "ft4": null,
    "vitamin_d": null,
    "vitamin_b12": null,
    "ferritin": null,
    "iron": null,
    "uric_acid": null,
    "psa": null,
    "crp": null,
    "esr": null,
    "insulin": null,
    "c_peptide": null,
    "glucose_fasting": null,
    "glucose_peak": null,
    "glucose_avg": null,
    "time_in_range": null,
    "time_above": null,
    "time_below": null,
    "gmi": null,
    "systolic": null,
    "diastolic": null,
    "weight_kg": null,
    "bmi": null
  },
  "raw_findings": ["list all findings as plain text strings"],
  "alerts": ["critical abnormal values as plain text"],
  "summary": "3-4 sentence clinical summary in English explaining what this document shows and what is most important",
  "recommendations": ["2-3 specific actionable recommendations based on these results"]
}

Rules:
- Return ONLY the JSON object. Nothing before or after it.
- HbA1c > 14 → use 14.1
- Glucose > 1000 → use 1001  
- All numeric values as numbers, not strings
- If a value appears multiple times, use the most recent one
- For CGM/Stelo reports: extract glucose_fasting, glucose_peak, glucose_avg, time_in_range, gmi
- For Stelo specifically: Time in Range %, GMI, Average Glucose are key metrics`

    let content
    if (imageData && imageMime) {
      // Image or PDF sent as base64
      if (imageMime === 'application/pdf') {
        // For PDFs, tell Claude to extract text from the PDF
        content = [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: imageData } },
          { type: 'text', text: 'Extract all health and lab values from this document. Return JSON only.' }
        ]
      } else {
        content = [
          { type: 'image', source: { type: 'base64', media_type: imageMime, data: imageData } },
          { type: 'text', text: 'Extract all health and lab values from this image. Return JSON only.' }
        ]
      }
    } else if (text) {
      content = [{ type: 'text', text: `Extract all health values from this document (filename: ${filename || 'unknown'}):\n\n${text.slice(0, 50000)}` }]
    } else {
      return res.status(400).json({ ok: false, error: 'No content provided' })
    }

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 3000,
        system: SYSTEM,
        messages: [{ role: 'user', content }]
      })
    })

    const d = await r.json()
    if (!r.ok) throw new Error(d.error?.message || 'Anthropic API error: ' + r.status)

    const raw = d.content[0].text.trim().replace(/^```json\s*/,'').replace(/\s*```$/,'').trim()
    const parsed = JSON.parse(raw)
    res.status(200).json({ ok: true, data: parsed })

  } catch (e) {
    console.error('Analyze error:', e)
    res.status(500).json({ ok: false, error: e.message })
  }
}
