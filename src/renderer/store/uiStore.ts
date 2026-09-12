import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type PanelId = 'elements' | 'layout' | 'canvas' | 'properties' | 'ai' | 'code' | 'seo'

export type PanelState = {
  id: PanelId
  visible: boolean
  collapsed: boolean
  width: number
  minWidth: number
  maxWidth: number
  docked: 'left' | 'right' | 'bottom' | 'floating' | 'hidden'
  order: number
}

export type WorkspaceLayout = {
  panels: Record<PanelId, PanelState>
  activeMode: 'builder' | 'code' | 'preview'
  viewport: 'desktop' | 'tablet' | 'mobile'
}

export type BubbleAction = 'add' | 'ai' | 'undo' | 'redo' | 'save' | 'export' | 'preview' | 'delete' | 'duplicate' | 'settings' | 'seo' | 'templates' | 'open' | 'new'

export type FloatingBubbleState = {
  visible: boolean
  x: number
  y: number
  expanded: boolean
  activeActions: BubbleAction[]
  contextType: 'none' | 'element' | 'canvas' | 'panel'
}

export type SnapSettings = {
  enabled: boolean
  gridSize: number
  threshold: number
  showGuides: boolean
  snapToElements: boolean
  snapToCanvas: boolean
}

export type CodeInjectionState = {
  globalCss: string
  globalJs: string
  elementCode: Record<string, { css: string; js: string }>
  activeElementId: string | null
}

export type UiState = {
  workspace: WorkspaceLayout
  bubble: FloatingBubbleState
  snap: SnapSettings
  codeInjection: CodeInjectionState
}

const defaultPanels: Record<PanelId, PanelState> = {
  elements: { id: 'elements', visible: true, collapsed: false, width: 256, minWidth: 180, maxWidth: 400, docked: 'left', order: 0 },
  layout: { id: 'layout', visible: false, collapsed: false, width: 256, minWidth: 180, maxWidth: 400, docked: 'left', order: 1 },
  canvas: { id: 'canvas', visible: true, collapsed: false, width: 0, minWidth: 300, maxWidth: 9999, docked: 'floating', order: 2 },
  properties: { id: 'properties', visible: true, collapsed: false, width: 320, minWidth: 240, maxWidth: 500, docked: 'right', order: 3 },
  ai: { id: 'ai', visible: false, collapsed: false, width: 320, minWidth: 240, maxWidth: 500, docked: 'right', order: 4 },
  code: { id: 'code', visible: false, collapsed: false, width: 0, minWidth: 300, maxWidth: 9999, docked: 'floating', order: 5 },
  seo: { id: 'seo', visible: false, collapsed: false, width: 280, minWidth: 240, maxWidth: 400, docked: 'right', order: 6 },
}

