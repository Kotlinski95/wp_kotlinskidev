// /src/scripts/scroll-to-top.ts
(function () {
  // Save scroll position on pagehide
  window.addEventListener('pagehide', () => {
    localStorage.setItem('scrollPosition', `${window.scrollY}`)
  })

  // Restore scroll position on pageshow only for back/forward navigation
  window.addEventListener('pageshow', (event) => {
    const navigationEntries = performance.getEntriesByType('navigation')
    const navigationType =
      navigationEntries.length > 0 &&
      navigationEntries[0] instanceof PerformanceNavigationTiming
        ? navigationEntries[0].type // Get the navigation type if available
        : event.persisted // Fallback for browsers not supporting Navigation Timing API
        ? 'back_forward'
        : 'navigate'

    if (navigationType === 'back_forward') {
      const scrollPosition = localStorage.getItem('scrollPosition')
      if (scrollPosition) {
        window.scrollTo(0, +scrollPosition)
      }
    }
  })
})()
