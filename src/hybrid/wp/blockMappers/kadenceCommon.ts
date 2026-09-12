import type { ElementNode } from '@/types'
import type { kadenceBlock } from './kadence'

export function mapNodeToKadenceBlock(node: ElementNode): kadenceBlock | null {
  const attrs = buildKadenceAttrs(node)
  const children = node.children || []
  switch (node.type) {
    case 'row':
      return {
        blockType: 'kadence/row',
        attributes: { ...attrs, children: children.length },
        innerBlocks: children.map(mapNodeToKadenceBlock).filter(Boolean) as kadenceBlock[],
      }
    case 'column':
      return {
        blockType: 'kadence/column',
        attributes: attrs,
        innerBlocks: children.map(mapNodeToKadenceBlock).filter(Boolean) as kadenceBlock[],
      }
    case 'text':
    case 'textBlock':
      return {
        blockType: 'kadence/text',
        attributes: { ...attrs, text: (node.props.content as string) || '' },
      }
    case 'heading':
    case 'googleFontsHeading':
      return {
        blockType: 'kadence/heading',
        attributes: { ...attrs, text: (node.props.content as string) || '', level: parseInt((node.props.tag as string)?.replace('h', '') || '2') },
      }
    case 'image':
    case 'singleImage':
      return {
        blockType: 'kadence/image',
        attributes: { ...attrs, src: (node.props.src as string) || '', alt: (node.props.alt as string) || '' },
      }
    case 'button':
    case 'basicButton':
      return {
        blockType: 'kadence/button',
        attributes: { ...attrs, text: (node.props.label as string) || '', url: (node.props.href as string) || '#' },
      }
    case 'container':
    case 'section':
      return {
        blockType: 'kadence/container',
        attributes: attrs,
        innerBlocks: children.map(mapNodeToKadenceBlock).filter(Boolean) as kadenceBlock[],
      }
    case 'spacer':
      return {
        blockType: 'kadence/spacer',
        attributes: { ...attrs, height: (node.props.height as string) || '40px' },
      }
    case 'divider':
    case 'separator':
      return {
        blockType: 'kadence/separator',
        attributes: { ...attrs, color: (node.props.color as string) || '#cccccc', style: (node.props.style as string) || 'solid' },
      }
    default:
      if (children.length > 0) {
        return {
          blockType: 'kadence/container',
          attributes: attrs,
          innerBlocks: children.map(mapNodeToKadenceBlock).filter(Boolean) as kadenceBlock[],
        }
      }
      return {
        blockType: 'kadence/html',
        attributes: { ...attrs, code: (node.props.code as string) || '' },
      }
  }
}

function buildKadenceAttrs(node: ElementNode): Record<string, unknown> {
  const attrs: Record<string, unknown> = {}
  const styles = node.styles || {}
  if (styles.backgroundColor) attrs.background = styles.backgroundColor
  if (styles.padding) attrs.padding = styles.padding
  if (styles.margin) attrs.margin = styles.margin
  if (styles.borderRadius) attrs.borderRadius = styles.borderRadius
  if (styles.textAlign) attrs.align = styles.textAlign
  if (styles.color) attrs.color = styles.color
  if (node.attributes) Object.assign(attrs, node.attributes)
  return attrs
}
