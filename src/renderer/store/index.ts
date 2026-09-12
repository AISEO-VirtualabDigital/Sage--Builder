export type RootState = {
  project: ReturnType<typeof import('./projectStore').default>
  ui: ReturnType<typeof import('./uiStore').default>
}

export type UiRootState = {
  ui: ReturnType<typeof import('./uiStore').default>
}
