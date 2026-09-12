import type { UiState } from './uiStore'

const STORAGE_KEY = 'virtualab_workspace_state'
const WORKSPACE_VERSION = 1

export function loadWorkspaceState(): Partial<UiState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.version !== WORKSPACE_VERSION) return null
    return parsed.state as Partial<UiState>
  } catch {
    return null
  }
}

export function saveWorkspaceState(state: UiState) {
  const payload = { version: WORKSPACE_VERSION, state }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function subscribeToPersistence(getState: () => { ui: UiState }) {
  let timeout: number | null = null
  const handler = () => {
    if (timeout) window.clearTimeout(timeout)
    timeout = window.setTimeout(() => {
      saveWorkspaceState(getState().ui)
    }, 500)
  }
  window.addEventListener('beforeunload', handler)
  return () => window.removeEventListener('beforeunload', handler)
}
