import type { AiProvider, AiConfig } from '../../types'
import type { AiGenerateRequest, AiGenerateResult } from './aiClient'
import { AiClient } from './aiClient'

const DEFAULT_ROUTE: AiProvider[] = ['ollama', 'openrouter', 'gemini', 'anthropic', 'local']

export type AiRouterStatus = {
  provider: AiProvider
  status: 'idle' | 'trying' | 'success' | 'error'
  error?: string
}

export class AiRouter {
  private order: AiProvider[]
  private configs: Record<AiProvider, AiConfig>

  constructor(order?: AiProvider[]) {
    this.order = order || DEFAULT_ROUTE
    this.configs = {
      local: { provider: 'local' },
      openrouter: { provider: 'openrouter' },
      gemini: { provider: 'gemini' },
      anthropic: { provider: 'anthropic' },
      ollama: { provider: 'ollama', endpoint: 'http://localhost:11434', model: 'llama3.1:8b' },
    }
  }

  setOrder(order: AiProvider[]) { this.order = order }
  getOrder() { return [...this.order] }
  setConfig(provider: AiProvider, config: AiConfig) { this.configs[provider] = { ...this.configs[provider], ...config } }
  getConfig(provider: AiProvider) { return this.configs[provider] }

  async generate(req: AiGenerateRequest, onStatus?: (status: AiRouterStatus) => void): Promise<AiGenerateResult> {
    const tried: AiProvider[] = []
    // Try preferred provider first
    const order = [req.provider, ...this.order.filter(p => p !== req.provider)]
    
    for (const provider of order) {
      const config = { ...this.configs[provider], ...req.config, provider }
      onStatus?.({ provider, status: 'trying' })
      
      try {
        const client = new AiClient(config)
        const result = await client.generate({ ...req, provider, config })
        onStatus?.({ provider, status: 'success' })
        return result
      } catch (err) {
        const errorMsg = (err as Error).message
        onStatus?.({ provider, status: 'error', error: errorMsg })
        tried.push(provider)
      }
    }
    throw new Error(`All providers failed: ${tried.join(', ')}`)
  }
}

export function loadRouterOrder(): AiProvider[] {
  try {
    const stored = localStorage.getItem('virtualab_ai_router_order')
    if (stored) return JSON.parse(stored)
  } catch {}
  return DEFAULT_ROUTE
}

export function saveRouterOrder(order: AiProvider[]) {
  localStorage.setItem('virtualab_ai_router_order', JSON.stringify(order))
}

export function loadRouterConfigs(): Record<AiProvider, AiConfig> {
  try {
    const stored = localStorage.getItem('virtualab_ai_router_configs')
    if (stored) return JSON.parse(stored)
  } catch {}
  return {
    local: { provider: 'local' },
    openrouter: { provider: 'openrouter' },
    gemini: { provider: 'gemini' },
    anthropic: { provider: 'anthropic' },
    ollama: { provider: 'ollama', endpoint: 'http://localhost:11434', model: 'llama3.1:8b' },
  }
}

export function saveRouterConfigs(configs: Record<AiProvider, AiConfig>) {
  localStorage.setItem('virtualab_ai_router_configs', JSON.stringify(configs))
}
