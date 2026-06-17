<?php
function kotlinskidev_render_page_loader(): void {
    echo '<div id="page-loader"><div class="spinner"></div></div>';
}
add_action('wp_body_open', 'kotlinskidev_render_page_loader');
