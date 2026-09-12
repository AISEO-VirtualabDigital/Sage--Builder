console.log('Testing dynamic import...')
import('electron').then(electron => {
  console.log('Dynamic import electron:', typeof electron)
  console.log('Dynamic import electron.default:', typeof electron.default)
  console.log('Dynamic import electron.app:', typeof electron.app)
}).catch(e => {
  console.error('Dynamic import error:', e.message)
})
