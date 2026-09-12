export type ThemeStyleInjectorConfig = {
  siteUrl: string
  themeSlug?: string
  selectors?: string[]
}

export class ThemeStyleInjector {
  private config: ThemeStyleInjectorConfig
  private cache: Map<string, string> = new Map()

  constructor(config: ThemeStyleInjectorConfig) {
    this.config = config
  }

  async injectThemeCss(): Promise<string> {
    const cacheKey = this.config.themeSlug || 'default'
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!

    let css = ''
    if (this.config.siteUrl) {
      try {
        const res = await fetch(`${this.config.siteUrl}/wp-content/themes/${this.config.themeSlug || 'astra'}/style.css`)
        if (res.ok) css = await res.text()
      } catch {
        css = ''
      }
    }
    this.cache.set(cacheKey, css)
    return css
  }

  async injectKadenceCss(): Promise<string> {
    const cacheKey = 'kadence-styles'
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!

    let css = ''
    if (this.config.siteUrl) {
      try {
        const res = await fetch(`${this.config.siteUrl}/wp-content/themes/kadence/assets/css/style.min.css`)
        if (res.ok) css = await res.text()
      } catch {
        css = ''
      }
    }
    this.cache.set(cacheKey, css)
    return css
  }

  clearCache() {
    this.cache.clear()
  }
}
