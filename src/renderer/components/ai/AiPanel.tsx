import { useState, useEffect } from 'react'
import { AiRouter, loadRouterOrder, saveRouterOrder, loadRouterConfigs, saveRouterConfigs, type AiRouterStatus } from '../../ai/aiRouter'
import { AiClient, getStoredAiConfig, setStoredAiConfig } from '../../ai/aiClient'
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
  const [routerOrder] = useState<AiProvider[]>(loadRouterOrder)
  const [configs, setConfigs] = useState(loadRouterConfigs)
  const [routerStatuses, setRouterStatuses] = useState<AiRouterStatus[]>([])
  const [showRouterConfig, setShowRouterConfig] = useState(false)
  const [ollamaModels, setOllamaModels] = useState<string[]>([])
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // Auto-detect Ollama models on mount
  useEffect(() => {
    let mounted = true
    async function detectModels() {
      setOllamaStatus('checking')
      const running = await AiClient.isOllamaRunning()
      if (!mounted) return
      if (running) {
        setOllamaStatus('online')
        const models = await AiClient.detectOllamaModels()
        if (mounted && models.length > 0) {
          setOllamaModels(models)
          // Auto-select first model if none selected
          const currentConfig = configs.ollama
          if (!currentConfig.model && models.length > 0) {
            updateConfig('ollama', 'model', models[0])
          }
        }
      } else {
        setOllamaStatus('offline')
      }
    }
    detectModels()
    const interval = setInterval(detectModels, 30000) // refresh every 30s
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  const router = new AiRouter(routerOrder)
  Object.entries(configs).forEach(([p, c]) => router.setConfig(p as AiProvider, c))

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setRouterStatuses([])
    try {
      const config = { ...getStoredAiConfig(), ...configs[provider] }
      setStoredAiConfig(config)
      const result = await router.generate({ prompt, provider, config }, (status: AiRouterStatus) => {
        setRouterStatuses((prev) => [...prev.filter((s) => s.provider !== status.provider), status])
      })
      for (const node of result.nodes) {
        dispatch(addElement({ type: node.type }))
      }
      if (result.css) dispatch({ type: 'project/setCustomCode', payload: { css: result.css } })
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

  return (
    <div className="w-80 bg-sage-900 border-l border-sage-700 flex flex-col p-3 gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">AI Generate</h3>
        <button onClick={() => setShowRouterConfig(!showRouterConfig)} className="text-xs text-slate-400 hover:text-slate-200">⚙</button>
      </div>

      {/* Ollama status */}
      {provider === 'ollama' && (
        <div className="text-xs p-2 rounded bg-sage-800 border border-sage-700">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${ollamaStatus === 'online' ? 'bg-emerald-500' : ollamaStatus === 'checking' ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-slate-300">Ollama: {ollamaStatus}</span>
            {ollamaModels.length > 0 && <span className="text-slate-500">({ollamaModels.length} models)</span>}
          </div>
          {ollamaModels.length > 0 ? (
            <select
              value={configs.ollama?.model || ''}
              onChange={(e) => updateConfig('ollama', 'model', e.target.value)}
              className="w-full bg-sage-950 border border-sage-700 rounded px-2 py-1 text-xs text-slate-200"
            >
              {ollamaModels.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          ) : ollamaStatus === 'offline' ? (
            <p className="text-[10px] text-red-400">Run: ollama serve</p>
          ) : null}
        </div>
      )}

      {/* Provider tabs */}
      <div className="flex gap-1">
        {routerOrder.map((p, idx) => (
          <button key={p} onClick={() => setProvider(p)} title={`${PROVIDER_LABELS[p]} (priority ${idx + 1})`} className={`flex-1 py-1 text-[10px] rounded capitalize ${provider === p ? 'bg-emerald-600 text-white' : 'bg-sage-800 text-slate-400'}`}>{p}</button>
        ))}
      </div>

      {/* Config inputs */}
      {showRouterConfig && (
        <div className="space-y-2 p-2 bg-sage-800 rounded text-xs">
          {provider === 'ollama' && (
            <>
              <input value={configs.ollama?.endpoint || 'http://localhost:11434'} onChange={(e) => updateConfig('ollama', 'endpoint', e.target.value)} placeholder="Ollama endpoint" className="w-full bg-sage-950 border border-sage-700 rounded px-2 py-1 text-slate-200" />
              <input value={configs.ollama?.model || ''} onChange={(e) => updateConfig('ollama', 'model', e.target.value)} placeholder="Model (auto-detected above)" className="w-full bg-sage-950 border border-sage-700 rounded px-2 py-1 text-slate-200" />
            </>
          )}
          {provider === 'openrouter' && <input value={configs.openrouter?.apiKey || ''} onChange={(e) => updateConfig('openrouter', 'apiKey', e.target.value)} placeholder="OpenRouter API key" type="password" className="w-full bg-sage-950 border border-sage-700 rounded px-2 py-1 text-slate-200" />}
          {provider === 'gemini' && <input value={configs.gemini?.apiKey || ''} onChange={(e) => updateConfig('gemini', 'apiKey', e.target.value)} placeholder="Gemini API key" type="password" className="w-full bg-sage-950 border border-sage-700 rounded px-2 py-1 text-slate-200" />}
          {provider === 'anthropic' && <input value={configs.anthropic?.apiKey || ''} onChange={(e) => updateConfig('anthropic', 'apiKey', e.target.value)} placeholder="Anthropic API key" type="password" className="w-full bg-sage-950 border border-sage-700 rounded px-2 py-1 text-slate-200" />}
        </div>
      )}

      {/* Prompt input */}
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe what to build..." rows={4} className="w-full bg-sage-950 border border-sage-700 rounded p-2 text-sm text-slate-200 resize-none" onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleGenerate() }} />

      <button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="py-2 bg-emerald-600 text-white rounded text-sm font-semibold disabled:opacity-40">{loading ? 'Generating...' : 'Generate (Ctrl+Enter)'}</button>

      {error && <div className="text-xs text-red-400 p-2 bg-red-950/30 rounded">{error}</div>}

      {routerStatuses.length > 0 && (
        <div className="text-xs space-y-1">
          {routerStatuses.map((s) => (
            <div key={s.provider} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${s.status === 'success' ? 'bg-emerald-500' : s.status === 'error' ? 'bg-red-500' : 'bg-amber-400 animate-pulse'}`} />
              <span className="text-slate-400">{s.provider}: {s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
