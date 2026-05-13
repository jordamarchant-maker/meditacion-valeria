import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'Falta ANTHROPIC_API_KEY. Configúrala en Render → Environment Variables.'
    })
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    })
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    console.error('Error Anthropic:', err.message)
    res.status(500).json({ error: 'Error al conectar con la IA.' })
  }
})

const distPath = join(__dirname, 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
  console.log('📦 Sirviendo frontend desde dist/')
} else {
  app.get('/', (_req, res) => {
    res.json({ status: 'ok', msg: 'API lista. Frontend corre en :5173 (npm run dev)' })
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Meditación · Voz → http://localhost:${PORT}`)
})
