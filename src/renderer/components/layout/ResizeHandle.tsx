import { useState, useRef, useEffect } from 'react'

interface ResizeHandleProps {
  direction?: 'horizontal' | 'vertical'
  onResize: (delta: number) => void
  minSize?: number
  maxSize?: number
  className?: string
}

export default function ResizeHandle({
  direction = 'horizontal',
  onResize,
  minSize = 180,
  maxSize = 800,
  className = '',
}: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false)
  const startRef = useRef(0)
  const sizeRef = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startRef.current = direction === 'horizontal' ? e.clientX : e.clientY
    sizeRef.current = direction === 'horizontal' ? (e.currentTarget.parentElement?.offsetWidth || 256) : (e.currentTarget.parentElement?.offsetHeight || 256)
  }

  useEffect(() => {
    if (!isResizing) return
    const handleMouseMove = (e: MouseEvent) => {
      const delta = direction === 'horizontal' ? e.clientX - startRef.current : e.clientY - startRef.current
      const newSize = Math.max(minSize, Math.min(maxSize, sizeRef.current + delta))
      onResize(newSize - sizeRef.current)
    }
    const handleMouseUp = () => setIsResizing(false)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, direction, minSize, maxSize, onResize])

  if (direction === 'horizontal') {
    return (
      <div
        onMouseDown={handleMouseDown}
        className={`w-1 cursor-col-resize hover:bg-emerald-500/30 active:bg-emerald-500/50 flex-shrink-0 ${className}`}
      />
    )
  }
  return (
    <div
      onMouseDown={handleMouseDown}
      className={`h-1 cursor-row-resize hover:bg-emerald-500/30 active:bg-emerald-500/50 flex-shrink-0 ${className}`}
    />
  )
}
