import { useState, useRef, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { togglePanel, setBubbleContext, setBubbleActions, setBubblePosition, toggleBubble, setWorkspaceMode } from '../../store/uiStore'
import { deleteElement, addElement, undoProject, redoProject } from '../../store/projectStore'
import { AiRouter, loadRouterOrder, type AiRouterStatus } from '../../ai/aiRouter'
import { getStoredAiConfig } from '../../ai/aiClient'
import type { AiProvider } from '../../../types'
import type { BubbleAction } from '../../store/uiStore'

interface FloatingBubbleProps {
  onAiToggle?: () => void
  onSave: () => void
  onExport: () => void
  onAddElement: (type: string, position?: 'append' | 'before' | 'after', targetId?: string) => void
  onOpen?: () => void
  onNew?: () => void
  onTemplates?: () => void
  selectedElementId: string | null
}

const QUICK_ADD_TYPES = [
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'heading', label: 'Heading', icon: '🔤' },
  { type: 'image', label: 'Image', icon: '🖼️' },
  { type: 'button', label: 'Button', icon: '🔘' },
  { type: 'container', label: 'Container', icon: '📦' },
  { type: 'row', label: 'Row', icon: '↔️' },
  { type: 'column', label: 'Column', icon: '↕️' },
  { type: 'divider', label: 'Divider', icon: '➖' },
  { type: 'spacer', label: 'Spacer', icon: '↕️' },
  { type: 'html', label: 'HTML', icon: '💻' },
]

