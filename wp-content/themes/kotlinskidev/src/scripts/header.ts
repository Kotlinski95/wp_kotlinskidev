(function () {
  const header = document.querySelector('header');
    function adjustHeaderWidth() {
        if (header && header.clientWidth > document.body.clientWidth) {
            (header as HTMLElement).style.maxWidth = `${document.body.clientWidth}px`;
        } else if (header) {
            (header as HTMLElement).style.maxWidth = '';
        }
    }

    adjustHeaderWidth();
    window.addEventListener('resize', adjustHeaderWidth);

})();