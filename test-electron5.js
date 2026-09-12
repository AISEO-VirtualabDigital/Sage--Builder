console.log('Testing dynamic import...')
import('electron').then(electron => {
  console.log('Dynamic import electron:', typeof electron)
  console.log('Dynamic import electron.default:', typeof electron.default)
  console.log('Dynamic import electron.default():', typeof electron.default())
  console.log('Electron keys:', Object.keys(electron))
  console.log('Electron.default keys:', Object.keys(electron.default || {}))
}).catch(e => {
  console.error('Dynamic import error:', e.message)
})
