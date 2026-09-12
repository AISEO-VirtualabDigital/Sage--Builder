import type { ElementNode, Project } from '@/types'

export function applyAstraThemeAdapter(project: Project): Project {
  const astraPrefix = 'ast-'
  const adaptedRoot = applyNodeAstraClasses(project.root, astraPrefix)
  return { ...project, root: adaptedRoot }
}

function applyNodeAstraClasses(node: ElementNode, prefix: string): ElementNode {
  const styles = node.styles || {}
  const attrs = { ...node.attributes }
  if (styles.backgroundColor) attrs.class = `${attrs.class || ''} ${prefix}has-bg-color`.trim()
  if (styles.textAlign === 'center') attrs.class = `${attrs.class || ''} ${prefix}text-align-center`.trim()
  if (node.type === 'container' || node.type === 'section') attrs.class = `${attrs.class || ''} ${prefix}container`.trim()
  if (node.type === 'row') attrs.class = `${attrs.class || ''} ${prefix}row`.trim()
  if (node.type === 'column') attrs.class = `${attrs.class || ''} ${prefix}column`.trim()
  return {
    ...node,
    attributes: attrs,
    children: (node.children || []).map((child) => applyNodeAstraClasses(child, prefix)),
  }
}

export function generateAstraCss(project: Project): string {
  const css = project.customCss || ''
  const astraOverrides = `
/* Astra Theme Adapter */
.ast-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.ast-row { display: flex; flex-wrap: wrap; margin: 0 -10px; }
.ast-column { flex: 1; min-width: 200px; padding: 0 10px; }
.ast-text-align-center { text-align: center; }
.ast-has-bg-color { position: relative; }
`
  return css + astraOverrides
}
