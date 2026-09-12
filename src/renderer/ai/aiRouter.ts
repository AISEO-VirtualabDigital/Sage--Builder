import type { AiProvider, AiConfig } from '../../types'
import type { AiGenerateRequest, AiGenerateResult } from './aiClient'
import { AiClient } from './aiClient'

const DEFAULT_ROUTE: AiProvider[] = ['local', 'openrouter', 'gemini', 'anthropic', 'ollama']

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
      ollama: { provider: 'ollama' },
    }
  }

  setOrder(order: AiProvider[]) {
    this.order = order
  }

  getOrder() {
    return [...this.order]
  }

  setConfig(provider: AiProvider, config: AiConfig) {
    this.configs[provider] = { ...this.configs[provider], ...config }
  }

  getConfig(provider: AiProvider) {
    return this.configs[provider]
  }

  getAllConfigs() {
    return { ...this.configs }
  }

  async generate(req: AiGenerateRequest, onStatus?: (status: AiRouterStatus) => void): Promise<AiGenerateResult> {
    const tried: AiProvider[] = []
    const errors: AiRouterStatus[] = []

    for (const provider of this.order) {
      const config = { ...this.configs[provider], ...req.config }
      if (provider !== 'local' && !config.apiKey && provider !== req.provider) continue
      if (provider === 'local' && req.provider && req.provider !== 'local') continue
      if (req.provider && req.provider !== 'local' && provider === 'local') continue

      tried.push(provider)
      onStatus?.({ provider, status: 'trying' })

      try {
        const client = new AiClient(config)
        const result = await client.generate({ ...req, provider, config })
        onStatus?.({ provider, status: 'success' })
        return result
      } catch (e) {
        const error = (e as Error).message
        errors.push({ provider, status: 'error', error })
        onStatus?.({ provider, status: 'error', error })
      }
    }

    const fallback = this.order.find(p => !tried.includes(p) && (p === 'local' || this.configs[p].apiKey))
    if (fallback) {
      onStatus?.({ provider: fallback, status: 'trying' })
      try {
        const client = new AiClient({ ...this.configs[fallback], ...req.config })
        const result = await client.generate({ ...req, provider: fallback, config: { ...this.configs[fallback], ...req.config } })
        onStatus?.({ provider: fallback, status: 'success' })
        return result
      } catch (e) {
        onStatus?.({ provider: fallback, status: 'error', error: (e as Error).message })
      }
    }

    const lastError = errors[errors.length - 1]
    throw new Error(lastError ? `All LLM providers failed. Last error (${lastError.provider}): ${lastError.error}` : 'No LLM provider available')
  }
}

export const STORAGE_KEY_ORDER = 'virtualab_ai_router_order'
export const STORAGE_KEY_CONFIGS = 'virtualab_ai_router_configs'

export function loadRouterOrder(): AiProvider[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDER)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return DEFAULT_ROUTE
}

export function saveRouterOrder(order: AiProvider[]) {
  localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(order))
}

export function loadRouterConfigs(): Record<AiProvider, AiConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIGS)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {
    local: { provider: 'local' },
    openrouter: { provider: 'openrouter' },
    gemini: { provider: 'gemini' },
    anthropic: { provider: 'anthropic' },
    ollama: { provider: 'ollama' },
  }
}

export function saveRouterConfigs(configs: Record<AiProvider, AiConfig>) {
  localStorage.setItem(STORAGE_KEY_CONFIGS, JSON.stringify(configs))
}
