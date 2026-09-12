import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ElementNode, Project } from '../types'
import { v4 as uuidv4 } from 'uuid'

const emptyProject = (): Project => ({
  id: uuidv4(),
  name: 'Untitled Project',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  root: {
    id: 'root',
    type: 'container',
    children: [],
    props: {},
    styles: {},
    attributes: {},
  },
  customCss: '',
  customJs: '',
  meta: {
    title: 'My Virtualab Digital Website',
    description: '',
    author: '',
  },
})

const initialState = {
  project: emptyProject() as Project,
  selectedElementId: null as string | null,
  history: [] as Project[],
  historyIndex: -1,
  _historyPaused: false as boolean,
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProject(state, action: PayloadAction<Project>) {
      state.project = action.payload
      state.selectedElementId = null
    },
    addElement(state, action: PayloadAction<{ type: string; position?: 'append' | 'before' | 'after'; targetId?: string }>) {
      const { type, position = 'append', targetId } = action.payload
      const parentId = targetId || state.selectedElementId || 'root'
      const parent = findElement(state.project.root, parentId)
      if (!parent) return
      const isContainer = ['container', 'row', 'column', 'section', 'heroSection', 'featureSection', 'tabs', 'accordion'].includes(type)
      const newNode: ElementNode = {
        id: uuidv4(),
        type: type as ElementNode['type'],
        children: isContainer ? [] : undefined,
        props: defaultPropsForType(type),
        styles: {},
        attributes: {},
      }
      if (!parent.children) parent.children = []
      if (position === 'append' || !targetId) {
        parent.children.push(newNode)
      } else if (position === 'before' && targetId !== 'root') {
        const targetParent = findParent(state.project.root, targetId)
        if (targetParent?.children) {
          const idx = targetParent.children.findIndex((c) => c.id === targetId)
          if (idx >= 0) targetParent.children.splice(idx, 0, newNode)
          else targetParent.children.push(newNode)
        } else {
          parent.children.push(newNode)
        }
      } else if (position === 'after' && targetId !== 'root') {
        const targetParent = findParent(state.project.root, targetId)
        if (targetParent?.children) {
          const idx = targetParent.children.findIndex((c) => c.id === targetId)
          if (idx >= 0) targetParent.children.splice(idx + 1, 0, newNode)
          else targetParent.children.push(newNode)
        } else {
          parent.children.push(newNode)
        }
      }
      state.project.updatedAt = new Date().toISOString()
      if (!state._historyPaused) {
        pushProjectHistory(state, state.project)
      }
    },
    updateElement(state, action: PayloadAction<{ id: string; updates: Partial<ElementNode> }>) {
      const { id, updates } = action.payload
      const el = findElement(state.project.root, id)
      if (!el) return
      Object.assign(el, updates)
      state.project.updatedAt = new Date().toISOString()
      if (!state._historyPaused) {
        pushProjectHistory(state, state.project)
      }
    },
    deleteElement(state, action: PayloadAction<string>) {
      const id = action.payload
      const parent = findParent(state.project.root, id)
      if (!parent || !parent.children) return
      parent.children = parent.children.filter((c) => c.id !== id)
      state.selectedElementId = null
      state.project.updatedAt = new Date().toISOString()
      if (!state._historyPaused) {
        pushProjectHistory(state, state.project)
      }
    },
    setSelectedElement(state, action: PayloadAction<string | null>) {
      state.selectedElementId = action.payload
    },
    moveElement(state, action: PayloadAction<{ id: string; targetParentId: string; index: number }>) {
      const { id, targetParentId, index } = action.payload
      const el = findElement(state.project.root, id)
      const parent = findParent(state.project.root, id)
      const targetParent = findElement(state.project.root, targetParentId)
      if (!el || !parent || !targetParent || !targetParent.children || !parent.children) return
      parent.children = parent.children.filter((c) => c.id !== id)
      targetParent.children.splice(Math.min(index, targetParent.children.length), 0, el)
      state.project.updatedAt = new Date().toISOString()
      if (!state._historyPaused) {
        pushProjectHistory(state, state.project)
      }
    },
    setMeta(state, action: PayloadAction<Project['meta']>) {
      state.project.meta = action.payload
      state.project.updatedAt = new Date().toISOString()
      if (!state._historyPaused) {
        pushProjectHistory(state, state.project)
      }
    },
    setCustomCode(state, action: PayloadAction<{ css?: string; js?: string }>) {
      if (action.payload.css !== undefined) state.project.customCss = action.payload.css
      if (action.payload.js !== undefined) state.project.customJs = action.payload.js
      state.project.updatedAt = new Date().toISOString()
      if (!state._historyPaused) {
        pushProjectHistory(state, state.project)
      }
    },
    undoProject(state) {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1
        const entry = state.history[state.historyIndex]
        if (entry) {
          state.project = JSON.parse(JSON.stringify(entry)) as Project
          state.selectedElementId = null
        }
      }
    },
    redoProject(state) {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex += 1
        const entry = state.history[state.historyIndex]
        if (entry) {
          state.project = JSON.parse(JSON.stringify(entry)) as Project
          state.selectedElementId = null
        }
      }
    },
    clearProjectHistory(state) {
      state.history = []
      state.historyIndex = -1
    },
    pauseHistory(state) {
      state._historyPaused = true
    },
    resumeHistory(state) {
      state._historyPaused = false
    },
  },
})

