export {}

declare global {
  interface Window {
    electronAPI?: {
      saveProject: (path: string, data: unknown) => Promise<{ success: boolean }>
      openProject: () => Promise<{ path: string; data: unknown } | null>
      exportHtml: (html: string) => Promise<{ success: boolean } | null>
      exportWpTheme: (themeData: { name: string; files: Record<string, string> }) => Promise<{ success: boolean; path?: string } | null>
    }
  }
}
