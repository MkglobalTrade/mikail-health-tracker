import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Eres un experto médico especializado en diabetes, nefrología y cardiología/lípidos.
Recibirás texto extraído de resultados de laboratorio médicos.
Tu trabajo es extraer TODOS los valores numéricos de laboratorio y retornar SOLO un JSON válido.

El JSON debe tener exactamente esta estructura:
{
  "date": "YYYY-MM-DD o null si no se encuentra",
  "patient": "nombre del paciente o null",
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
    "rbc": número o null,
    "hemoglobin": número o null,
    "hematocrit": número o null,
    "platelets": número o null,
    "sodium": número o null,
    "potassium": número o null,
    "glucose_fasting": número o null,
    "glucose_peak": número o null,
    "glucose_avg": número o null,
    "time_in_range": número o null,
    "bun": número o null,
    "albumin": número o null,
    "alt": número o null,
    "ast": número o null,
    "vitamin_d": número o null,
    "tsh": número o null,
    "ferritin": número o null
  },
  "raw_findings": ["lista de strings con los hallazgos importantes en español"],
  "alerts": ["lista de strings con alertas críticas en español"],
  "summary": "resumen de 2-3 oraciones en español"
}

IMPORTANTE: 
- Retorna SOLO el JSON, sin texto adicional, sin markdown, sin explicaciones
- Si un valor no está presente en el documento, ponlo como null
- Para HbA1c >14%, usa el valor 14.1
- Para Glucosa >1000, usa 1001
- Para ACR, busca también "microalbumin/creatinine ratio", "albumin creatinine ratio"
- Detecta el idioma del documento (albanés, inglés, español) y extrae igualmente`

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const fileType = formData.get('fileType')
    const extractedText = formData.get('extractedText')

    let textContent = extractedText || ''

    // If image/PDF sent as base64
    const imageData = formData.get('imageData')
    const imageMime = formData.get('imageMime')

    let messages = []

    if (imageData && imageMime) {
      // Send image directly to Claude Vision
      messages = [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageMime,
              data: imageData,
            }
          },
          {
            type: 'text',
            text: 'Extrae todos los valores de laboratorio de esta imagen médica y retorna el JSON según las instrucciones.'
          }
        ]
      }]
    } else {
      // Send extracted text
      messages = [{
        role: 'user',
        content: `Extrae todos los valores de laboratorio del siguiente texto y retorna el JSON:\n\n${textContent}`
      }]
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages,
    })

    const rawText = response.content[0].text.trim()
    
    // Clean up in case Claude adds markdown
    const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(jsonStr)

    return Response.json({ success: true, data: parsed })

  } catch (error) {
    console.error('Analysis error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
