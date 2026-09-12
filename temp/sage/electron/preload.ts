import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveProject: (projectPath: string, data: unknown) =>
    ipcRenderer.invoke('project:save', projectPath, data),
  openProject: () => ipcRenderer.invoke('project:open'),
  exportHtml: (html: string) => ipcRenderer.invoke('project:export-html', html),
  exportWpTheme: (themeData: { name: string; files: Record<string, string> }) =>
    ipcRenderer.invoke('project:export-wp-theme', themeData),
})
