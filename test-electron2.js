console.log('Testing electron/main...')
try {
  const electronMain = require('electron/main')
  console.log('electron/main:', typeof electronMain)
  console.log('electron/main.app:', typeof electronMain.app)
} catch (e) {
  console.error('electron/main error:', e.message)
}

console.log('Testing electron/renderer...')
try {
  const electronRenderer = require('electron/renderer')
  console.log('electron/renderer:', typeof electronRenderer)
} catch (e) {
  console.error('electron/renderer error:', e.message)
}
