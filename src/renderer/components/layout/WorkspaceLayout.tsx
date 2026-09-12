import { useState, useCallback, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { UiRootState } from '../../store'
import { setPanelWidth, setPanelVisibility, setPanelCollapsed, type PanelId } from '../../store/uiStore'
import CollapsiblePanel from './CollapsiblePanel'

interface WorkspaceLayoutProps {
  leftPanels: { id: PanelId; component: React.ReactNode; title: string }[]
  centerComponent: React.ReactNode
  rightPanels: { id: PanelId; component: React.ReactNode; title: string }[]
  bottomPanel?: { id: PanelId; component: React.ReactNode; title: string }
  className?: string
}

export default function WorkspaceLayout({
  leftPanels,
  centerComponent,
  rightPanels,
  bottomPanel,
  className = '',
}: WorkspaceLayoutProps) {
  const dispatch = useDispatch()
  const panels = useSelector((state: UiRootState) => state.ui.workspace.panels)
  const [isResizing, setIsResizing] = useState<{ side: 'left' | 'right'; panelId: PanelId } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sizeStartRef = useRef(0)

  const visibleLeft = leftPanels.filter((p) => panels[p.id]?.visible)
  const visibleRight = rightPanels.filter((p) => panels[p.id]?.visible)

  const handleResizeStart = useCallback((e: React.MouseEvent, panelId: PanelId, side: 'left' | 'right') => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing({ side, panelId })
    sizeStartRef.current = panels[panelId]?.width || 256
  }, [panels])

  useEffect(() => {
    if (!isResizing) return
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - sizeStartRef.current
      const panel = panels[isResizing.panelId]
      if (!panel) return
      let newWidth = sizeStartRef.current + (isResizing.side === 'left' ? -delta : delta)
      newWidth = Math.max(panel.minWidth, Math.min(panel.maxWidth, newWidth))
      dispatch(setPanelWidth({ id: isResizing.panelId, width: newWidth }))
    }
    const handleMouseUp = () => setIsResizing(null)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, dispatch, panels])

  const renderPanel = (panelDef: { id: PanelId; component: React.ReactNode; title: string }, side: 'left' | 'right') => {
    const panel = panels[panelDef.id]
    if (!panel || !panel.visible) return null
    const isLastOnSide = side === 'left'
      ? !visibleLeft.find((p) => panels[p.id]?.visible && p.id !== panelDef.id && (panels[p.id]?.order || 0) > panel.order)
      : !visibleRight.find((p) => panels[p.id]?.visible && p.id !== panelDef.id && (panels[p.id]?.order || 0) > panel.order)
    return (
      <div key={panelDef.id} className="flex-shrink-0 h-full" style={{ width: panel.width }}>
        <div className="h-full flex flex-col">
          <CollapsiblePanel
            id={panelDef.id}
            title={panelDef.title}
            collapsed={panel.collapsed}
            onToggleCollapse={() => dispatch(setPanelCollapsed({ id: panelDef.id, collapsed: !panel.collapsed }))}
            onClose={() => dispatch(setPanelVisibility({ id: panelDef.id, visible: false }))}
            width={panel.width}
            onResize={(w: number) => dispatch(setPanelWidth({ id: panelDef.id, width: w }))}
            minWidth={panel.minWidth}
            maxWidth={panel.maxWidth}
          >
            {panelDef.component}
          </CollapsiblePanel>
        </div>
        {isLastOnSide && (
          <div
            onMouseDown={(e) => handleResizeStart(e, panelDef.id, side)}
            className="w-1 h-full cursor-col-resize hover:bg-emerald-500/30 active:bg-emerald-500/50 flex-shrink-0"
          />
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`h-full flex flex-col ${className}`}>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex h-full overflow-x-auto">
          {visibleLeft.map((p) => renderPanel(p, 'left'))}
        </div>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 min-w-0 overflow-hidden relative">{centerComponent}</div>
            <div className="flex h-full overflow-x-auto">
              {visibleRight.map((p) => renderPanel(p, 'right'))}
            </div>
          </div>
          {bottomPanel && panels[bottomPanel.id]?.visible && (
            <div className="h-48 border-t border-sage-700 flex-shrink-0">
              <CollapsiblePanel
                id={bottomPanel.id}
                title={bottomPanel.title}
                collapsed={panels[bottomPanel.id]?.collapsed || false}
                onToggleCollapse={() => dispatch(setPanelCollapsed({ id: bottomPanel.id, collapsed: !panels[bottomPanel.id]?.collapsed }))}
                onClose={() => dispatch(setPanelVisibility({ id: bottomPanel.id, visible: false }))}
              >
                {bottomPanel.component}
              </CollapsiblePanel>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
