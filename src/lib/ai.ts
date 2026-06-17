export interface AIResponse {
  content: string
  sources?: Array<{ title: string; url: string }>
}

export async function askDoctor(question: string, context: string): Promise<AIResponse> {
  // For production with OpenAI API key
  if (process.env.OPENAI_API_KEY) {
    try {
      const { OpenAI } = await import('openai')
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      
      const systemPrompt = `You are Dr. AI, a knowledgeable health assistant. You provide general health information, explain lab results, discuss medications, and offer lifestyle advice. You are NOT a replacement for a real doctor. Always recommend consulting a healthcare provider for serious concerns.

Context about the user:
${context}

Be concise, empathetic, and evidence-based. Use markdown formatting. If discussing lab values, reference normal ranges.`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 800,
      })

      return {
        content: response.choices[0].message.content || 'I apologize, I could not generate a response.',
      }
    } catch (error) {
      console.error('OpenAI error:', error)
      return fallbackResponse(question)
    }
  }

  return fallbackResponse(question)
}

function fallbackResponse(question: string): AIResponse {
  const lowerQ = question.toLowerCase()
  
  if (lowerQ.includes('glucose') || lowerQ.includes('sugar') || lowerQ.includes('blood sugar')) {
    return {
      content: `## Glucose Management

**Normal ranges:**
- Fasting: 70-100 mg/dL (3.9-5.6 mmol/L)
- After meals: <140 mg/dL (<7.8 mmol/L)

**Tips for better control:**
- Monitor regularly with your Stelo CGM
- Track patterns: morning highs (dawn phenomenon), post-meal spikes
- Stay hydrated
- Regular exercise helps insulin sensitivity
- Consistent meal timing

**When to contact your doctor:**
- Consistent readings >180 mg/dL
- Frequent lows <70 mg/dL
- Symptoms of DKA (nausea, vomiting, abdominal pain)

Would you like me to analyze your recent readings?`,
    }
  }

  if (lowerQ.includes('blood pressure') || lowerQ.includes('bp') || lowerQ.includes('hypertension')) {
    return {
      content: `## Blood Pressure Guidelines

**Categories (ACC/AHA):**
- Normal: <120/<80 mmHg
- Elevated: 120-129/<80 mmHg
- Stage 1: 130-139 or 80-89 mmHg
- Stage 2: ≥140 or ≥90 mmHg
- Crisis: >180 and/or >120 mmHg — seek immediate care

**Lifestyle recommendations:**
- Reduce sodium intake (<2,300mg/day)
- Regular aerobic exercise (150 min/week)
- Maintain healthy weight
- Limit alcohol
- Manage stress (meditation, sleep)
- Potassium-rich foods (bananas, spinach)

**Track your readings:**
- Measure at same time daily
- Take 2-3 readings, average them
- Note any symptoms

Do you want to review your recent BP trends?`,
    }
  }

  if (lowerQ.includes('medication') || lowerQ.includes('pill') || lowerQ.includes('drug')) {
    return {
      content: `## Medication Safety

**General tips:**
- Take medications at the same time daily
- Use a pill organizer for complex regimens
- Set reminders on your phone
- Keep an updated list for doctor visits

**Important:**
- Never stop medications without consulting your doctor
- Report side effects promptly
- Check for interactions with new supplements
- Store medications properly (temperature, humidity)

**Track in VitaTrack:**
- Log every dose in the Medications section
- Note any side effects in the notes field
- Export your history for appointments

If you have a specific medication question, please share the name and I can provide general information.`,
    }
  }

  if (lowerQ.includes('lab') || lowerQ.includes('blood work') || lowerQ.includes('test result')) {
    return {
      content: `## Understanding Lab Results

**Common panels:**
- **CBC**: Blood cells, infection, anemia
- **CMP/BMP**: Electrolytes, kidney, liver function
- **Lipid panel**: Cholesterol, heart risk
- **HbA1c**: 3-month glucose average (target <7% for most diabetics)
- **TSH**: Thyroid function

**Normal ranges vary by lab** — always compare to your report's reference range.

**Tips:**
- Track trends over time, not single values
- Fasting requirements matter for some tests
- Hydration can affect some results
- Upload your labs to VitaTrack for easy tracking

Would you like me to explain a specific lab value? Upload your report and ask!`,
    }
  }

  if (lowerQ.includes('longevity') || lowerQ.includes('anti-aging') || lowerQ.includes('healthspan')) {
    return {
      content: `## Longevity & Healthspan

**Evidence-based pillars:**
1. **Nutrition**: Mediterranean diet, caloric awareness, protein adequacy
2. **Exercise**: Zone 2 cardio, resistance training, VO2 max work
3. **Sleep**: 7-9 hours, consistent schedule, sleep apnea screening
4. **Stress**: Cortisol management, social connection, purpose
5. **Metabolic health**: Glucose control, insulin sensitivity
6. **Preventive care**: Screenings, vaccines, dental health

**Emerging areas:**
- Rapamycin, metformin research (consult doctor)
- NAD+ precursors (NMN, NR)
- Senolytics research
- Blood donation/therapeutic phlebotomy for iron

**Track in VitaTrack:**
- Upload biomarkers regularly
- Monitor trends, not just single values
- Use the News section for latest research

What aspect of longevity interests you most?`,
    }
  }

  return {
    content: `## Hello! I'm Dr. AI 👋

I'm your health assistant. I can help you with:

- **Lab results** interpretation
- **Glucose management** and CGM data
- **Blood pressure** tracking and lifestyle tips
- **Medication** information and reminders
- **Longevity** research and biomarkers
- General health questions

**Important:** I provide general information, not medical advice. Always consult your healthcare provider for diagnosis and treatment decisions.

**What would you like to know about?** You can ask about your uploaded data, specific symptoms, or general health topics.`,
  }
}

export async function fetchHealthNews(): Promise<Array<{ id: string; title: string; content: string; category: string; sourceUrl?: string; publishedAt: string }>> {
  return getFallbackNews()
}

function getFallbackNews(): Array<{ id: string; title: string; content: string; category: string; sourceUrl?: string; publishedAt: string }> {
  return [
    {
      id: '1',
      title: 'GLP-1 Drugs Show Promise Beyond Diabetes',
      content: 'New research suggests semaglutide and similar medications may reduce cardiovascular risk and potentially impact longevity pathways.',
      category: 'Breakthrough',
      sourceUrl: 'https://www.nejm.org',
      publishedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Exercise Mimetics: The Future of Fitness?',
      content: 'Scientists are developing compounds that could simulate exercise benefits at the cellular level, potentially helping those unable to exercise.',
      category: 'Research',
      sourceUrl: 'https://www.nature.com',
      publishedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Continuous Glucose Monitoring for Non-Diabetics',
      content: 'CGM devices like Stelo are increasingly used by healthy individuals to optimize metabolic health and prevent prediabetes.',
      category: 'Technology',
      sourceUrl: 'https://www.dexcom.com',
      publishedAt: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Sleep Quality Linked to Alzheimer\'s Risk',
      content: 'Poor sleep quality in middle age may increase amyloid buildup. Sleep hygiene interventions show promise.',
      category: 'Neuroscience',
      sourceUrl: 'https://www.alz.org',
      publishedAt: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Rapamycin Trials for Aging',
      content: 'PEARL trial interim results show promising safety profile for low-dose rapamycin in healthy aging.',
      category: 'Longevity',
      sourceUrl: 'https://www.aging.org',
      publishedAt: new Date().toISOString(),
    },
  ]
}
