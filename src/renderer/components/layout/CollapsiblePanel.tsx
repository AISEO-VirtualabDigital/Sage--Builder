import { useState, useRef, useEffect, type ReactNode } from 'react'

interface CollapsiblePanelProps {
  id: string
  title: string
  collapsed: boolean
  onToggleCollapse: () => void
  onClose?: () => void
  children: ReactNode
  headerActions?: ReactNode
  minWidth?: number
  maxWidth?: number
  width?: number
  onResize?: (width: number) => void
  className?: string
  style?: React.CSSProperties
}

export default function CollapsiblePanel({
  id,
  title,
  collapsed,
  onToggleCollapse,
  onClose,
  children,
  headerActions,
  minWidth = 180,
  maxWidth = 500,
  width,
  onResize,
  className = '',
  style = {},
}: CollapsiblePanelProps) {
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  useEffect(() => {
    if (!isResizing || !onResize) return
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current
      const newWidth = startWidthRef.current + delta
      onResize(Math.max(minWidth, Math.min(maxWidth, newWidth)))
    }
    const handleMouseUp = () => setIsResizing(false)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, onResize, minWidth, maxWidth])

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = panelRef.current?.offsetWidth || width || 256
  }

  return (
    <div
      ref={panelRef}
      className={`flex flex-col bg-sage-900 border-sage-700 transition-all duration-200 ${
        collapsed ? 'w-10 border-r' : 'border-r'
      } ${className}`}
      style={{
        width: collapsed ? 40 : width,
        minWidth: collapsed ? 40 : minWidth,
        maxWidth: collapsed ? 40 : maxWidth,
        overflow: 'hidden',
        ...style,
      }}
      data-panel-id={id}
    >
      <div className="flex items-center justify-between px-2 h-10 border-b border-sage-700 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-slate-300 truncate">{title}</h3>
            {headerActions && <div className="flex items-center gap-1">{headerActions}</div>}
          </div>
        )}
        <div className="flex items-center gap-1 flex-shrink-0">
          {onClose && !collapsed && (
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xs px-1" title="Close">
              ×
            </button>
          )}
          <button
            onClick={onToggleCollapse}
            className="text-slate-400 hover:text-white text-xs px-1"
            title={collapsed ? 'Reveal panel' : 'Hide panel'}
          >
            {collapsed ? '◀' : '▶'}
          </button>
        </div>
      </div>
      {!collapsed && (
        <>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
          {onResize && (
            <div
              onMouseDown={handleResizeStart}
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-emerald-500/30 active:bg-emerald-500/50 z-10"
              style={{ marginRight: -2 }}
            />
          )}
        </>
      )}
      {collapsed && (
        <div className="flex-1 flex flex-col items-center justify-center py-2 gap-2 overflow-hidden">
          <button
            onClick={onToggleCollapse}
            className="text-slate-400 hover:text-white text-xs"
            title="Reveal panel"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  )
}
