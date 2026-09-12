import { useDrop } from 'react-dnd'
import type { ElementNode } from '../../types'

interface ElementRendererProps {
  node: ElementNode
  selectedElementId: string | null
  onSelect: (id: string) => void
  isRoot?: boolean
  onAddElement?: (type: string, position?: 'append' | 'before' | 'after', targetId?: string) => void
}

function ElementRenderer({ node, selectedElementId, onSelect, isRoot, onAddElement }: ElementRendererProps) {
  const isSelected = selectedElementId === node.id
  
  // Containers can accept drops
  const canAcceptDrop = node.type === 'container' || node.type === 'row' || node.type === 'column' || isRoot
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'ELEMENT',
    drop: (item: { type: string }, monitor) => {
      if (monitor.didDrop()) return
      if (onAddElement && item.type) {
        onAddElement(item.type, 'append', node.id)
      }
      return { type: 'drop' }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [node.id, onAddElement])

  const renderContent = () => {
    const p = node.props as Record<string, unknown>
    switch (node.type) {
      case 'text': case 'textBlock': case 'text-simple':
        return <div>{p.content as string}</div>
      case 'heading': case 'googleFontsHeading': {
        const Tag = (p.tag as string) || 'h2'
        const C = Tag as keyof JSX.IntrinsicElements
        return <C>{p.content as string}</C>
      }
      case 'image': case 'singleImage': case 'flickrImage': case 'instagramImage':
        return <img src={p.src as string} alt={p.alt as string} className="max-w-full h-auto" />
      case 'button': case 'basicButton': case 'outlineButton':
        return <a href={p.href as string} className={`inline-block px-4 py-2 rounded ${p.style === 'outline' ? 'border-2 border-blue-600 text-blue-600' : 'bg-blue-600 text-white'}`}>{p.label as string}</a>
      case 'video': case 'youtubePlayer': case 'vimeoPlayer':
        return p.src ? <iframe src={p.src as string} className="w-full aspect-video" title="video" /> : null
      case 'divider': case 'separator':
        return <hr />
      case 'spacer':
        return <div style={{ height: p.height as string }} />
      case 'html': case 'rawHtml':
        return <div dangerouslySetInnerHTML={{ __html: p.code as string }} />
      case 'accordion': {
        const items = (p.items as Array<{ title: string; content: string }>) || []
        return <div className="space-y-2">{items.map((it, i) => <details key={i} className="border rounded p-2"><summary className="font-semibold cursor-pointer">{it.title}</summary><div className="mt-2 text-sm">{it.content}</div></details>)}</div>
      }
      case 'tabs': {
        const tabs = (p.tabs as Array<{ title: string; content: string }>) || []
        return <div className="border rounded"><div className="flex gap-1 bg-slate-100 p-1">{tabs.map((t, i) => <span key={i} className="px-3 py-1 text-sm">{t.title}</span>)}</div><div className="p-3 text-sm">{tabs[0]?.content}</div></div>
      }
      case 'heroSection':
        return <div className="bg-slate-900 text-white p-12 text-center"><h1 className="text-4xl font-bold">{p.title as string}</h1><p className="mt-4 text-lg">{p.subtitle as string}</p>{p.ctaText ? <button className="mt-6 px-6 py-3 bg-blue-600 rounded">{p.ctaText as string}</button> : null}</div>
      case 'callToAction': case 'cta':
        return <div className="bg-blue-600 text-white p-8 text-center rounded"><h2 className="text-2xl font-bold">{p.title as string}</h2><p className="mt-2">{p.description as string}</p><button className="mt-4 px-6 py-2 bg-white text-blue-600 rounded">{p.buttonText as string}</button></div>
      case 'googleMaps':
        return <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(p.address as string || '')}&output=embed`} className="w-full h-64 rounded" title="map" />
      default:
        return <div>{p.content as string || `[${node.type}]`}</div>
    }
  }

  const children = (node.children || []).map((child) => (
    <ElementRenderer key={child.id} node={child} selectedElementId={selectedElementId} onSelect={onSelect} onAddElement={onAddElement} />
  ))

  const dropRef = canAcceptDrop ? drop : undefined

  return (
    <div
      ref={dropRef as any}
      onClick={(e) => { e.stopPropagation(); onSelect(node.id) }}
      className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isOver && canDrop ? 'ring-2 ring-emerald-500' : ''}`}
      style={node.styles as any}
      data-sage-id={node.id}
      data-sage-type={node.type}
    >
      {renderContent()}
      {children}
      {canAcceptDrop && isOver && canDrop && (
        <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
      )}
    </div>
  )
}

export default ElementRenderer
