import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from './store'
import type { Project } from './types'
import { setSelectedElement, addElement, updateElement, deleteElement, setCustomCode, setProject, undoProject, redoProject } from './store/projectStore'
import { togglePanel, setWorkspaceMode, setViewport, selectWorkspace, selectBubble } from './store/uiStore'
import { parseDesignMarkdown } from './ai/protocols/designContract'
import { parseSkillMarkdown } from './ai/protocols/skillProtocol'
import { loadWorkspaceState, subscribeToPersistence } from './store/workspacePersistence'
import { store } from './main'
import { generateHtml } from './utils/htmlGenerator'
import WorkspaceLayout from './components/layout/WorkspaceLayout'
import FloatingBubble from './components/layout/FloatingBubble'
import ElementsPanel from './components/panels/ElementsPanel'
import PropertyPanel from './components/panels/PropertyPanel'
import SeoPanel from './components/panels/SeoPanel'
import Canvas from './components/builder/Canvas'
import CodeEditor from './components/builder/CodeEditor'
import Preview from './components/preview/Preview'
import Toolbar from './components/panels/Toolbar'
import LayoutTree from './components/builder/LayoutTree'
import AiPanel from './components/ai/AiPanel'
import { WpRestClient } from '../hybrid/wp/wpRestClient'
import { ThemeStyleInjector } from '../hybrid/wp/themeStyleInjector'
import TemplateGallery from './components/templates/TemplateGallery'

type BuilderMode = 'local' | 'hybrid' | 'remote'

