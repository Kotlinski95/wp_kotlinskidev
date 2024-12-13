// /src/scripts/scroll-to-top.ts
;(function () {
  // Save scroll position on pagehide
  window.addEventListener('pagehide', () => {
    localStorage.setItem('scrollPosition', `${window.scrollY}`)
  })

  // Restore scroll position on pageshow
  window.addEventListener('pageshow', () => {
    const scrollPosition = localStorage.getItem('scrollPosition')
    if (scrollPosition) {
      window.scrollTo(0, +scrollPosition)
    }
  })
})()
