import { useDrop } from 'react-dnd'
import type { ElementNode, ViewportMode } from '../../types'
import ElementRenderer from './ElementRenderer'

interface CanvasProps {
  root: ElementNode
  onSelectElement: (id: string) => void
  selectedElementId: string | null
  viewport: ViewportMode
  onAddElement: (type: string) => void
}

export default function Canvas({ root, onSelectElement, selectedElementId, viewport, onAddElement }: CanvasProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'ELEMENT',
    drop: (_item: { type: string }, monitor) => {
      if (monitor.didDrop()) return
      const item = monitor.getItem()
      if (item && item.type) {
        onAddElement(item.type)
      }
      return { type: 'drop' }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }))

  const viewportWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '375px'

  return (
    <div className="flex-1 bg-sage-950 overflow-auto p-6 flex justify-center">
      <div
        ref={drop}
        onClick={() => onSelectElement('root')}
        className={`bg-white shadow-2xl transition-all duration-300 ${
          isOver && canDrop ? 'ring-4 ring-emerald-500/50' : ''
        }`}
        style={{ width: viewportWidth, minHeight: '600px' }}
      >
        <ElementRenderer
          node={root}
          selectedElementId={selectedElementId}
          onSelect={onSelectElement}
          isRoot
        />
      </div>
    </div>
  )
}