const initialState: UiState = {
  workspace: {
    panels: defaultPanels,
    activeMode: 'builder',
    viewport: 'desktop',
  },
  bubble: {
    visible: true,
    x: 24,
    y: 80,
    expanded: false,
    activeActions: ['add', 'ai', 'undo', 'save'],
    contextType: 'canvas',
  },
  snap: {
    enabled: true,
    gridSize: 8,
    threshold: 6,
    showGuides: true,
    snapToElements: true,
    snapToCanvas: true,
  },
  codeInjection: {
    globalCss: '',
    globalJs: '',
    elementCode: {},
    activeElementId: null,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPanelVisibility(state, action: PayloadAction<{ id: PanelId; visible: boolean }>) {
      const { id, visible } = action.payload
      const panel = state.workspace.panels[id]
      if (panel) {
        panel.visible = visible
        if (!visible) panel.collapsed = false
      }
    },
    togglePanel(state, action: PayloadAction<PanelId>) {
      const panel = state.workspace.panels[action.payload]
      if (panel) {
        panel.visible = !panel.visible
        if (!panel.visible) panel.collapsed = false
      }
    },
    setPanelCollapsed(state, action: PayloadAction<{ id: PanelId; collapsed: boolean }>) {
      const panel = state.workspace.panels[action.payload.id]
      if (panel) panel.collapsed = action.payload.collapsed
    },
    setPanelWidth(state, action: PayloadAction<{ id: PanelId; width: number }>) {
      const panel = state.workspace.panels[action.payload.id]
      if (panel) {
        panel.width = Math.max(panel.minWidth, Math.min(panel.maxWidth, action.payload.width))
      }
    },
    setPanelDocked(state, action: PayloadAction<{ id: PanelId; docked: PanelState['docked'] }>) {
      const panel = state.workspace.panels[action.payload.id]
      if (panel) {
        panel.docked = action.payload.docked
        if (action.payload.docked === 'hidden') panel.visible = false
      }
    },
    setWorkspaceMode(state, action: PayloadAction<'builder' | 'code' | 'preview'>) {
      state.workspace.activeMode = action.payload
    },
    setViewport(state, action: PayloadAction<'desktop' | 'tablet' | 'mobile'>) {
      state.workspace.viewport = action.payload
    },
    showBubble(state) { state.bubble.visible = true },
    hideBubble(state) { state.bubble.visible = false },
    setBubblePosition(state, action: PayloadAction<{ x: number; y: number }>) {
      state.bubble.x = action.payload.x
      state.bubble.y = action.payload.y
    },
    expandBubble(state) { state.bubble.expanded = true },
    collapseBubble(state) { state.bubble.expanded = false },
    toggleBubble(state) { state.bubble.expanded = !state.bubble.expanded },
    setBubbleContext(state, action: PayloadAction<FloatingBubbleState['contextType']>) {
      state.bubble.contextType = action.payload
    },
    setBubbleActions(state, action: PayloadAction<BubbleAction[]>) {
      state.bubble.activeActions = action.payload
    },
    setSnapEnabled(state, action: PayloadAction<boolean>) {
      state.snap.enabled = action.payload
    },
    setGridSize(state, action: PayloadAction<number>) {
      state.snap.gridSize = Math.max(1, action.payload)
    },
    setShowGuides(state, action: PayloadAction<boolean>) {
      state.snap.showGuides = action.payload
    },
    setGlobalCode(state, action: PayloadAction<{ css?: string; js?: string }>) {
      if (action.payload.css !== undefined) state.codeInjection.globalCss = action.payload.css
      if (action.payload.js !== undefined) state.codeInjection.globalJs = action.payload.js
    },
    setElementCode(state, action: PayloadAction<{ elementId: string; css?: string; js?: string }>) {
      const { elementId, css, js } = action.payload
      if (!state.codeInjection.elementCode[elementId]) {
        state.codeInjection.elementCode[elementId] = { css: '', js: '' }
      }
      if (css !== undefined) state.codeInjection.elementCode[elementId].css = css
      if (js !== undefined) state.codeInjection.elementCode[elementId].js = js
    },
    removeElementCode(state, action: PayloadAction<string>) {
      delete state.codeInjection.elementCode[action.payload]
      if (state.codeInjection.activeElementId === action.payload) {
        state.codeInjection.activeElementId = null
      }
    },
    setActiveCodeElement(state, action: PayloadAction<string | null>) {
      state.codeInjection.activeElementId = action.payload
    },
  },
})

export const {
  setPanelVisibility,
  togglePanel,
  setPanelCollapsed,
  setPanelWidth,
  setPanelDocked,
  setWorkspaceMode,
  setViewport,
  showBubble,
  hideBubble,
  setBubblePosition,
  expandBubble,
  collapseBubble,
  toggleBubble,
  setBubbleContext,
  setBubbleActions,
  setSnapEnabled,
  setGridSize,
  setShowGuides,
  setGlobalCode,
  setElementCode,
  removeElementCode,
  setActiveCodeElement,
} = uiSlice.actions

export const selectWorkspace = (state: { ui: UiState }) => state.ui.workspace
export const selectBubble = (state: { ui: UiState }) => state.ui.bubble
export const selectSnap = (state: { ui: UiState }) => state.ui.snap
export const selectCodeInjection = (state: { ui: UiState }) => state.ui.codeInjection
export const selectPanel = (id: PanelId) => (state: { ui: UiState }) => state.ui.workspace.panels[id]

export default uiSlice.reducer
