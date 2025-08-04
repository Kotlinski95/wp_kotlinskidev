<?php
function kotlinskidev_tailwind_enqueue_editor_styles() {
    wp_enqueue_style('tailwind-editor', get_template_directory_uri() . '/build/tailwind.css', array(), '1.0.0', 'all');
}
add_action('enqueue_block_editor_assets', 'kotlinskidev_tailwind_enqueue_editor_styles');