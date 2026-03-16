import 'dotenv/config'
import express from 'express'
import { evaluateRouter } from './routes/evaluate'
import { reactRouter } from './routes/react'
import { decideRouter } from './routes/decide'
import { reflectRouter } from './routes/reflect'

const app = express()
const port = Number(process.env.PORT || 8787)
const provider = process.env.LLM_PROVIDER || 'openai'
const resolvedBaseURL =
  provider === 'ollama'
    ? process.env.LLM_BASE_URL || 'http://127.0.0.1:11434/v1'
    : 'https://api.openai.com/v1'

console.log('[startup]', {
  port,
  engineMode: process.env.ENGINE_MODE || 'hybrid',
  provider,
  modelName: process.env.MODEL_NAME || '(missing)',
  baseURL: resolvedBaseURL,
  hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
  hasLlmApiKey: Boolean(process.env.LLM_API_KEY),
})

app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'game-agent-decision-engine',
    mode: process.env.ENGINE_MODE || 'hybrid',
    provider,
    modelName: process.env.MODEL_NAME || '(missing)',
    baseURL: resolvedBaseURL,
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    hasLlmApiKey: Boolean(process.env.LLM_API_KEY),
  })
})

app.use('/evaluate', evaluateRouter)
app.use('/react', reactRouter)
app.use('/decide', decideRouter)
app.use('/reflect', reflectRouter)

app.listen(port, () => {
  console.log(`game-agent-decision-engine listening on http://localhost:${port}`)
})
