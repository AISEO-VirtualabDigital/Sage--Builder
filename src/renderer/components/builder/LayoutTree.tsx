import type { ElementNode } from '../../types'

interface LayoutTreeProps {
  root: ElementNode
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function LayoutTree({ root, selectedId, onSelect }: LayoutTreeProps) {
  return (
    <div className="text-sm">
      <TreeNode node={root} selectedId={selectedId} onSelect={onSelect} level={0} />
    </div>
  )
}

function TreeNode({ node, selectedId, onSelect, level }: { node: ElementNode; selectedId: string | null; onSelect: (id: string) => void; level: number }) {
  const hasChildren = !!(node.children && node.children.length)
  const isSelected = selectedId === node.id
  return (
    <div>
      <div
        onClick={() => onSelect(node.id)}
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-sage-800 ${
          isSelected ? 'bg-sage-700 text-white' : 'text-slate-300'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <span className="text-xs text-slate-500">{node.type}</span>
        <span className="truncate">{node.id}</span>
      </div>
      {hasChildren && node.children!.map((child) => (
        <TreeNode key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} level={level + 1} />
      ))}
    </div>
  )
}
