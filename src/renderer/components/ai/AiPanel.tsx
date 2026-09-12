import { useState } from 'react'
import { AiRouter, loadRouterOrder, saveRouterOrder, loadRouterConfigs, saveRouterConfigs, type AiRouterStatus } from '../../ai/aiRouter'
import { getStoredAiConfig } from '../../ai/aiClient'
import type { AiProvider } from '../../../types'
import { useDispatch } from 'react-redux'
import { addElement } from '../../store/projectStore'

const PROVIDER_LABELS: Record<AiProvider, string> = {
  local: 'Local Mock',
  openrouter: 'OpenRouter',
  gemini: 'Gemini',
  anthropic: 'Anthropic',
  ollama: 'Ollama',
}

export default function AiPanel() {
  const dispatch = useDispatch()
  const [prompt, setPrompt] = useState('')
  const [provider, setProvider] = useState<AiProvider>(getStoredAiConfig().provider)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routerOrder, setRouterOrder] = useState<AiProvider[]>(loadRouterOrder)
  const [configs, setConfigs] = useState<Record<AiProvider, { provider: AiProvider; apiKey?: string; model?: string; endpoint?: string }>>(loadRouterConfigs)
  const [routerStatuses, setRouterStatuses] = useState<AiRouterStatus[]>([])
  const [showRouterConfig, setShowRouterConfig] = useState(false)

  const router = new AiRouter(routerOrder)
  Object.entries(configs).forEach(([p, c]) => router.setConfig(p as AiProvider, c))

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setRouterStatuses([])
    try {
      const config = { ...getStoredAiConfig(), ...configs[provider] }
      localStorage.setItem('virtualab_ai_provider', provider)
      const result = await router.generate({ prompt, provider, config }, (status) => {
        setRouterStatuses((prev) => {
          const next = [...prev.filter((s) => s.provider !== status.provider), status]
          return next
        })
      })
      for (const node of result.nodes) {
        dispatch(addElement({ type: node.type }))
      }
    } catch (e) {
      setError((e as Error).message)
    }
    setLoading(false)
  }

  const updateConfig = (p: AiProvider, field: 'apiKey' | 'model' | 'endpoint', value: string) => {
    setConfigs((prev) => {
      const next = { ...prev, [p]: { ...prev[p], provider: p, [field]: value } }
      saveRouterConfigs(next)
      return next
    })
  }

  const moveProvider = (index: number, direction: -1 | 1) => {
    setRouterOrder((prev) => {
      const next = [...prev]
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= next.length) return prev
      ;[next[index], next[newIndex]] = [next[newIndex], next[index]]
      saveRouterOrder(next)
      return next
    })
  }

  return (
    <div className="w-80 bg-sage-900 border-l border-sage-700 flex flex-col p-3 gap-3">
      <h3 className="text-sm font-semibold text-slate-200">AI Generate</h3>

      <div className="flex gap-1">
        {(routerOrder).map((p, idx) => (
          <button key={p} onClick={() => setProvider(p)} title={`${PROVIDER_LABELS[p]} (priority ${idx + 1})`} className={`flex-1 py-1 text-[10px] rounded capitalize ${provider===p?'bg-emerald-600 text-white':'bg-sage-800 text-slate-400'}`}>{p}</button>
        ))}
      </div>

      {routerStatuses.length > 0 && (
        <div className="space-y-1">
          {routerStatuses.map((s) => (
            <div key={s.provider} className="text-[10px] px-2 py-1 rounded flex items-center gap-2 bg-sage-800 text-slate-300">
              <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'success' ? 'bg-emerald-500' : s.status === 'trying' ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`} />
              <span className="capitalize">{s.provider}</span>
              <span className="text-slate-500">{s.status}</span>
              {s.error && <span className="text-red-400 truncate">{s.error}</span>}
            </div>
          ))}
        </div>
      )}

      {provider !== 'local' && (
        <div className="space-y-1">
          <input placeholder={`${provider} API key`} value={configs[provider]?.apiKey || ''} onChange={e => updateConfig(provider, 'apiKey', e.target.value)} className="px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200" />
          <input placeholder="Model (optional)" value={configs[provider]?.model || ''} onChange={e => updateConfig(provider, 'model', e.target.value)} className="px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200" />
          <input placeholder="Endpoint (optional)" value={configs[provider]?.endpoint || ''} onChange={e => updateConfig(provider, 'endpoint', e.target.value)} className="px-2 py-1 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200" />
        </div>
      )}

      <button onClick={() => setShowRouterConfig((v) => !v)} className="text-[10px] text-slate-400 hover:text-white">
        {showRouterConfig ? 'Hide Router Config' : 'Configure Router Priority'}
      </button>

      {showRouterConfig && (
        <div className="space-y-1">
          <div className="text-[10px] text-slate-400">Provider priority (top = first tried)</div>
          {routerOrder.map((p, idx) => (
            <div key={p} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-4">{idx + 1}.</span>
              <span className="flex-1 text-xs text-slate-200 capitalize">{p}</span>
              <button onClick={() => moveProvider(idx, -1)} disabled={idx === 0} className="text-[10px] px-1 disabled:opacity-30">↑</button>
              <button onClick={() => moveProvider(idx, 1)} disabled={idx === routerOrder.length - 1} className="text-[10px] px-1 disabled:opacity-30">↓</button>
            </div>
          ))}
        </div>
      )}

      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe section: e.g. 'hero with CTA for coffee shop, dark theme'" rows={4} className="w-full px-2 py-2 bg-sage-800 border border-sage-700 rounded text-xs text-slate-200" />
      <button onClick={handleGenerate} disabled={loading} className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 rounded text-xs font-semibold text-white">{loading ? 'Generating...' : 'Generate & Add to Canvas'}</button>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-[10px] text-slate-500">Router tries providers in priority order until one succeeds.</p>
    </div>
  )
}