export default function FloatingBubble({ onAiToggle: _onAiToggle, onSave, onExport, onAddElement: _onAddElement, onOpen, onNew, onTemplates, selectedElementId }: FloatingBubbleProps) {
  const dispatch = useDispatch()
  const bubble = useSelector((state: RootState) => state.ui.bubble)
  const history = useSelector((state: RootState) => state.project.history)
  const historyIndex = useSelector((state: RootState) => state.project.historyIndex)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [bubbleStart, setBubbleStart] = useState({ x: 0, y: 0 })
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [provider, setProvider] = useState<AiProvider>(getStoredAiConfig().provider)
  const [routerOrder] = useState<AiProvider[]>(loadRouterOrder)
  const [routerStatuses, setRouterStatuses] = useState<AiRouterStatus[]>([])
  const [showProviders, setShowProviders] = useState(false)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const router = new AiRouter(loadRouterOrder())

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatOpen])

  useEffect(() => {
    if (selectedElementId) {
      dispatch(setBubbleContext('element'))
      dispatch(
        setBubbleActions(['add', 'ai', 'undo', 'redo', 'delete', 'duplicate', 'preview', 'save', 'templates'] as BubbleAction[])
      )
    } else {
      dispatch(setBubbleContext('canvas'))
      dispatch(setBubbleActions(['add', 'ai', 'undo', 'redo', 'save', 'export', 'templates', 'open', 'new'] as BubbleAction[]))
    }
  }, [selectedElementId, dispatch])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setBubbleStart({ x: bubble.x, y: bubble.y })
  }, [bubble.x, bubble.y])

  useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      dispatch(
        setBubblePosition({
          x: Math.max(0, bubbleStart.x + dx),
          y: Math.max(0, bubbleStart.y + dy),
        })
      )
    }
    const handleMouseUp = () => setIsDragging(false)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, bubbleStart, dispatch])

  const handleAction = useCallback((action: BubbleAction) => {
    switch (action) {
      case 'add':
        dispatch(togglePanel('elements'))
        break
      case 'ai':
        setChatOpen((v) => !v)
        break
      case 'undo':
        dispatch(undoProject())
        break
      case 'redo':
        dispatch(redoProject())
        break
      case 'save':
        onSave()
        break
      case 'export':
        onExport()
        break
      case 'preview':
        dispatch(setWorkspaceMode('preview'))
        break
      case 'delete':
        if (selectedElementId) dispatch(deleteElement(selectedElementId))
        break
      case 'duplicate':
        break
      case 'settings':
        dispatch(togglePanel('properties'))
        break
      case 'seo':
        dispatch(togglePanel('seo'))
        break
      case 'templates':
        onTemplates?.()
        break
      case 'open':
        onOpen?.()
        break
      case 'new':
        onNew?.()
        break
    }
  }, [dispatch, selectedElementId, onSave, onExport, onTemplates, onOpen, onNew])

  const contextLabel = bubble.contextType === 'element' ? 'Element' : bubble.contextType === 'canvas' ? 'Canvas' : 'Panel'

  const handleSendChat = async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) return
    setChatInput('')
    setChatMessages((m) => [...m, { role: 'user', content: text }])
    setChatLoading(true)
    setRouterStatuses([])
    try {
      const config = getStoredAiConfig()
      config.provider = provider
      const result = await router.generate({ prompt: text, provider, config }, (status) => {
        setRouterStatuses((prev) => {
          const next = [...prev.filter((s) => s.provider !== status.provider), status]
          return next
        })
      })
      for (const node of result.nodes) {
        dispatch(addElement({ type: node.type }))
      }
      const reply = result.nodes.length ? `Added ${result.nodes.length} node(s) to canvas.` : 'No nodes generated.'
      setChatMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch (e) {
      setChatMessages((m) => [...m, { role: 'assistant', content: (e as Error).message }])
    }
    setChatLoading(false)
  }

  return (
    <div
      ref={bubbleRef}
      className="fixed z-50 select-none"
      style={{ left: bubble.x, top: bubble.y }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative">
        <div className="flex items-center gap-2 bg-sage-800 border border-sage-600 rounded-full shadow-2xl px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm cursor-grab active:cursor-grabbing">
            {contextLabel.charAt(0)}
          </div>
          <div className="text-xs text-slate-300 font-medium pr-1">{contextLabel}</div>
          <button
            onClick={() => dispatch(toggleBubble())}
            className="text-slate-400 hover:text-white text-xs px-1"
          >
            {bubble.expanded ? '−' : '+'}
          </button>
        </div>

        {bubble.expanded && (
          <div className="absolute left-12 top-0 mt-1 bg-sage-800 border border-sage-600 rounded-xl shadow-2xl p-2 min-w-[200px]">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-xs text-slate-400">Quick Actions</div>
              <button onClick={() => dispatch(toggleBubble())} className="text-slate-400 hover:text-white text-xs px-1" title="Close">
                ×
              </button>
            </div>
            <div className="space-y-1">
              {bubble.activeActions.map((action) => (
                <BubbleActionButton
                  key={action}
                  action={action}
                  onAction={handleAction}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onAddElement={_onAddElement}
                />
              ))}
            </div>
            {bubble.contextType === 'element' && (
              <>
                <div className="h-px bg-sage-700 my-2" />
                <div className="text-xs text-slate-400 mb-1 px-1">Insert After</div>
                <div className="grid grid-cols-5 gap-1">
                  {QUICK_ADD_TYPES.slice(0, 10).map((item) => (
                    <button
                      key={item.type}
                       onClick={() => _onAddElement(item.type, 'after', selectedElementId || undefined)}
                      className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-sage-700 text-slate-300"
                      title={item.label}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-[9px] truncate w-full text-center">{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {chatOpen && (
          <div className="absolute left-12 top-0 mt-1 w-80 bg-sage-800 border border-sage-600 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-sage-700">
              <div className="text-xs font-semibold text-slate-200">AI Chat</div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowProviders((v) => !v)} className="text-[10px] text-slate-400 hover:text-white px-1">
                  {showProviders ? 'Hide' : 'Provider'}
                </button>
                <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white text-xs px-1" title="Close">
                  ×
                </button>
              </div>
            </div>
            {showProviders && (
              <div className="flex gap-1 px-3 py-2 border-b border-sage-700">
                {routerOrder.map((p, idx) => (
                  <button key={p} onClick={() => setProvider(p)} title={`${p} (priority ${idx + 1})`} className={`flex-1 py-0.5 text-[10px] rounded capitalize ${provider===p?'bg-emerald-600 text-white':'bg-sage-700 text-slate-300'}`}>{p}</button>
                ))}
              </div>
            )}
            <div className="flex-1 max-h-64 overflow-y-auto p-2 space-y-2">
              {chatMessages.length === 0 && (
                <p className="text-[10px] text-slate-500">Ask anything. Example: &quot;add a hero section for a coffee shop&quot;</p>
              )}
              {routerStatuses.length > 0 && (
                <div className="space-y-1">
                  {routerStatuses.map((s) => (
                    <div key={s.provider} className="text-[10px] px-2 py-1 rounded flex items-center gap-2 bg-sage-900 text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'success' ? 'bg-emerald-500' : s.status === 'trying' ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`} />
                      <span className="capitalize">{s.provider}</span>
                      <span className="text-slate-500">{s.status}</span>
                      {s.error && <span className="text-red-400 truncate">{s.error}</span>}
                    </div>
                  ))}
                </div>
              )}
              {chatMessages.map((m, idx) => (
                <div key={idx} className={`text-xs px-2 py-1 rounded ${m.role === 'user' ? 'bg-sage-700 text-slate-200 ml-auto w-fit' : 'bg-sage-900 text-slate-200'}`}>
                  {m.content}
                </div>
              ))}
              {chatLoading && <div className="text-[10px] text-slate-400">Generating...</div>}
              <div ref={chatEndRef} />
            </div>
            <div className="p-2 border-t border-sage-700 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat() }}
                placeholder="Describe what to build..."
                className="flex-1 px-2 py-1 bg-sage-900 border border-sage-700 rounded text-xs text-slate-200 outline-none"
              />
              <button onClick={handleSendChat} disabled={chatLoading} className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 rounded text-xs text-white">Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BubbleActionButton({
  action,
  onAction,
  canUndo,
  canRedo,
  onAddElement: _onAddElement,
}: {
  action: BubbleAction
  onAction: (action: BubbleAction) => void
  canUndo: boolean
  canRedo: boolean
  onAddElement: (type: string) => void
}) {
  const config: Record<BubbleAction, { label: string; icon: string; disabled?: boolean }> = {
    add: { label: 'Add Element', icon: '➕' },
    ai: { label: 'AI Generate', icon: '✨' },
    undo: { label: 'Undo', icon: '↩️', disabled: !canUndo },
    redo: { label: 'Redo', icon: '↪️', disabled: !canRedo },
    save: { label: 'Save', icon: '💾' },
    export: { label: 'Export', icon: '📤' },
    preview: { label: 'Preview', icon: '👁️' },
    delete: { label: 'Delete Selected', icon: '🗑️' },
    duplicate: { label: 'Duplicate', icon: '📋' },
    settings: { label: 'Settings', icon: '⚙️' },
    seo: { label: 'SEO Tools', icon: '🔍' },
    templates: { label: 'Templates', icon: '📑' },
    open: { label: 'Open', icon: '📂' },
    new: { label: 'New', icon: '🆕' },
  }

  const c = config[action]
  return (
    <button
      onClick={() => onAction(action)}
      disabled={c.disabled}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left hover:bg-sage-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200`}
    >
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </button>
  )
}
