import type { ElementType, ViewportMode } from '../../types'

const ELEMENT_TYPES: { type: ElementType; label: string; icon: string }[] = [
  { type: 'container', label: 'Container', icon: '📦' },
  { type: 'row', label: 'Row', icon: '↔️' },
  { type: 'column', label: 'Column', icon: '↕️' },
  { type: 'section', label: 'Section', icon: '📐' },
  { type: 'heroSection', label: 'Hero', icon: '🌟' },
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'heading', label: 'Heading', icon: '🔤' },
  { type: 'image', label: 'Image', icon: '🖼️' },
  { type: 'imageGallery', label: 'Gallery', icon: '🖼️' },
  { type: 'button', label: 'Button', icon: '🔘' },
  { type: 'icon', label: 'Icon', icon: '⭐' },
  { type: 'video', label: 'Video', icon: '🎬' },
  { type: 'googleMaps', label: 'Map', icon: '📍' },
  { type: 'accordion', label: 'Accordion', icon: '📑' },
  { type: 'tabs', label: 'Tabs', icon: '🗂️' },
  { type: 'testimonials', label: 'Testimonial', icon: '💬' },
  { type: 'blog', label: 'Blog', icon: '📰' },
  { type: 'callToAction', label: 'CTA', icon: '📢' },
  { type: 'countdown', label: 'Countdown', icon: '⏳' },
  { type: 'progressBars', label: 'Progress', icon: '📊' },
  { type: 'social', label: 'Social', icon: '🔗' },
  { type: 'navigation', label: 'Nav', icon: '🧭' },
  { type: 'woocommerce', label: 'Woo', icon: '🛒' },
  { type: 'html', label: 'HTML', icon: '💻' },
  { type: 'rawJs', label: 'JS', icon: '📜' },
  { type: 'shortcode', label: 'Shortcode', icon: '🔧' },
]

interface ToolbarProps {
  mode: 'builder' | 'code' | 'preview'
  onModeChange: (mode: 'builder' | 'code' | 'preview') => void
  builderMode: 'local' | 'hybrid' | 'remote'
  onBuilderModeChange: (m: 'local' | 'hybrid' | 'remote') => void
  viewport: ViewportMode
  onViewportChange: (viewport: ViewportMode) => void
  onSave: () => void
  onExport: () => void
  onOpen?: () => void
  onNew?: () => void
  showLayoutTree: boolean
  onToggleLayoutTree: () => void
  showAi: boolean
  onToggleAi: () => void
  showCode: boolean
  onToggleCode: () => void
  showSeo: boolean
  onToggleSeo: () => void
  onLoadDesignMd?: () => void
  onLoadSkillMd?: () => void
}

export default function Toolbar({
  mode,
  onModeChange,
  builderMode,
  onBuilderModeChange,
  viewport,
  onViewportChange,
  onSave,
  onExport,
  onOpen,
  onNew,
  showLayoutTree,
  onToggleLayoutTree,
  showAi,
  onToggleAi,
  showCode,
  onToggleCode,
  showSeo,
  onToggleSeo,
  onLoadDesignMd,
  onLoadSkillMd,
}: ToolbarProps) {
  return (
    <div className="h-12 bg-sage-900 border-b border-sage-700 flex items-center px-4 justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-white mr-2">SAGE</span>
        <span className="text-[10px] text-slate-400 mr-2">by Virtualab Digital</span>
        <div className="flex bg-sage-800 rounded-lg p-1 mr-2">
          {(['local', 'hybrid', 'remote'] as const).map((b) => (
            <button
              key={b}
              onClick={() => onBuilderModeChange(b)}
              className={`px-2 py-1 rounded text-xs capitalize ${
                builderMode === b ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title={b === 'local' ? 'Electron Offline' : b === 'hybrid' ? 'Electron + WP Sync' : 'WP Native'}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="flex bg-sage-800 rounded-lg p-1">
          {(['builder', 'code', 'preview'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                mode === m ? 'bg-sage-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLayoutTree}
          className={`px-3 py-1.5 rounded text-sm mr-2 ${
            showLayoutTree ? 'bg-sage-700 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Layout
        </button>
        <button
          onClick={onToggleAi}
          className={`px-3 py-1.5 rounded text-sm mr-2 ${
            showAi ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          AI
        </button>
        <button
          onClick={onToggleCode}
          className={`px-3 py-1.5 rounded text-sm mr-2 ${
            showCode ? 'bg-sage-700 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Code
        </button>
        <button
          onClick={onToggleSeo}
          className={`px-3 py-1.5 rounded text-sm mr-4 ${
            showSeo ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          SEO
        </button>
        {onLoadDesignMd && (
          <button onClick={onLoadDesignMd} className="px-2 py-1.5 bg-sage-800 hover:bg-sage-700 rounded text-xs text-slate-300 mr-1">
            DESIGN
          </button>
        )}
        {onLoadSkillMd && (
          <button onClick={onLoadSkillMd} className="px-2 py-1.5 bg-sage-800 hover:bg-sage-700 rounded text-xs text-slate-300 mr-4">
            SKILL
          </button>
        )}
        <div className="flex bg-sage-800 rounded-lg p-1 mr-4">
          {(['desktop', 'tablet', 'mobile'] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewportChange(v)}
              className={`px-2 py-1 rounded text-xs capitalize ${
                viewport === v ? 'bg-sage-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <button onClick={onSave} className="px-3 py-1.5 bg-sage-700 hover:bg-sage-600 rounded text-sm text-white">
          Save
        </button>
        {onOpen && (
          <button onClick={onOpen} className="px-3 py-1.5 bg-sage-800 hover:bg-sage-700 rounded text-sm text-slate-300 mr-2">
            Open
          </button>
        )}
        {onNew && (
          <button onClick={onNew} className="px-3 py-1.5 bg-sage-800 hover:bg-sage-700 rounded text-sm text-slate-300 mr-2">
            New
          </button>
        )}
        <button onClick={onExport} className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-sm text-white">
          Export
        </button>
      </div>
    </div>
  )
}

export { ELEMENT_TYPES }
