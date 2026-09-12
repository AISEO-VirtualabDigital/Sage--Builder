import type { ElementNode } from '../../types'

interface ElementRendererProps {
  node: ElementNode
  selectedElementId: string | null
  onSelect: (id: string) => void
  isRoot?: boolean
}

function renderElementContent(node: ElementNode) {
  const p = node.props as Record<string, unknown>
  switch (node.type) {
    case 'text':
    case 'textBlock':
    case 'text-simple':
      return <div>{p.content as string}</div>
    case 'heading':
    case 'googleFontsHeading': {
      const Tag = (p.tag as string) || 'h2'
      return <div style={{ fontFamily: p.fontFamily as string }}>{(() => { const C = Tag as keyof JSX.IntrinsicElements; return <C>{p.content as string}</C> })()}</div>
    }
    case 'image':
    case 'singleImage':
    case 'flickrImage':
    case 'instagramImage':
      return <img src={p.src as string} alt={p.alt as string} className="max-w-full h-auto" />
    case 'button':
    case 'basicButton':
    case 'outlineButton':
      return (
        <a href={p.href as string} target={p.target as string} className={`inline-block px-4 py-2 rounded ${p.style === 'outline' ? 'border-2 border-blue-600 text-blue-600' : 'bg-blue-600 text-white'}`}>
          {p.label as string}
        </a>
      )
    case 'video':
    case 'youtubePlayer':
    case 'vimeoPlayer':
      return p.src ? <iframe src={p.src as string} className="w-full aspect-video" title="video" /> : <video src={p.src as string} controls={p.controls as boolean} className="max-w-full" />
    case 'divider':
    case 'separator':
      return <hr style={{ border: `${p.thickness} ${p.style} ${p.color}` }} />
    case 'separatorIcon':
      return <div className="flex items-center gap-2"><hr className="flex-1" /><span>{p.icon as string}</span><hr className="flex-1" /></div>
    case 'separatorTitle':
      return <div className="flex items-center gap-2"><hr className="flex-1" /><span className="font-semibold">{p.title as string}</span><hr className="flex-1" /></div>
    case 'spacer':
      return <div style={{ height: p.height as string }} />
    case 'html':
    case 'rawHtml':
      return <div dangerouslySetInnerHTML={{ __html: p.code as string }} />
    case 'rawJs':
    case 'shortcode':
      return <div className="bg-sage-800 text-slate-300 p-2 font-mono text-xs rounded">{String(p.code || p.js || '[shortcode]')}</div>
    case 'accordion': {
      const items = (p.items as Array<{title:string,content:string}>) || []
      return <div className="space-y-2">{items.map((it,i)=><details key={i} className="border rounded p-2"><summary className="font-semibold cursor-pointer">{it.title}</summary><div className="mt-2 text-sm">{it.content}</div></details>)}</div>
    }
    case 'tabs': {
      const tabs = (p.tabs as Array<{title:string,content:string}>) || []
      return <div className="border rounded"><div className="flex gap-1 bg-slate-100 p-1">{tabs.map((t,i)=><span key={i} className={`px-3 py-1 text-sm rounded ${i===0?'bg-white shadow':''}`}>{t.title}</span>)}</div><div className="p-3 text-sm">{tabs[0]?.content}</div></div>
    }
    case 'faqToggle':
      return <details className="border rounded p-3"><summary className="font-semibold cursor-pointer">{p.question as string}</summary><p className="mt-2 text-sm">{p.answer as string}</p></details>
    case 'icon':
      return <span style={{ fontSize: p.size as string, color: p.color as string }}>{p.icon as string}</span>
    case 'feature':
    case 'featureDescription':
      return <div className="flex gap-3 p-3 border rounded"><span className="text-2xl">{p.icon as string}</span><div><h4 className="font-semibold">{p.title as string}</h4><p className="text-sm text-slate-600">{p.description as string}</p></div></div>
    case 'infobox':
      return <div className="border rounded p-4 bg-slate-50"><div className="text-2xl mb-2">{p.icon as string}</div><h4 className="font-bold">{p.title as string}</h4><p className="text-sm">{p.content as string}</p></div>
    case 'logo':
      return <img src={p.src as string} alt={p.alt as string} style={{ height: p.height as string }} />
    case 'imageGallery':
    case 'imageMasonryGallery':
    case 'simpleImageSlider':
    case 'galleries':
    case 'gallery':
    case 'tp-gallery-slider':
      return <div className="grid grid-cols-3 gap-2">{((p.images as string[])||[]).length ? (p.images as string[]).map((src,i)=><img key={i} src={src} className="w-full h-24 object-cover rounded" />) : <div className="col-span-3 text-center text-sm text-slate-500 py-8 border-2 border-dashed rounded">Gallery - {p.columns as number} cols</div>}</div>
    case 'blog':
    case 'posts':
    case 'loops':
    case 'projects':
    case 'tp-project-slider':
      return <div className="grid grid-cols-3 gap-3">{Array.from({length: (p.count as number)||3}).map((_,i)=><div key={i} className="border rounded p-3"><div className="h-20 bg-slate-200 rounded mb-2" /><p className="text-sm font-semibold">Post {i+1}</p><p className="text-xs text-slate-500">{p.layout as string} layout</p></div>)}</div>
    case 'staff':
    case 'tp-staff-social':
      return <div className="text-center border rounded p-4"><div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-2" /><p className="font-semibold">{p.name as string}</p><p className="text-xs text-slate-500">{p.role as string}</p></div>
    case 'partners':
      return <div className="flex gap-4 justify-center py-4 border-2 border-dashed rounded text-sm text-slate-500">Partners logos</div>
    case 'testimonials':
      return <blockquote className="border-l-4 pl-4 italic">“{p.quote as string}”<footer className="text-sm font-semibold mt-1">— {p.author as string}</footer></blockquote>
    case 'progressBars':
    case 'progress-bars':
      return <div><div className="flex justify-between text-xs mb-1"><span>{p.label as string}</span><span>{p.percent as number}%</span></div><div className="w-full bg-slate-200 rounded h-2"><div className="h-2 rounded" style={{ width: `${p.percent}%`, background: p.color as string }} /></div></div>
    case 'countdown':
      return <div className="text-center py-4 border rounded bg-slate-50"><p className="text-xs text-slate-500">Countdown to</p><p className="font-mono font-bold">{new Date(p.date as string).toLocaleDateString()}</p></div>
    case 'navigation':
      return <nav className="flex gap-4 py-2 border-y text-sm font-medium"><span>Home</span><span>About</span><span>Services</span><span>Contact</span></nav>
    case 'notification':
      return <div className={`p-3 rounded text-sm ${p.type==='info'?'bg-blue-100 text-blue-800':'bg-yellow-100 text-yellow-800'}`}>{p.message as string}</div>
    case 'social':
    case 'facebookLike':
    case 'twitterButton':
    case 'twitterGrid':
    case 'twitterTimeline':
    case 'twitterTweet':
    case 'pinterestPinit':
      return <div className="flex gap-2"><span className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Facebook</span><span className="px-3 py-1 bg-sky-500 text-white rounded text-xs">Twitter</span><span className="px-3 py-1 bg-red-600 text-white rounded text-xs">Pinterest</span></div>
    case 'googleMaps':
      return <div className="bg-slate-200 flex items-center justify-center rounded" style={{ height: p.height as string }}><span className="text-sm text-slate-600">📍 Map: {p.address as string || `${p.lat},${p.lng}`} (zoom {p.zoom as number})</span></div>
    case 'heroSection':
      return <div className="text-center py-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded"><h2 className="text-3xl font-bold">{p.title as string}</h2><p className="mt-2 opacity-90">{p.subtitle as string}</p><a href={p.ctaHref as string} className="inline-block mt-4 px-6 py-2 bg-white text-blue-600 rounded font-semibold">{p.ctaLabel as string}</a></div>
    case 'callToAction':
    case 'cta':
      return <div className="flex items-center justify-between p-6 bg-slate-900 text-white rounded"><div><h3 className="font-bold">{p.title as string}</h3><p className="text-sm opacity-80">{p.content as string}</p></div><a href={p.buttonHref as string} className="px-4 py-2 bg-blue-600 rounded text-sm">{p.buttonLabel as string}</a></div>
    case 'tp-title':
      return <h3 className="font-bold text-lg">Post Title (template)</h3>
    case 'tp-content':
      return <p className="text-sm text-slate-600">Post content template</p>
    case 'tp-excerpt':
      return <p className="text-sm italic text-slate-500">Post excerpt template</p>
    case 'tp-thumbnail':
      return <div className="h-32 bg-slate-200 rounded" />
    case 'tp-meta':
      return <div className="text-xs text-slate-500">By Author • Jan 1, 2026 • Category</div>
    case 'tp-link':
      return <a className="text-blue-600 underline text-sm">Read more →</a>
    case 'tp-comments':
    case 'tp-comments-form':
      return <div className="border rounded p-3 text-sm">Comments template</div>
    case 'tp-downloads-button':
    case 'downloads':
      return <a className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded text-sm">⬇ {p.label as string}</a>
    case 'woocommerce':
      return <div className="border rounded p-3"><p className="text-sm font-semibold">WooCommerce Product Grid</p><div className="grid grid-cols-3 gap-2 mt-2">{Array.from({length:3}).map((_,i)=><div key={i} className="h-20 bg-slate-100 rounded" />)}</div></div>
    case 'widgets':
    case 'wpWidgetsCustom':
    case 'wpWidgetsDefault':
      return <div className="border rounded p-3"><h4 className="font-semibold text-sm">{p.title as string}</h4><p className="text-xs text-slate-500">Widget: {p.widget as string}</p></div>
    default:
      return <div className="text-xs text-slate-400 p-2 border border-dashed rounded">Unknown: {node.type}</div>
  }
}

