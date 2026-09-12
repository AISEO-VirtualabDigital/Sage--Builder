import { app, BrowserWindow, Menu, shell, dialog, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'SAGE Builder',
    backgroundColor: '#0f1110',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devUrl)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function buildMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    { label: 'File', submenu: [{ role: 'quit' }] },
    { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
    { label: 'Help', submenu: [{ label: 'Learn More', click: async () => { await shell.openExternal('https://virtualabdigital.com') } }] },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(() => {
  createWindow()
  buildMenu()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })

// IPC handlers
ipcMain.handle('project:save', async (_event, projectPath: string, data: unknown) => {
  await fs.writeFile(projectPath, JSON.stringify(data, null, 2), 'utf-8')
  return { success: true }
})

ipcMain.handle('project:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [{ name: 'SAGE Project', extensions: ['sage', 'json'] }],
  })
  if (result.canceled) return null
  const content = await fs.readFile(result.filePaths[0], 'utf-8')
  return { path: result.filePaths[0], data: JSON.parse(content) }
})

ipcMain.handle('project:export-html', async (_event, html: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, { filters: [{ name: 'HTML', extensions: ['html'] }] })
  if (result.canceled) return null
  await fs.writeFile(result.filePath!, html)
  return { success: true }
})

ipcMain.handle('project:export-wp-theme', async (_event, themeData: { name: string; files: Record<string, string> }) => {
  const result = await dialog.showSaveDialog(mainWindow!, { properties: ['createDirectory', 'openDirectory'] as any })
  if (result.canceled) return null
  const baseDir = result.filePath!
  await fs.mkdir(baseDir, { recursive: true })
  for (const [filePath, content] of Object.entries(themeData.files)) {
    const fullPath = path.join(baseDir, filePath)
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, content)
  }
  return { success: true, path: baseDir }
})

// Ollama model auto-detection
ipcMain.handle('ollama:list-models', async () => {
  try {
    const res = await fetch('http://localhost:11434/api/tags')
    if (!res.ok) return { success: false, models: [], error: `HTTP ${res.status}` }
    const data = await res.json()
    return { success: true, models: (data.models || []).map((m: any) => m.name) }
  } catch (error) {
    return { success: false, models: [], error: (error as Error).message }
  }
})

// WP REST handlers
ipcMain.handle('wp:healthCheck', async (_event, siteUrl: string, username: string, password: string) => {
  try {
    const response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, {
      headers: { Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}` },
    })
    return { success: response.ok, status: response.status }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('wp:createPost', async (_event, siteUrl: string, username: string, password: string, title: string, content: string, status: string) => {
  try {
    const response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, status: status || 'draft' }),
    })
    if (!response.ok) throw new Error(`Post creation failed: ${response.status}`)
    return { success: true, data: await response.json() }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('wp:getPosts', async (_event, siteUrl: string, username: string, password: string, perPage: number) => {
  try {
    const response = await fetch(`${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts?per_page=${perPage || 10}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}` },
    })
    if (!response.ok) throw new Error(`Failed to fetch posts: ${response.status}`)
    return { success: true, data: await response.json() }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})
