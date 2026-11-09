<?php
function kotlinskidev_render_page_loader(): void {
    echo '<div id="page-loader"><div class="spinner"></div></div>';
    echo '<noscript><style>#page-loader{display:none}</style></noscript>';
}
add_action('wp_body_open', 'kotlinskidev_render_page_loader');

function kotlinskidev_render_page_loader_dismiss(): void {
    echo '<script>(function(){var d=function(){document.body.classList.add("loaded")};if(window.requestAnimationFrame){requestAnimationFrame(d)}else{d()}setTimeout(d,1500)})()</script>';
}
add_action('wp_footer', 'kotlinskidev_render_page_loader_dismiss', PHP_INT_MAX);
