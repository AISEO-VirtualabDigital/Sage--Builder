import type { Project } from '@/types'
import { mapNodeToKadenceBlock } from './kadenceCommon'

export function mapToKadenceBlocks(project: Project): kadenceBlock[] {
  return (project.root.children || []).map(mapNodeToKadenceBlock).filter(Boolean) as kadenceBlock[]
}

export type kadenceBlock = {
  blockType: string
  attributes: Record<string, unknown>
  innerBlocks?: kadenceBlock[]
  innerHTML?: string
}

export function generateKadencePostContent(project: Project): string {
  const blocks = mapToKadenceBlocks(project)
  return serializeKadenceBlocks(blocks)
}

function serializeKadenceBlocks(blocks: kadenceBlock[]): string {
  return blocks
    .map((block) => {
      const attrsStr = JSON.stringify(block.attributes)
      if (block.innerBlocks && block.innerBlocks.length > 0) {
        const inner = `\n${serializeKadenceBlocks(block.innerBlocks)}\n`
        return `<!-- wp:kadence/row ${attrsStr} -->${inner}<!-- wp:endkadence/row -->`
      }
      return `<!-- wp:kadence/column ${attrsStr} -->${block.innerHTML || ''}<!-- wp:endkadence/column -->`
    })
    .join('\n')
}
