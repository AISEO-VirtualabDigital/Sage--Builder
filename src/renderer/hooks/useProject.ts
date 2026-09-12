import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store'
import { addElement, deleteElement, updateElement } from '../store/projectStore'
import type { ElementNode } from '../../types'
import { v4 as uuidv4 } from 'uuid'

export function useProject() {
  const dispatch = useDispatch()
  const project = useSelector((state: RootState) => state.project.project)
  const selectedId = useSelector((state: RootState) => state.project.selectedElementId)

  const insertAfterSelected = useCallback(
    (type: ElementNode['type']) => {
      if (!selectedId) return
      const parent = findParent(project.root, selectedId)
      if (!parent || !parent.children) return
      const index = parent.children.findIndex((c) => c.id === selectedId)
      const newNode: ElementNode = {
        id: uuidv4(),
        type,
        children: ['container', 'row', 'column'].includes(type) ? [] : undefined,
        props: defaultProps(type),
        styles: {},
        attributes: {},
      }
      parent.children.splice(index + 1, 0, newNode)
      dispatch(updateElement({ id: parent.id, updates: { children: [...parent.children] } }))
    },
    [dispatch, project.root, selectedId]
  )

  const duplicateSelected = useCallback(() => {
    if (!selectedId) return
    const el = findElement(project.root, selectedId)
    const parent = findParent(project.root, selectedId)
    if (!el || !parent || !parent.children) return
    const clone = JSON.parse(JSON.stringify(el)) as ElementNode
    clone.id = uuidv4()
    const index = parent.children.findIndex((c) => c.id === selectedId)
    parent.children.splice(index + 1, 0, clone)
    dispatch(updateElement({ id: parent.id, updates: { children: [...parent.children] } }))
  }, [dispatch, project.root, selectedId])

  return {
    project,
    selectedId,
    addElement: (type: ElementNode['type'], position?: 'append' | 'before' | 'after', targetId?: string) => dispatch(addElement({ type, position, targetId })),
    deleteSelected: () => selectedId && dispatch(deleteElement(selectedId)),
    insertAfterSelected,
    duplicateSelected,
  }
}

function findElement(root: ElementNode, id: string): ElementNode | null {
  if (root.id === id) return root
  for (const child of root.children || []) {
    const found = findElement(child, id)
    if (found) return found
  }
  return null
}

function findParent(root: ElementNode, id: string): ElementNode | null {
  for (const child of root.children || []) {
    if (child.id === id) return root
    const found = findParent(child, id)
    if (found) return found
  }
  return null
}

function defaultProps(type: ElementNode['type']): Record<string, unknown> {
  switch (type) {
    case 'text':
      return { content: 'Text block' }
    case 'image':
      return { src: '', alt: 'Image' }
    case 'button':
      return { label: 'Click me', href: '#' }
    case 'video':
      return { src: '', controls: true }
    case 'divider':
      return { style: 'solid', color: '#cccccc', thickness: '1px' }
    case 'spacer':
      return { height: '40px' }
    case 'html':
      return { code: '<!-- Custom HTML -->' }
    default:
      return {}
  }
}
