;(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const box = document.querySelector('.box')
    const ball = document.querySelector('.ball')
    const themeToggleButton = document.getElementById(
      'theme-toggle',
    ) as HTMLInputElement
    if (!themeToggleButton) return
    if (localStorage.getItem('theme') === 'light') {
      document.body?.classList?.add('light-mode')

      themeToggleButton.checked = true
      box?.setAttribute('style', 'background-color:black; color:white;')
      ball?.setAttribute('style', 'transform:translatex(0%);')
    } else {
      themeToggleButton.checked = false
      box?.setAttribute('style', 'background-color:white;')
      ball?.setAttribute('style', 'transform:translatex(80%);')
    }

    themeToggleButton.addEventListener('change', function (
      this: HTMLInputElement,
    ) {
      if (this.checked) {
        document.body?.classList?.add('light-mode')
        localStorage.setItem('theme', 'light')

        box?.setAttribute('style', 'background-color:black; color:white;')
        ball?.setAttribute('style', 'transform:translatex(0%);')
      } else {
        document.body?.classList?.remove('light-mode')
        localStorage.removeItem('theme')
        box?.setAttribute('style', 'background-color:white;')
        ball?.setAttribute('style', 'transform:translatex(80%);')
      }
    })
  })
})()
