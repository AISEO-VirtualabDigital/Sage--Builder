const path = require('path')
const moduleLib = require('module')

// Create a require function that looks for built-in electron first
const customRequire = moduleLib.createRequire(path.join(__dirname, 'test-electron8.cjs'))

console.log('Testing custom require...')
try {
  const electron = customRequire('electron')
  console.log('Custom require electron:', typeof electron)
  console.log('Custom require electron.app:', typeof electron.app)
} catch (e) {
  console.error('Custom require error:', e.message)
}
