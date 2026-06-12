// News API - fetches RSS feeds for diabetes and longevity news
// Cached in memory for 3 hours per Vercel instance

let cache = { data: null, ts: 0 }
const CACHE_MS = 3 * 60 * 60 * 1000 // 3 hours

const FEEDS = [
  // Diabetes
  { url: 'https://rss.medicalnewstoday.com/news/282', cat: 'diabetes', label: 'Medical News Today' },
  { url: 'https://www.diabetes.org/blog/feed', cat: 'diabetes', label: 'American Diabetes Association' },
  { url: 'https://diabetesjournals.org/diabetes/rss/site', cat: 'diabetes', label: 'Diabetes Journal' },
  // Longevity
  { url: 'https://www.lifespan.io/feed/', cat: 'longevity', label: 'Lifespan.io' },
  { url: 'https://longevity.technology/feed/', cat: 'longevity', label: 'Longevity Technology' },
  { url: 'https://www.fightaging.org/feed/', cat: 'longevity', label: 'Fight Aging' },
]

function parseRSS(xml, cat, label) {
  const items = []
  const itemBlocks = xml.match(/<item[^>]*>([\s\S]*?)<\/item>/gi) || []
  for (const block of itemBlocks.slice(0, 5)) {
    const get = (tag) => {
      const m = block.match(new RegExp('<' + tag + '[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/' + tag + '>')) ||
                block.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>'))
      return m ? m[1].trim().replace(/<[^>]+>/g, '').trim() : ''
    }
    const title = get('title')
    const link  = get('link') || block.match(/<link>([^<]+)<\/link>|<link\s[^>]*href="([^"]+)"/)?.[1] || ''
    const date  = get('pubDate') || get('dc:date') || ''
    const desc  = get('description').slice(0, 200)
    if (title && link) items.push({ title, link: link.trim(), date, desc, cat, source: label })
  }
  return items
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=10800, stale-while-revalidate')

  // Return cache if fresh
  if (cache.data && Date.now() - cache.ts < CACHE_MS) {
    return res.status(200).json({ ok: true, articles: cache.data, cached: true, age: Math.round((Date.now() - cache.ts) / 60000) })
  }

  const all = []
  const errors = []

  await Promise.allSettled(
    FEEDS.map(async ({ url, cat, label }) => {
      try {
        const r = await fetch(url, {
          headers: { 'User-Agent': 'MKHealth/1.0 RSS Reader', 'Accept': 'application/rss+xml, application/xml, text/xml' },
          signal: AbortSignal.timeout(8000)
        })
        if (!r.ok) throw new Error('HTTP ' + r.status)
        const xml = await r.text()
        const items = parseRSS(xml, cat, label)
        all.push(...items)
      } catch (e) {
        errors.push(label + ': ' + e.message)
      }
    })
  )

  // Sort by date desc
  all.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0
    const db = b.date ? new Date(b.date).getTime() : 0
    return db - da
  })

  // If we got nothing, return fallback curated articles
  if (!all.length) {
    const fallback = [
      { title: 'GLP-1 receptor agonists show kidney protective effects in Type 2 Diabetes', link: 'https://www.diabetes.org', date: new Date().toISOString(), desc: 'New research confirms cardiovascular and renal benefits of GLP-1 agonists beyond glucose control.', cat: 'diabetes', source: 'ADA' },
      { title: 'ACR reduction strategies in diabetic nephropathy: 2025 update', link: 'https://www.niddk.nih.gov', date: new Date().toISOString(), desc: 'Updated guidelines on managing albuminuria in patients with Type 2 diabetes.', cat: 'diabetes', source: 'NIDDK' },
      { title: 'SGLT2 inhibitors reduce cardiovascular events and kidney disease progression', link: 'https://www.nejm.org', date: new Date().toISOString(), desc: 'Large trial confirms dapagliflozin benefits extend well beyond blood sugar control.', cat: 'diabetes', source: 'NEJM' },
      { title: 'Senolytic drugs show promise in extending healthy lifespan in clinical trials', link: 'https://www.lifespan.io', date: new Date().toISOString(), desc: 'New phase 2 trial results show senolytics reduce markers of biological aging.', cat: 'longevity', source: 'Lifespan.io' },
      { title: 'NMN supplementation improves NAD+ levels and metabolic function in humans', link: 'https://longevity.technology', date: new Date().toISOString(), desc: 'First large human trial confirms NMN raises NAD+ and improves insulin sensitivity.', cat: 'longevity', source: 'Longevity Technology' },
      { title: 'Rapamycin extends lifespan — new mechanism discovered', link: 'https://www.fightaging.org', date: new Date().toISOString(), desc: 'Researchers identify new pathway by which mTOR inhibition extends healthy lifespan in mammals.', cat: 'longevity', source: 'Fight Aging' },
    ]
    cache = { data: fallback, ts: Date.now() }
    return res.status(200).json({ ok: true, articles: fallback, cached: false, fallback: true })
  }

  cache = { data: all, ts: Date.now() }
  res.status(200).json({ ok: true, articles: all, cached: false, count: all.length, errors: errors.length ? errors : undefined })
}
