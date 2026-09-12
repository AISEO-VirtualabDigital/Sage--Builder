import type { ElementNode, Project } from '@/types'

export function mapToGutenbergBlocks(project: Project): wpBlock[] {
  return project.root.children?.map(mapNodeToBlock).filter(Boolean) as wpBlock[] || []
}

export function mapNodeToBlock(node: ElementNode): wpBlock | null {
  const block = mapCoreBlock(node)
  if (block) return block
  return mapGenericBlock(node)
}

function mapCoreBlock(node: ElementNode): wpBlock | null {
  switch (node.type) {
    case 'text':
    case 'textBlock':
    case 'text-simple': {
      const content = (node.props.content as string) || ''
      return {
        blockName: 'core/paragraph',
        attrs: { content, align: (node.styles.textAlign as string) || undefined },
        innerBlocks: [],
        innerHTML: content,
      }
    }
    case 'heading':
    case 'googleFontsHeading': {
      const content = (node.props.content as string) || ''
      const tag = (node.props.tag as string) || 'h2'
      const level = parseInt(tag.replace('h', '')) || 2
      return {
        blockName: 'core/heading',
        attrs: { level, align: (node.styles.textAlign as string) || undefined, content },
        innerBlocks: [],
        innerHTML: `<${tag}>${content}</${tag}>`,
      }
    }
    case 'image':
    case 'singleImage': {
      const src = (node.props.src as string) || ''
      const alt = (node.props.alt as string) || ''
      return {
        blockName: 'core/image',
        attrs: { url: src, alt, align: (node.styles.textAlign as string) || undefined },
        innerBlocks: [],
        innerHTML: src ? `<img src="${src}" alt="${alt}" />` : '',
      }
    }
    case 'button':
    case 'basicButton':
    case 'outlineButton': {
      const label = (node.props.label as string) || ''
      const href = (node.props.href as string) || '#'
      const target = (node.props.target as string) || '_self'
      return {
        blockName: 'core/button',
        attrs: { url: href, linkTarget: target, align: (node.styles.textAlign as string) || undefined },
        innerBlocks: [],
        innerHTML: `<div class="wp-block-button"><a class="wp-block-button__link" href="${href}" target="${target}">${label}</a></div>`,
      }
    }
    case 'video':
    case 'youtubePlayer':
    case 'vimeoPlayer': {
      const src = (node.props.src as string) || ''
      return {
        blockName: 'core/video',
        attrs: { src, autoplay: node.props.autoplay as boolean, controls: node.props.controls as boolean },
        innerBlocks: [],
        innerHTML: src ? `<video src="${src}" controls></video>` : '',
      }
    }
    case 'html':
    case 'rawHtml': {
      const code = (node.props.code as string) || ''
      return {
        blockName: 'core/html',
        attrs: {},
        innerBlocks: [],
        innerHTML: code,
      }
    }
    case 'container':
    case 'section':
    case 'callToAction':
    case 'cta':
    case 'heroSection':
    case 'featureSection':
      return {
        blockName: 'core/group',
        attrs: { align: (node.styles.textAlign as string) || undefined },
        innerBlocks: (node.children || []).map(mapNodeToBlock).filter(Boolean) as wpBlock[],
        innerHTML: '',
      }
    case 'row':
      return {
        blockName: 'core/columns',
        attrs: {},
        innerBlocks: (node.children || []).map(mapNodeToBlock).filter(Boolean) as wpBlock[],
        innerHTML: '',
      }
    case 'column':
      return {
        blockName: 'core/column',
        attrs: {},
        innerBlocks: (node.children || []).map(mapNodeToBlock).filter(Boolean) as wpBlock[],
        innerHTML: '',
      }
    case 'spacer':
      return {
        blockName: 'core/spacer',
        attrs: { height: (node.props.height as string) || '40px' },
        innerBlocks: [],
        innerHTML: `<div style="height: ${(node.props.height as string) || '40px'};"></div>`,
      }
    case 'divider':
    case 'separator':
      return {
        blockName: 'core/separator',
        attrs: { color: (node.props.color as string) || '#cccccc', style: (node.props.style as string) || 'solid' },
        innerBlocks: [],
        innerHTML: `<hr style="border: ${(node.props.thickness as string) || '1px'} ${(node.props.style as string) || 'solid'} ${(node.props.color as string) || '#cccccc'};" />`,
      }
    case 'accordion':
      return {
        blockName: 'core/details',
        attrs: {},
        innerBlocks: (node.children || []).map(mapNodeToBlock).filter(Boolean) as wpBlock[],
        innerHTML: '',
      }
    case 'tabs':
      return {
        blockName: 'core/tabs',
        attrs: {},
        innerBlocks: (node.children || []).map(mapNodeToBlock).filter(Boolean) as wpBlock[],
        innerHTML: '',
      }
    case 'navigation':
      return {
        blockName: 'core/navigation',
        attrs: { overlayMenu: 'never' },
        innerBlocks: [],
        innerHTML: '<nav>...</nav>',
      }
    default:
      return null
  }
}

function mapGenericBlock(node: ElementNode): wpBlock {
  const children = (node.children || []).map(mapNodeToBlock).filter(Boolean) as wpBlock[]
  const styleStr = Object.entries(node.styles || {})
    .filter(([, v]) => !!v)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
    .join('; ')
  return {
    blockName: 'core/html',
    attrs: {},
    innerBlocks: children,
    innerHTML: styleStr ? `<div style="${styleStr}">${children.map((b) => b.innerHTML).join('')}</div>` : '',
  }
}

export type wpBlock = {
  blockName: string
  attrs: Record<string, unknown>
  innerBlocks: wpBlock[]
  innerHTML: string
}

export function generateWpPostContent(project: Project): string {
  const blocks = mapToGutenbergBlocks(project)
  return serializeBlocks(blocks)
}

function serializeBlocks(blocks: wpBlock[]): string {
  return blocks
    .map((block) => {
      const attrsStr = Object.keys(block.attrs).length ? JSON.stringify(block.attrs) : '{}'
      if (block.innerBlocks.length === 0 && !block.innerHTML) {
        return `<!-- wp:${block.blockName} ${attrsStr} /-->`
      }
      const inner = block.innerBlocks.length ? `\n${serializeBlocks(block.innerBlocks)}\n` : block.innerHTML
      return `<!-- wp:${block.blockName} ${attrsStr} -->${inner}<!-- wp:end${block.blockName} -->`
    })
    .join('\n')
}
