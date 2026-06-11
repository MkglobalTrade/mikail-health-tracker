export const runtime = 'edge'
export const maxDuration = 60

const SYSTEM_PROMPT = `Eres un experto médico especializado en diabetes, nefrología y cardiología.
Recibirás texto o imagen de resultados de laboratorio médicos.
Extrae TODOS los valores numéricos y retorna SOLO un JSON válido sin texto adicional.

Estructura exacta:
{
  "date": "YYYY-MM-DD o null",
  "values": {
    "hba1c": número o null,
    "glucose": número o null,
    "creatinine": número o null,
    "egfr": número o null,
    "acr": número o null,
    "ldl": número o null,
    "hdl": número o null,
    "triglycerides": número o null,
    "cholesterol": número o null,
    "uric_acid": número o null,
    "wbc": número o null,
    "hemoglobin": número o null,
    "platelets": número o null,
    "sodium": número o null,
    "potassium": número o null,
    "alt": número o null,
    "ast": número o null,
    "albumin": número o null,
    "tsh": número o null,
    "vitamin_d": número o null,
    "ferritin": número o null,
    "bun": número o null
  },
  "alerts": ["alertas críticas en español"],
  "summary": "resumen 2-3 oraciones en español"
}

Reglas:
- SOLO JSON, sin markdown ni explicaciones
- HbA1c >14% → usar 14.1
- Glucosa >1000 → usar 1001
- Detecta albanés, inglés o español automáticamente
- null si el valor no aparece en el documento`

export async function POST(request) {
  try {
    const { imageData, imageMime, extractedText } = await request.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('API key no configurada')

    let content = []

    if (imageData && imageMime) {
      content = [
        {
          type: 'image',
          source: { type: 'base64', media_type: imageMime, data: imageData }
        },
        { type: 'text', text: 'Extrae todos los valores de laboratorio de esta imagen y retorna el JSON.' }
      ]
    } else {
      content = [{ type: 'text', text: `Extrae valores de laboratorio:\n\n${extractedText}` }]
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'Error Anthropic API')

    const raw = data.content[0].text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(raw)

    return Response.json({ success: true, data: parsed })

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
