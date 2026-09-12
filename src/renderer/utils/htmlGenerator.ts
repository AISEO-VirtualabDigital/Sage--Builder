import type { ElementNode, Project } from '@/types'

export function generateHtml(project: Project, elementCode?: Record<string, { css: string; js: string }>): string {
  const body = renderNode(project.root, elementCode)
  const title = escapeHtml(project.meta.title || 'SAGE by Virtualab Digital')
  const description = escapeHtml(project.meta.description || '')
  const responsiveCss = generateResponsiveCss(project.root)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="author" content="${escapeHtml(project.meta.author || '')}" />
  ${project.meta.keywords ? `<meta name="keywords" content="${escapeHtml(project.meta.keywords)}" />` : ''}
  ${project.meta.canonical ? `<link rel="canonical" href="${escapeHtml(project.meta.canonical)}" />` : ''}
  <meta property="og:title" content="${escapeHtml(project.meta.ogTitle || title)}" />
  <meta property="og:description" content="${escapeHtml(project.meta.ogDescription || description)}" />
  ${project.meta.ogImage ? `<meta property="og:image" content="${escapeHtml(project.meta.ogImage)}" />` : ''}
  <meta property="og:type" content="website" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
    img { max-width: 100%; height: auto; }
    ${project.customCss}
    ${responsiveCss}
  </style>
</head>
<body>
  ${body}
  <script>
    ${project.customJs}
  </script>
</body>
</html>`
}

function renderNode(node: ElementNode, elementCode?: Record<string, { css: string; js: string }>): string {
  const children = (node.children || []).map((child) => renderNode(child, elementCode)).join('\n')
  const inline = toInlineStyle(node.styles)
  const scopedCss = elementCode?.[node.id]?.css ? `<style data-sage-scope="${node.id}">${elementCode[node.id].css}</style>` : ''
  const scopedJs = elementCode?.[node.id]?.js ? `<script data-sage-scope="${node.id}">(function(){${elementCode[node.id].js}})();</script>` : ''
  const showOn = node.props.showOn as string | undefined
  const visibilityClass = showOn ? ` data-sage-show-on="${showOn}"` : ''
  if (node.type === 'html' || node.type === 'rawHtml') {
    return scopedCss + String(node.props.code || '') + scopedJs
  }
  return `<div${inline ? ` style="${inline}"` : ''}${visibilityClass} data-sage-id="${node.id}">${scopedCss}${children}${scopedJs}</div>`
}

function generateResponsiveCss(root: ElementNode): string {
  const rules: string[] = []
  const walk = (node: ElementNode) => {
    const showOn = node.props.showOn as string | undefined
    if (showOn) {
      const devices = showOn.split(' ').map((s) => s.trim()).filter(Boolean)
      if (devices.includes('desktop') && !devices.includes('tablet')) {
        rules.push(`@media only screen and (max-width : 1024px) { [data-sage-show-on~="desktop"] { display: none !important; } }`)
      }
      if (devices.includes('tablet') && !devices.includes('desktop')) {
        rules.push(`@media only screen and (min-width : 768px) and (max-width : 1024px) { [data-sage-show-on~="tablet"] { display: none !important; } }`)
        rules.push(`@media only screen and ( max-width: 767px ) { [data-sage-show-on~="tablet"] { display: none !important; } }`)
      }
      if (devices.includes('phone') && !devices.includes('desktop')) {
        rules.push(`@media only screen and ( max-width: 767px ) { [data-sage-show-on~="phone"] { display: none !important; } }`)
      }
    }
    (node.children || []).forEach(walk)
  }
  walk(root)
  return rules.join('\n')
}

function toInlineStyle(styles: Record<string, string | undefined>): string {
  return Object.entries(styles)
    .filter(([, v]) => !!v)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ')
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
