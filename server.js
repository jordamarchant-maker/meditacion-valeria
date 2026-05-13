import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// ─── Texto a audio descargable ───────────────────────────────────────────────
// Divide el texto en trozos de hasta maxLen caracteres respetando frases
function splitTextForTTS(text, maxLen = 170) {
  const chunks = []
  const sentences = text.split(/(?<=[.!?\n,;])\s+|\n+/)
  let current = ''

  for (const raw of sentences) {
    const s = raw.trim()
    if (!s) continue
    const candidate = current ? current + ' ' + s : s
    if (candidate.length <= maxLen) {
      current = candidate
    } else {
      if (current) chunks.push(current)
      if (s.length <= maxLen) {
        current = s
      } else {
        // Forzar corte por palabras si la oración es muy larga
        const words = s.split(' ')
        let part = ''
        for (const word of words) {
          const cp = part ? part + ' ' + word : word
          if (cp.length <= maxLen) { part = cp }
          else { if (part) chunks.push(part); part = word }
        }
        current = part
      }
    }
  }
  if (current) chunks.push(current)
  return chunks.filter(Boolean)
}

app.post('/api/tts-download', async (req, res) => {
  const { text, lang = 'es', slow = true } = req.body

  if (!text?.trim()) return res.status(400).json({ error: 'Texto vacío' })

  try {
    const chunks = splitTextForTTS(text.trim())
    const speed = slow ? 0.3 : 0.9

    const audioBuffers = await Promise.all(
      chunks.map(async (chunk) => {
        const url =
          `https://translate.google.com/translate_tts` +
          `?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}` +
          `&ttsspeed=${speed}&client=tw-ob`

        const r = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 14; Redmi 14C) AppleWebKit/537.36 ' +
              '(KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
            Referer: 'https://translate.google.com/',
            Accept: 'audio/mpeg,audio/*;q=0.8,*/*;q=0.5',
          },
        })
        if (!r.ok) throw new Error(`Google TTS respondió ${r.status}`)
        return Buffer.from(await r.arrayBuffer())
      })
    )

    const combined = Buffer.concat(audioBuffers)
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Disposition', 'attachment; filename="meditacion-valeria.mp3"')
    res.setHeader('Content-Length', combined.length)
    res.send(combined)
  } catch (err) {
    console.error('TTS error:', err.message)
    res.status(500).json({
      error: 'No se pudo generar el audio. Revisa la conexión e intenta de nuevo.',
    })
  }
})

// ─── Frontend estático ───────────────────────────────────────────────────────
const distPath = join(__dirname, 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (_req, res) => res.sendFile(join(distPath, 'index.html')))
  console.log('📦 Sirviendo frontend desde dist/')
} else {
  app.get('/', (_req, res) =>
    res.json({ status: 'ok', msg: 'API lista. Frontend corre en :5173 (npm run dev)' })
  )
}

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Meditación ValerIA → http://localhost:${PORT}`)
})