export default function App() {
  const dispatch = useDispatch()
  const selectedId = useSelector((state: RootState) => state.project.selectedElementId)
  const project = useSelector((state: RootState) => state.project.project)
  const workspace = useSelector(selectWorkspace)
  const bubble = useSelector(selectBubble)
  const [builderMode, setBuilderMode] = useState<BuilderMode>('local')
  const [wpUrl, setWpUrl] = useState<string>(localStorage.getItem('virtualab_wp_url') || '')
  const [wpStatus, setWpStatus] = useState<'disconnected' | 'connected' | 'syncing' | 'error'>('disconnected')
  const [themeCss, setThemeCss] = useState('')
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)
  const syncTimeout = useRef<number | null>(null)
  const themeInjector = useRef<ThemeStyleInjector | null>(null)

  useEffect(() => {
    if (builderMode === 'hybrid' && wpUrl) {
      themeInjector.current = new ThemeStyleInjector({ siteUrl: wpUrl, themeSlug: 'astra' })
      themeInjector.current.injectThemeCss().then(setThemeCss).catch(() => setThemeCss(''))
    }
  }, [builderMode, wpUrl])

  const mode = workspace.activeMode
  const viewport = workspace.viewport
  const showLayoutTree = workspace.panels.layout.visible
  const showAi = workspace.panels.ai.visible
  const showCode = workspace.panels.code.visible
  const showSeo = workspace.panels.seo.visible

  useEffect(() => {
    if (builderMode !== 'hybrid' || !wpUrl) return
    if (syncTimeout.current) window.clearTimeout(syncTimeout.current)
    syncTimeout.current = window.setTimeout(async () => {
      setWpStatus('syncing')
      try {
        const client = new WpRestClient({
          siteUrl: wpUrl,
          username: localStorage.getItem('virtualab_wp_user') || '',
          password: localStorage.getItem('virtualab_wp_pass') || '',
        })
        const ok = await client.healthCheck()
        setWpStatus(ok ? 'connected' : 'error')
      } catch {
        setWpStatus('error')
      }
    }, 800)
    return () => {
      if (syncTimeout.current) window.clearTimeout(syncTimeout.current)
    }
  }, [project, builderMode, wpUrl])

  useEffect(() => {
    const saved = loadWorkspaceState()
    if (!saved) return
    Object.entries(saved).forEach(([key, value]) => {
      if (key === 'panels') {
        Object.entries(value as Record<string, { visible?: boolean; collapsed?: boolean; width?: number }>).forEach(([panelId, panelState]) => {
          if (panelState.visible !== undefined) dispatch(togglePanel(panelId as import('./store/uiStore').PanelId))
          if (panelState.collapsed !== undefined) dispatch({ type: 'ui/setPanelCollapsed', payload: { id: panelId as import('./store/uiStore').PanelId, collapsed: panelState.collapsed } })
        })
      }
    })
    return subscribeToPersistence(() => store.getState())
  }, [dispatch])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        // TODO: load template by key
    dispatch(undoProject())
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        dispatch(redoProject())
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])

  const handleSave = async () => {
    if (window.electronAPI) {
      await window.electronAPI.saveProject(`${project.name}.sage`, project)
    }
  }

  const handleExport = async () => {
    const html = generateHtml(project)
    if (window.electronAPI) {
      await window.electronAPI.exportHtml(html)
    } else {
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.name || 'site'}.html`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleLoadDesignMd = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const contract = parseDesignMarkdown(text)
      const cssVars = contract.tokens.colors
      const cssVarStr = Object.entries(cssVars).map(([k, v]) => `--color-${k.replace(/\s+/g, '-').toLowerCase()}: ${v};`).join('\n')
      dispatch(setCustomCode({ css: `:root {\n${cssVarStr}\n}\n${text}` }))
    }
    input.click()
  }

  const handleLoadSkillMd = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const skill = parseSkillMarkdown(text)
      dispatch(setCustomCode({ js: JSON.stringify(skill, null, 2) }))
    }
    input.click()
  }

  const handleOpen = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openProject()
      if (result && typeof result === 'object' && 'data' in result) {
        dispatch(setProject(result.data as Project))
      }
    } else {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.sage,.json'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return
        const text = await file.text()
        try {
          const data = JSON.parse(text) as Project
          dispatch(setProject(data))
        } catch {
          alert('Invalid .sage file')
        }
      }
      input.click()
    }
  }

  const handleNew = () => {
    setShowTemplateGallery(true)
  }

  const handleSelectTemplate = (templateKey: string) => {
    // TODO: load template by key
    dispatch(undoProject())
  }

  const handleModeChange = (m: 'builder' | 'code' | 'preview') => {
    dispatch(setWorkspaceMode(m))
  }

  const handleAddElement = (type: string, position?: 'append' | 'before' | 'after', targetId?: string) => {
    dispatch(addElement({ type, position, targetId }))
  }

  const centerContent =
    mode === 'builder' && builderMode !== 'remote' ? (
      <Canvas
        root={project.root}
        onSelectElement={(id) => dispatch(setSelectedElement(id))}
        selectedElementId={selectedId}
        viewport={viewport}
        onAddElement={handleAddElement}
      />
    ) : mode === 'code' ? (
      <CodeEditor />
    ) : mode === 'preview' && builderMode === 'hybrid' && wpUrl ? (
      <div className="flex-1 flex flex-col">
        <div className="p-2 bg-sage-900 text-xs text-slate-400">
          Hybrid Preview - Rendering via WordPress ({wpUrl}) with theme CSS
        </div>
        <iframe
          srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><style>${themeCss}</style></head><body><div id="root"></div></body></html>`}
          className="flex-1 w-full bg-white"
          title="WP Hybrid Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    ) : mode === 'preview' && (builderMode !== 'hybrid' || !wpUrl) ? (
      <Preview root={project.root} customCss={project.customCss} customJs={project.customJs} />
    ) : builderMode === 'remote' && mode === 'builder' ? (
      <div className="flex-1 bg-slate-100 flex items-center justify-center p-8">
        {wpUrl ? (
          <iframe
            src={wpUrl.includes('wp-admin') ? wpUrl : `${wpUrl}/wp-admin/post-new.php`}
            className="w-full h-full bg-white rounded shadow"
            title="Remote WP Builder"
          />
        ) : (
          <span className="text-slate-500 text-sm">
            Enter WordPress URL above for Remote Builder (wp-admin)
          </span>
        )}
      </div>
    ) : null

  return (
    <div className="h-screen flex flex-col bg-sage-950 text-slate-200">
      <Toolbar
        mode={mode}
        onModeChange={handleModeChange}
        builderMode={builderMode}
        onBuilderModeChange={setBuilderMode}
        viewport={viewport}
        onViewportChange={(v) => dispatch(setViewport(v))}
        onSave={handleSave}
        onExport={handleExport}
        onOpen={handleOpen}
        onNew={handleNew}
        showLayoutTree={showLayoutTree}
        onToggleLayoutTree={() => dispatch(togglePanel('layout'))}
        showAi={showAi}
        onToggleAi={() => dispatch(togglePanel('ai'))}
        showCode={showCode}
        onToggleCode={() => dispatch(togglePanel('code'))}
        showSeo={showSeo}
        onToggleSeo={() => dispatch(togglePanel('seo'))}
        onLoadDesignMd={handleLoadDesignMd}
        onLoadSkillMd={handleLoadSkillMd}
      />
      {builderMode === 'hybrid' && (
        <div className="h-8 bg-amber-900/30 border-b border-amber-700/50 flex items-center px-4 gap-3 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              wpStatus === 'connected'
                ? 'bg-emerald-500'
                : wpStatus === 'syncing'
                  ? 'bg-amber-400 animate-pulse'
                  : wpStatus === 'error'
                    ? 'bg-red-500'
                    : 'bg-slate-500'
            }`}
          />
          <span className="text-amber-200">Hybrid: Electron edits → WP REST sync via wpRestClient</span>
          <input
            value={wpUrl}
            onChange={(e) => {
              setWpUrl(e.target.value)
              localStorage.setItem('virtualab_wp_url', e.target.value)
            }}
            placeholder="https://yoursite.com"
            className="ml-2 px-2 py-1 bg-sage-900 border border-sage-700 rounded text-slate-200 w-64"
          />
          <span className="text-slate-400 capitalize">{wpStatus}</span>
          <span className="ml-auto text-slate-500">Preview renders WordPress theme CSS (Astra/Kadence) live</span>
        </div>
      )}
      {builderMode === 'remote' && (
        <div className="h-8 bg-sky-900/30 border-b border-sky-700/50 flex items-center px-4 gap-2 text-xs text-sky-200">
          <span>Remote Builder: wp-admin iframe (theme styles from active WordPress theme)</span>
          <input
            value={wpUrl}
            onChange={(e) => setWpUrl(e.target.value)}
            placeholder="https://yoursite.com/wp-admin"
            className="ml-2 px-2 py-1 bg-sage-900 border border-sage-700 rounded text-slate-200 w-64"
          />
        </div>
      )}
      <WorkspaceLayout
        className="flex-1"
        leftPanels={[
          {
            id: 'elements',
            title: 'Elements',
            component: <ElementsPanel onAddElement={handleAddElement} />,
          },
          {
            id: 'layout',
            title: 'Layout Tree',
            component: (
              <div className="p-3">
                <h2 className="text-sm font-semibold text-slate-300 mb-2">Layout</h2>
                <LayoutTree
                  root={project.root}
                  selectedId={selectedId}
                  onSelect={(id) => dispatch(setSelectedElement(id))}
                />
              </div>
            ),
          },
        ]}
        centerComponent={centerContent}
        rightPanels={[
          {
            id: 'properties',
            title: 'Properties',
            component: selectedId ? (
              <PropertyPanel
                elementId={selectedId}
                onUpdate={(updates) => dispatch(updateElement({ id: selectedId, updates }))}
                onDelete={() => dispatch(deleteElement(selectedId))}
              />
            ) : (
              <div className="p-4 text-xs text-slate-500">Select an element to edit properties</div>
            ),
          },
          {
            id: 'ai',
            title: 'AI Generate',
            component: <AiPanel />,
          },
          {
            id: 'seo',
            title: 'SEO Tools',
            component: <SeoPanel />,
          },
        ]}
        bottomPanel={
          showCode
            ? {
                id: 'code',
                title: 'Custom Code',
                component: <CodeEditor />,
              }
            : undefined
        }
      />
      {bubble.visible && (
        <FloatingBubble
          onAiToggle={() => dispatch(togglePanel('ai'))}
          onSave={handleSave}
          onExport={handleExport}
          onAddElement={handleAddElement}
          onOpen={handleOpen}
          onNew={handleNew}
          onTemplates={() => setShowTemplateGallery(true)}
          selectedElementId={selectedId}
        />
      )}
      {showTemplateGallery && (
        <TemplateGallery
          onClose={() => setShowTemplateGallery(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      )}
    </div>
  )
}
