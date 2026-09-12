import { useDrag } from 'react-dnd'
import { ELEMENT_TYPES } from './Toolbar'

interface DraggableElementProps {
  type: typeof ELEMENT_TYPES[0]['type']
  label: string
  icon: string
  onAdd: (type: string, position?: 'append' | 'before' | 'after', targetId?: string) => void
}

function DraggableElement({ type, label, icon, onAdd }: DraggableElementProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }))

  return (
    <div
      ref={drag}
      onClick={() => onAdd(type)}
      className={`flex items-center gap-2 p-2 bg-sage-800 hover:bg-sage-700 rounded cursor-pointer border border-sage-700 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm text-slate-200">{label}</span>
    </div>
  )
}

interface ElementsPanelProps {
  onAddElement: (type: string, position?: 'append' | 'before' | 'after', targetId?: string) => void
}

export default function ElementsPanel({ onAddElement }: ElementsPanelProps) {
  return (
    <div className="w-64 bg-sage-900 border-r border-sage-700 flex flex-col">
      <div className="p-3 border-b border-sage-700">
        <h2 className="text-sm font-semibold text-slate-300">Elements</h2>
      </div>
      <div className="p-3 space-y-2 overflow-y-auto">
        {ELEMENT_TYPES.map((el) => (
          <DraggableElement key={el.type} {...el} onAdd={onAddElement} />
        ))}
      </div>
    </div>
  )
}
