import { useRef } from 'react'

interface SnapGuide {
  id: string
  type: 'vertical' | 'horizontal'
  position: number
  source: 'element' | 'canvas' | 'grid'
}

interface SnapGuidesProps {
  guides: SnapGuide[]
  canvasRect: DOMRect | null
}

export default function SnapGuides({ guides, canvasRect }: SnapGuidesProps) {
  if (!canvasRect) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-40" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {guides.map((guide) => {
        const pos = guide.position - (guide.type === 'vertical' ? canvasRect.left : canvasRect.top)
        if (pos < 0 || pos > (guide.type === 'vertical' ? canvasRect.width : canvasRect.height)) return null
        return (
          <div
            key={guide.id}
            className={`absolute ${guide.type === 'vertical' ? 'w-px h-full bg-emerald-400' : 'h-px w-full bg-emerald-400'}`}
            style={{
              [guide.type === 'vertical' ? 'left' : 'top']: pos,
              opacity: 0.8,
            }}
          />
        )
      })}
    </div>
  )
}

interface SnapGridProps {
  canvasRect: DOMRect | null
  gridSize: number
  showGrid: boolean
}

export function SnapGrid({ canvasRect, gridSize, showGrid }: SnapGridProps) {
  if (!canvasRect || !showGrid) return null
  const lines: React.ReactNode[] = []
  const width = canvasRect.width
  const height = canvasRect.height
  for (let x = gridSize; x < width; x += gridSize) {
    lines.push(
      <div key={`v-${x}`} className="absolute top-0 w-px h-full bg-slate-300/30" style={{ left: x }} />
    )
  }
  for (let y = gridSize; y < height; y += gridSize) {
    lines.push(
      <div key={`h-${y}`} className="absolute left-0 h-px w-full bg-slate-300/30" style={{ top: y }} />
    )
  }
  return <div className="absolute inset-0 pointer-events-none z-30">{lines}</div>
}

export function useSnapGuides(
  _draggedRect: DOMRect | null,
  _elementRects: Map<string, DOMRect>,
  _canvasRect: DOMRect | null,
  _snapSettings: { enabled: boolean; gridSize: number; threshold: number; snapToElements: boolean; snapToCanvas: boolean }
): { guides: SnapGuide[]; snappedRect: DOMRect | null } {
  return { guides: [], snappedRect: null }
}
