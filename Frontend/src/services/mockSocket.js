// src/services/mockSocket.js
export function createMockSocket() {
  const listeners = {}

  function emit(event, data) {
    localStorage.setItem(
      'mockSocket',
      JSON.stringify({ event, data, timestamp: Date.now() })
    )
  }

  function on(event, callback) {
    listeners[event] = callback
  }

  // Listen for localStorage changes (simulate broadcast)
  window.addEventListener('storage', e => {
    if (e.key === 'mockSocket' && e.newValue) {
      const { event, data } = JSON.parse(e.newValue)
      if (listeners[event]) listeners[event](data)
    }
  })

  console.log('🧩 Mock socket ready (localStorage-based)')

  return { emit, on }
}