function pushProjectHistory(state: any, project: Project) {
  const entries = state.history.slice(0, state.historyIndex + 1)
  entries.push(JSON.parse(JSON.stringify(project)) as Project)
  if (entries.length > 50) {
    entries.shift()
  }
  state.history = entries
  state.historyIndex = entries.length - 1
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

function defaultPropsForType(type: string): Record<string, unknown> {
  switch (type) {
    case 'text':
    case 'textBlock':
    case 'text-simple':
      return { content: 'Text block', tag: 'p' }
    case 'heading':
    case 'googleFontsHeading':
      return { content: 'Heading', tag: 'h2', fontFamily: 'Inter' }
    case 'image':
    case 'singleImage':
    case 'flickrImage':
    case 'instagramImage':
      return { src: '', alt: 'Image', width: '100%', height: 'auto' }
    case 'button':
    case 'basicButton':
    case 'outlineButton':
      return { label: 'Click me', href: '#', target: '_self', style: type === 'outlineButton' ? 'outline' : 'solid' }
    case 'video':
    case 'youtubePlayer':
    case 'vimeoPlayer':
      return { src: '', autoplay: false, controls: true, provider: type }
    case 'divider':
    case 'separator':
      return { style: 'solid', color: '#cccccc', thickness: '1px', width: '100%' }
    case 'separatorIcon':
      return { style: 'solid', icon: '★', color: '#cccccc' }
    case 'separatorTitle':
      return { style: 'solid', title: 'Separator', color: '#cccccc' }
    case 'spacer':
      return { height: '40px' }
    case 'html':
    case 'rawHtml':
      return { code: '<!-- Custom HTML -->' }
    case 'rawJs':
    case 'shortcode':
      return { code: '[shortcode]', js: '' }
    case 'accordion':
      return { items: [{ title: 'Accordion 1', content: 'Content 1' }, { title: 'Accordion 2', content: 'Content 2' }] }
    case 'tabs':
      return { tabs: [{ title: 'Tab 1', content: 'Tab 1 content' }, { title: 'Tab 2', content: 'Tab 2 content' }] }
    case 'faqToggle':
      return { question: 'FAQ Question?', answer: 'Answer here', open: false }
    case 'icon':
      return { icon: '★', size: '24px', color: '#333' }
    case 'feature':
    case 'featureDescription':
      return { icon: '✔', title: 'Feature', description: 'Description' }
    case 'featureSection':
      return { title: 'Features', columns: 3 }
    case 'infobox':
      return { title: 'Info Box', content: 'Info content', icon: 'ℹ' }
    case 'logo':
      return { src: '', alt: 'Logo', height: '40px' }
    case 'imageGallery':
    case 'imageMasonryGallery':
    case 'simpleImageSlider':
    case 'galleries':
    case 'gallery':
    case 'tp-gallery-slider':
      return { images: [], columns: 3, lightbox: true }
    case 'blog':
    case 'posts':
    case 'loops':
      return { postType: 'post', count: 3, layout: 'grid', taxonomy: '' }
    case 'projects':
    case 'tp-project-slider':
      return { count: 3, layout: 'grid' }
    case 'staff':
    case 'tp-staff-social':
      return { name: 'John Doe', role: 'Developer', image: '', social: [] }
    case 'partners':
      return { logos: [] }
    case 'testimonials':
      return { quote: 'Great service!', author: 'Client' }
    case 'progressBars':
    case 'progress-bars':
      return { percent: 75, label: 'Progress', color: '#3b82f6' }
    case 'countdown':
      return { date: new Date(Date.now() + 86400000).toISOString(), format: 'd:h:m:s' }
    case 'navigation':
      return { menuId: 'primary', style: 'horizontal' }
    case 'notification':
      return { message: 'Notification', type: 'info' }
    case 'section':
      return { tag: 'section', fullWidth: false }
    case 'sliders':
      return { slides: [], autoplay: true }
    case 'social':
    case 'facebookLike':
    case 'twitterButton':
    case 'twitterGrid':
    case 'twitterTimeline':
    case 'twitterTweet':
    case 'pinterestPinit':
      return { url: '', style: 'default' }
    case 'googleMaps':
      return { address: '', lat: '0', lng: '0', zoom: 14, height: '300px' }
    case 'heroSection':
      return { title: 'Hero Title', subtitle: 'Subtitle', background: '', ctaLabel: 'Get Started', ctaHref: '#' }
    case 'callToAction':
    case 'cta':
      return { title: 'Call to Action', content: 'Join now', buttonLabel: 'Click Here', buttonHref: '#' }
    case 'tp-title':
    case 'tp-content':
    case 'tp-excerpt':
    case 'tp-thumbnail':
    case 'tp-meta':
    case 'tp-link':
    case 'tp-comments':
    case 'tp-comments-form':
      return { tag: 'div', linked: true }
    case 'tp-downloads-button':
      return { label: 'Download', file: '' }
    case 'downloads':
      return { file: '', label: 'Download' }
    case 'woocommerce':
      return { productId: '', layout: 'grid' }
    case 'widgets':
    case 'wpWidgetsCustom':
    case 'wpWidgetsDefault':
      return { widget: 'recent-posts', title: 'Widget' }
    default:
      return {}
  }
}

export const {
  setProject,
  addElement,
  updateElement,
  deleteElement,
  setSelectedElement,
  moveElement,
  setMeta,
  setCustomCode,
  undoProject,
  redoProject,
  clearProjectHistory,
  pauseHistory,
  resumeHistory,
} = projectSlice.actions

export default projectSlice.reducer
