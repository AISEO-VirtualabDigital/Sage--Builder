import { WpRestClient } from './wpRestClient'
import { ThemeStyleInjector } from './themeStyleInjector'
import { generateWpPostContent } from './blockMappers/gutenberg'
import type { Project } from '@/types'

export class WpSyncEngine {
  private client: WpRestClient
  private injector: ThemeStyleInjector

  constructor(siteUrl: string, username: string, password: string) {
    this.client = new WpRestClient({ siteUrl, username, password })
    this.injector = new ThemeStyleInjector({ siteUrl })
  }

  async syncProject(project: Project, postId?: number): Promise<{ postId: number }> {
    const [blockContent, renderedHtml] = await Promise.all([
      Promise.resolve(generateWpPostContent(project)),
      Promise.resolve(this.renderProjectHtml(project)),
    ])
    const title = project.meta.title
    const meta = {
      ...project.meta,
      _sage_builder_json: JSON.stringify(project.root),
      _sage_custom_css: project.customCss,
      _sage_custom_js: project.customJs,
      _sage_rendered_html: renderedHtml,
    }

    if (postId) {
      await this.client.updatePost(postId, { title, content: blockContent, meta })
      return { postId }
    }
    const post = await this.client.createPost(title, blockContent)
    return { postId: post.id as number }
  }

  async getThemeCss(): Promise<string> {
    return this.injector.injectThemeCss()
  }

  private renderProjectHtml(project: Project): string {
    const walk = (node: Project['root']): string => {
      const children = (node.children || []).map(walk).join('')
      const props = node.props as Record<string, unknown>
      const content = typeof props.content === 'string' ? props.content : ''
      const src = typeof props.src === 'string' ? props.src : ''
      const alt = typeof props.alt === 'string' ? props.alt : ''
      const code = typeof props.code === 'string' ? props.code : ''
      const href = typeof props.href === 'string' ? props.href : '#'
      const tag = (props.tag as string) || 'div'

      switch (node.type) {
        case 'text':
          return `<p>${content}</p>`
        case 'heading':
          return `<h2>${content}</h2>`
        case 'image':
          return `<img src="${src}" alt="${alt}" />`
        case 'button':
          return `<a href="${href}" class="sage-button">${content}</a>`
        case 'html':
        case 'rawHtml':
          return code
        default:
          return `<${tag}>${children}</${tag}>`
      }
    }

    return `<!DOCTYPE html><html><head><title>${project.meta.title}</title></head><body>${walk(project.root)}</body></html>`
  }
}
