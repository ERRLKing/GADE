import OpenAI from 'openai'
import { decisionJsonSchema } from './decisionJsonSchema'

let client: OpenAI | null = null
let cachedProviderKey = ''

function getProviderConfig() {
  const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase()
  const model = process.env.MODEL_NAME || 'gpt-5'

  if (provider === 'ollama') {
    return {
      provider,
      model,
      apiKey: process.env.LLM_API_KEY || 'ollama',
      baseURL: process.env.LLM_BASE_URL || 'http://127.0.0.1:11434/v1',
    }
  }

  return {
    provider: 'openai',
    model,
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: undefined as string | undefined,
  }
}

function getOpenAiClient(): { client: OpenAI; provider: string; model: string; baseURL?: string } {
  const config = getProviderConfig()

  if (!config.apiKey) {
    throw new Error(
      config.provider === 'ollama'
        ? 'LLM_API_KEY is missing for Ollama'
        : 'OPENAI_API_KEY is missing'
    )
  }

  const providerKey = `${config.provider}|${config.baseURL || ''}|${config.apiKey}`

  if (!client || cachedProviderKey !== providerKey) {
    client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    })
    cachedProviderKey = providerKey
  }

  return {
    client,
    provider: config.provider,
    model: config.model,
    baseURL: config.baseURL,
  }
}

async function callOllamaStructured(prompt: string, model: string, baseURL: string): Promise<string> {
  const apiBase = baseURL.replace(/\/v1\/?$/, '')
  const url = `${apiBase}/api/chat`

  console.log('[llm] attempting Ollama structured call', {
    model,
    url,
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      stream: false,
      format: decisionJsonSchema,
      options: {
        temperature: 0,
      },
      messages: [
        {
          role: 'system',
          content: 'You are a survival-agent planner. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Ollama HTTP ${response.status}: ${text}`)
  }

  const data = await response.json()

  const content = data?.message?.content
  if (!content || typeof content !== 'string') {
    throw new Error('Ollama returned empty structured content')
  }

  console.log('[llm] Ollama structured response received', {
    model,
    hasContent: true,
  })

  return content
}

export async function callModel(prompt: string): Promise<string> {
  const { client: llm, provider, model, baseURL } = getOpenAiClient()

  if (provider === 'ollama') {
    return callOllamaStructured(
      prompt,
      model,
      baseURL || 'http://127.0.0.1:11434/v1'
    )
  }

  console.log('[llm] attempting OpenAI call', {
    provider,
    model,
  })

  const response = await llm.responses.create({
    model,
    input: [
      {
        role: 'system',
        content: [
          {
            type: 'input_text',
            text: 'You are a survival-agent planner. Return only valid JSON.',
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: prompt,
          },
        ],
      },
    ],
  })

  console.log('[llm] OpenAI response received', {
    provider,
    model,
    requestId: (response as any)._request_id || null,
    hasOutputText: Boolean(response.output_text),
  })

  if (!response.output_text || !response.output_text.trim()) {
    throw new Error('OpenAI returned empty output_text')
  }

  return response.output_text
}