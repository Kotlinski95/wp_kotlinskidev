<?php
function kotlinskidev_enqueue_admin_bar_styles(): void
{
    if ( ! is_admin_bar_showing() ) {
        return;
    }

    wp_enqueue_style(
        'kotlinskidev-admin-bar',
        get_template_directory_uri() . '/build/admin-bar.css',
        [],
        wp_get_theme()->get( 'Version' )
    );
}
add_action( 'wp_enqueue_scripts', 'kotlinskidev_enqueue_admin_bar_styles' );
