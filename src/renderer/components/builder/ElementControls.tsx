import type { ElementNode } from '../../types'

interface ElementControlsProps {
  node: ElementNode
  selectedElementId: string | null
  onSelect: (id: string) => void
  onAddChild: (type: ElementNode['type']) => void
  onDelete: (id: string) => void
}

export default function ElementControls({ node, selectedElementId, onSelect, onAddChild, onDelete }: ElementControlsProps) {
  const isSelected = selectedElementId === node.id

  return (
    <div
      className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(node.id)
      }}
    >
      {isSelected && (
        <div className="absolute -top-3 left-0 bg-blue-600 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1 z-10">
          <span>{node.type}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddChild('text')
            }}
            className="hover:text-blue-200"
            title="Add text"
          >
            +T
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddChild('image')
            }}
            className="hover:text-blue-200"
            title="Add image"
          >
            +I
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(node.id)
            }}
            className="hover:text-red-200 ml-1"
            title="Delete"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
