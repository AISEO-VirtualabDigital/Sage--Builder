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
      case 'openrouter': return this.generateOpenRouter(req)
      case 'gemini': return this.generateGemini(req)
      case 'anthropic': return this.generateAnthropic(req)
      case 'ollama': return this.generateOllama(req)
      default: throw new Error(`Unknown provider ${req.provider}`)
    }
  }

  private async generateAnthropic(req: AiGenerateRequest): Promise<AiGenerateResult> {
    if (!req.config.apiKey) throw new Error('Anthropic API key missing')
    const model = req.config.model || 'claude-3-5-haiku-20241022'
    const endpoint = req.config.endpoint || 'https://api.anthropic.com/v1/messages'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': req.config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: req.prompt }],
      }),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    return this.parseLlmJson(text)
  }

  private async generateOllama(req: AiGenerateRequest): Promise<AiGenerateResult> {
    const endpoint = req.config.endpoint || 'http://localhost:11434/api/generate'
    const model = req.config.model || 'llama3'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${SYSTEM_PROMPT}\n\nUser: ${req.prompt}`,
        stream: false,
      }),
    })
    if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`)
    const data = await res.json()
    const text = data.response || ''
    return this.parseLlmJson(text)
  }

  private async generateLocal(prompt: string): Promise<AiGenerateResult> {
    const p = prompt.toLowerCase()
    if (p.includes('hero')) {
      return { nodes: [{ id: uuidv4(), type: 'heroSection', props: { title: 'Welcome to Our Site', subtitle: prompt.slice(0,80), ctaLabel: 'Get Started', ctaHref: '#' }, styles: {}, attributes: {}, children: [] }] }
    }
    if (p.includes('cta') || p.includes('call')) {
      return { nodes: [{ id: uuidv4(), type: 'callToAction', props: { title: 'Ready to start?', content: prompt.slice(0,100), buttonLabel: 'Contact Us', buttonHref: '#' }, styles: {}, attributes: {} }] }
    }
    if (p.includes('gallery')) {
      return { nodes: [{ id: uuidv4(), type: 'imageGallery', props: { images: [], columns: 3 }, styles: {}, attributes: {} }] }
    }
    return {
      nodes: [
        { id: uuidv4(), type: 'heading', props: { content: prompt.slice(0,40) || 'AI Generated Heading', tag: 'h2' }, styles: {}, attributes: {} },
        { id: uuidv4(), type: 'text', props: { content: prompt.slice(0,200) || 'AI generated content' }, styles: {}, attributes: {} },
        { id: uuidv4(), type: 'button', props: { label: 'Learn More', href: '#' }, styles: {}, attributes: {} },
      ]
    }
  }

  private async generateOpenRouter(req: AiGenerateRequest): Promise<AiGenerateResult> {
    if (!req.config.apiKey) throw new Error('OpenRouter API key missing')
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://virtualabdigital.com',
      },
      body: JSON.stringify({
        model: req.config.model || 'openai/gpt-4o-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: req.prompt }],
        temperature: 0.7,
      })
    })
    if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return this.parseLlmJson(data.choices?.[0]?.message?.content || '')
  }

  private async generateGemini(req: AiGenerateRequest): Promise<AiGenerateResult> {
    if (!req.config.apiKey) throw new Error('Gemini API key missing')
    const model = req.config.model || 'gemini-1.5-flash'
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${req.config.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${req.prompt}` }] }] })
    })
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return this.parseLlmJson(text)
  }

  private parseLlmJson(content: string): AiGenerateResult {
    try {
      const jsonStr = content.match(/\{[\s\S]*\}/)?.[0] || content
      const parsed = JSON.parse(jsonStr)
      const nodes = (parsed.nodes || parsed.elements || []).map((n: Partial<ElementNode>) => ({ id: uuidv4(), type: n.type as ElementNode['type'] || 'text', props: n.props || {}, styles: n.styles || {}, attributes: {}, children: n.children?.map(c => ({ ...c, id: uuidv4() })) }))
      return { nodes: nodes.length ? nodes : [{ id: uuidv4(), type: 'text', props: { content }, styles: {}, attributes: {} }], css: parsed.css, js: parsed.js }
    } catch {
      return { nodes: [{ id: uuidv4(), type: 'text', props: { content }, styles: {}, attributes: {} }] }
    }
  }
}

export function getStoredAiConfig(): AiConfig {
  return {
    provider: (localStorage.getItem('virtualab_ai_provider') as AiProvider) || 'local',
    apiKey: localStorage.getItem('virtualab_ai_key') || undefined,
    model: localStorage.getItem('virtualab_ai_model') || undefined,
    endpoint: localStorage.getItem('virtualab_ai_endpoint') || undefined,
  }
}
