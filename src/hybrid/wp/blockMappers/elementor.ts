import type { ElementNode, Project } from '@/types'

export function mapToElementorWidgets(project: Project): elementorWidget[] {
  return (project.root.children || []).map(mapNodeToElementor).filter(Boolean) as elementorWidget[]
}

export type elementorWidget = {
  widgetType: string
  settings: Record<string, unknown>
  elements?: elementorWidget[]
}

export function generateElementorJson(project: Project): string {
  const widgets = mapToElementorWidgets(project)
  return JSON.stringify({ type: 'page', elements: widgets }, null, 2)
}

function mapNodeToElementor(node: ElementNode): elementorWidget | null {
  const settings = buildElementorSettings(node)
  const children = node.children || []
  switch (node.type) {
    case 'text':
    case 'textBlock':
      return { widgetType: 'text-editor', settings: { ...settings, editor: (node.props.content as string) || '' } }
    case 'heading':
    case 'googleFontsHeading':
      return { widgetType: 'heading', settings: { ...settings, title: (node.props.content as string) || '', size: 'h2' } }
    case 'image':
    case 'singleImage':
      return { widgetType: 'image', settings: { ...settings, image: { url: (node.props.src as string) || '', alt: (node.props.alt as string) || '' } } }
    case 'button':
    case 'basicButton':
      return { widgetType: 'button', settings: { ...settings, text: (node.props.label as string) || '', link: { url: (node.props.href as string) || '#' } } }
    case 'video':
    case 'youtubePlayer':
      return { widgetType: 'video', settings: { ...settings, video_type: 'youtube', youtube_url: (node.props.src as string) || '' } }
    case 'container':
    case 'section':
    case 'row':
      return { widgetType: 'container', settings, elements: children.map(mapNodeToElementor).filter(Boolean) as elementorWidget[] }
    case 'column':
      return { widgetType: 'column', settings, elements: children.map(mapNodeToElementor).filter(Boolean) as elementorWidget[] }
    case 'spacer':
      return { widgetType: 'spacer', settings: { ...settings, space: parseInt((node.props.height as string) || '40') || 40 } }
    case 'divider':
    case 'separator':
      return { widgetType: 'divider', settings: { ...settings, style: { type: (node.props.style as string) || 'solid', color: (node.props.color as string) || '#cccccc' } } }
    case 'html':
    case 'rawHtml':
      return { widgetType: 'html', settings: { ...settings, html: (node.props.code as string) || '' } }
    default:
      if (children.length > 0) {
        return { widgetType: 'container', settings, elements: children.map(mapNodeToElementor).filter(Boolean) as elementorWidget[] }
      }
      return { widgetType: 'text-editor', settings: { ...settings, editor: '' } }
  }
}

function buildElementorSettings(node: ElementNode): Record<string, unknown> {
  const settings: Record<string, unknown> = {}
  const styles = node.styles || {}
  if (styles.backgroundColor) settings.background_background = 'classic'
  if (styles.backgroundColor) settings.background_color = styles.backgroundColor
  if (styles.padding) settings.padding = { unit: 'px', top: styles.padding, right: styles.padding, bottom: styles.padding, left: styles.padding }
  if (styles.margin) settings.margin = { unit: 'px', top: styles.margin, right: styles.margin, bottom: styles.margin, left: styles.margin }
  if (styles.borderRadius) settings.border_border_radius = styles.borderRadius
  if (node.attributes) Object.assign(settings, node.attributes)
  return settings
}