export default function ElementRenderer({ node, selectedElementId, onSelect }: ElementRendererProps) {
  const isSelected = selectedElementId === node.id
  const style: React.CSSProperties = {
    ...node.styles,
    position: 'relative',
    border: isSelected ? '2px dashed #3b82f6' : '2px solid transparent',
    padding: isSelected ? '4px' : undefined,
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(node.id)
  }

  const isContainerType = ['container','row','column','section','heroSection','featureSection','tabs','accordion','callToAction','cta'].includes(node.type)
  if (isContainerType) {
    const containerClass = node.type === 'row' ? 'flex flex-wrap' : node.type === 'column' ? 'flex-1 min-w-[200px]' : node.type === 'section' ? 'py-6' : 'min-h-[60px]'
    return (
      <div onClick={handleClick} style={style} className={`${containerClass} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        {node.children?.map((child) => (
          <ElementRenderer key={child.id} node={child} selectedElementId={selectedElementId} onSelect={onSelect} />
        ))}
        {(!node.children || node.children.length===0) && <div className="w-full text-center text-xs text-slate-400 py-4 border-2 border-dashed rounded">Drop here • {node.type}</div>}
      </div>
    )
  }

  return (
    <div onClick={handleClick} style={style} className={isSelected ? 'ring-2 ring-blue-500' : ''}>
      {renderElementContent(node)}
    </div>
  )
}
