const module = require('module')
const path = require('path')

// Create a require function that looks for built-in electron first
const customRequire = module.createRequire(path.join(__dirname, 'test-electron7.js'))

console.log('Testing custom require...')
try {
  const electron = customRequire('electron')
  console.log('Custom require electron:', typeof electron)
  console.log('Custom require electron.app:', typeof electron.app)
} catch (e) {
  console.error('Custom require error:', e.message)
}
