import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveProject: (projectPath: string, data: unknown) => ipcRenderer.invoke('project:save', projectPath, data),
  openProject: () => ipcRenderer.invoke('project:open'),
  exportHtml: (html: string) => ipcRenderer.invoke('project:export-html', html),
  exportWpTheme: (themeData: { name: string; files: Record<string, string> }) => ipcRenderer.invoke('project:export-wp-theme', themeData),
  wpHealthCheck: (siteUrl: string, username: string, password: string) => ipcRenderer.invoke('wp:healthCheck', siteUrl, username, password),
  wpCreatePost: (siteUrl: string, username: string, password: string, title: string, content: string, status: string) => ipcRenderer.invoke('wp:createPost', siteUrl, username, password, title, content, status),
  wpGetPosts: (siteUrl: string, username: string, password: string, perPage: number) => ipcRenderer.invoke('wp:getPosts', siteUrl, username, password, perPage),
  ollamaListModels: () => ipcRenderer.invoke('ollama:list-models'),
})
