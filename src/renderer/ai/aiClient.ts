import type { AiProvider, AiConfig, ElementNode } from '../../types'
import { v4 as uuidv4 } from 'uuid'

export type AiGenerateRequest = {
  prompt: string
  provider: AiProvider
  config: AiConfig
  context?: { projectJson?: unknown }
}

export type AiGenerateResult = {
  nodes: ElementNode[]
  css?: string
  js?: string
}

const SYSTEM_PROMPT = `You are SAGE by Virtualab Digital AI. Generate ElementNode JSON for drag-drop builder. Valid types: container, row, column, text, heading, image, button, video, divider, html, accordion, tabs, heroSection, callToAction, googleMaps, testimonials, etc. Respond ONLY with JSON {nodes:[{type,props,styles,children}]}`

export class AiClient {
  constructor(private config: AiConfig) {}
  getConfig() { return this.config }

  async generate(req: AiGenerateRequest): Promise<AiGenerateResult> {
    switch (req.provider) {
      case 'local': return this.generateLocal(req.prompt)
      case 'openrouter': return this.generateOpenAICompatible(req, 'https://openrouter.ai/api/v1', 'meta-llama/llama-3.3-70b-instruct:free')
      case 'gemini': return this.generateOpenAICompatible(req, 'https://generativelanguage.googleapis.com/v1beta/openai', 'gemini-2.0-flash')
      case 'anthropic': return this.generateAnthropic(req)
      case 'ollama': return this.generateOllama(req)
      default: throw new Error(`Unknown provider ${req.provider}`)
    }
  }

  /** Auto-detect available Ollama models */
  static async detectOllamaModels(): Promise<string[]> {
    try {
      // Try Electron IPC first
      if (typeof window !== 'undefined' && (window as any).electronAPI?.ollamaListModels) {
        const result = await (window as any).electronAPI.ollamaListModels()
        if (result.success) return result.models
      }
      // Fallback: direct fetch
      const res = await fetch('http://localhost:11434/api/tags')
      if (!res.ok) return []
      const data = await res.json()
      return (data.models || []).map((m: any) => m.name)
    } catch {
      return []
    }
  }

  /** Check if Ollama is running */
  static async isOllamaRunning(): Promise<boolean> {
    try {
      const res = await fetch('http://localhost:11434/api/tags')
      return res.ok
    } catch {
      return false
    }
  }

  private async generateOllama(req: AiGenerateRequest): Promise<AiGenerateResult> {
    const endpoint = req.config.endpoint || 'http://localhost:11434'
    const model = req.config.model || 'llama3.1:8b'
    
    // Use /api/chat (new API) instead of /api/generate (old)
    const res = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: req.prompt },
        ],
        stream: false,
        options: { temperature: 0.3 },
      }),
    })
    if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`)
    const data = await res.json()
    const text = data.message?.content || ''
    return this.parseLlmJson(text)
  }

  private async generateOpenAICompatible(req: AiGenerateRequest, baseUrl: string, defaultModel: string): Promise<AiGenerateResult> {
    if (!req.config.apiKey) throw new Error('API key missing')
    const model = req.config.model || defaultModel
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${req.config.apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: req.prompt }],
        temperature: 0.3,
      }),
    })
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    return this.parseLlmJson(text)
  }

  private async generateAnthropic(req: AiGenerateRequest): Promise<AiGenerateResult> {
    if (!req.config.apiKey) throw new Error('Anthropic API key missing')
    const model = req.config.model || 'claude-3-5-haiku-20241022'
    const endpoint = req.config.endpoint || 'https://api.anthropic.com/v1/messages'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'x-api-key': req.config.apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: 4096, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: req.prompt }] }),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    return this.parseLlmJson(text)
  }

  private async generateLocal(prompt: string): Promise<AiGenerateResult> {
    // Mock generation for testing
    return {
      nodes: [{
        id: uuidv4(),
        type: 'container',
        props: { content: `AI generated: ${prompt}` },
        styles: { padding: '20px', backgroundColor: '#f0f0f0' },
        attributes: {},
        children: [],
      }],
    }
  }

  private parseLlmJson(text: string): AiGenerateResult {
    // Try to extract JSON from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { nodes: [{ id: uuidv4(), type: 'text', props: { content: text }, styles: {}, attributes: {}, children: [] }] }
    }
    try {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        nodes: (parsed.nodes || []).map((n: any) => ({
          id: uuidv4(),
          type: n.type || 'container',
          props: n.props || {},
          styles: n.styles || {},
          attributes: n.attributes || {},
          children: n.children || [],
        })),
        css: parsed.css,
        js: parsed.js,
      }
    } catch {
      return { nodes: [{ id: uuidv4(), type: 'text', props: { content: text }, styles: {}, attributes: {}, children: [] }] }
    }
  }
}

export function getStoredAiConfig(): { provider: AiProvider; apiKey?: string; model?: string; endpoint?: string } {
  const stored = localStorage.getItem('virtualab_ai_config')
  if (stored) {
    try { return JSON.parse(stored) } catch {}
  }
  return { provider: 'ollama', endpoint: 'http://localhost:11434', model: 'llama3.1:8b' }
}

export function setStoredAiConfig(config: { provider: AiProvider; apiKey?: string; model?: string; endpoint?: string }) {
  localStorage.setItem('virtualab_ai_config', JSON.stringify(config))
}
