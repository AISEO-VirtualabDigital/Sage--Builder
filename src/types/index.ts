export type ElementType =
  // core layout (existing)
  | 'container' | 'row' | 'column'
  // basic (existing + VC variants)
  | 'text' | 'textBlock' | 'text-simple' | 'googleFontsHeading' | 'heading'
  | 'image' | 'singleImage' | 'flickrImage' | 'instagramImage'
  | 'button' | 'basicButton' | 'outlineButton'
  | 'video' | 'youtubePlayer' | 'vimeoPlayer'
  | 'divider' | 'separator' | 'separatorIcon' | 'separatorTitle'
  | 'spacer'
  | 'html' | 'rawHtml' | 'rawJs' | 'shortcode'
  // LC modules
  | 'accordion' | 'tabs' | 'faqToggle'
  | 'icon' | 'feature' | 'featureSection' | 'featureDescription' | 'infobox' | 'logo'
  | 'imageGallery' | 'imageMasonryGallery' | 'simpleImageSlider' | 'galleries' | 'gallery'
  | 'blog' | 'posts' | 'loops' | 'projects' | 'staff' | 'partners' | 'testimonials'
  | 'progressBars' | 'progress-bars' | 'countdown' | 'separator'
  | 'navigation' | 'notification' | 'section' | 'sliders' | 'social' | 'downloads'
  | 'woocommerce'
  | 'widgets' | 'wpWidgetsCustom' | 'wpWidgetsDefault'
  | 'callToAction' | 'cta'
  // LC template parts
  | 'tp-title' | 'tp-content' | 'tp-excerpt' | 'tp-thumbnail' | 'tp-meta' | 'tp-link' | 'tp-comments' | 'tp-comments-form' | 'tp-downloads-button' | 'tp-gallery-slider' | 'tp-project-slider' | 'tp-staff-social'
  // VC social/media
  | 'facebookLike' | 'twitterButton' | 'twitterGrid' | 'twitterTimeline' | 'twitterTweet' | 'pinterestPinit' | 'heroSection'
  | 'googleMaps'

export type StyleProps = {
  backgroundColor?: string
  backgroundImage?: string
  padding?: string
  margin?: string
  borderRadius?: string
  border?: string
  textAlign?: 'left' | 'center' | 'right'
  color?: string
  fontSize?: string
  fontWeight?: string
  width?: string
  height?: string
  [key: string]: string | undefined
}

export type ElementNode = {
  id: string
  type: ElementType
  children?: ElementNode[]
  props: Record<string, unknown>
  styles: StyleProps
  attributes: Record<string, string>
  customCode?: string
}

export type Project = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  root: ElementNode
  customCss: string
  customJs: string
  meta: {
    title: string
    description: string
    author: string
    keywords?: string
    canonical?: string
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
  }
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile'

export type EditorMode = 'builder' | 'code' | 'preview'

export type BuilderMode = 'local' | 'hybrid' | 'remote'

export type AiProvider = 'local' | 'openrouter' | 'gemini' | 'anthropic' | 'ollama'

export type AiConfig = {
  provider: AiProvider
  apiKey?: string
  model?: string
  endpoint?: string
}

export type WpSiteConfig = {
  url: string
  username: string
  appPassword: string
  activeTheme?: string
}
