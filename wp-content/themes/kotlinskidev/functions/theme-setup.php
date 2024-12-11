<?php
// Theme setup function
function my_simple_theme_setup() {
    // Add default posts and comments RSS feed links to head.
    add_theme_support( 'automatic-feed-links' );

    // Let WordPress manage the document title.
    add_theme_support( 'title-tag' );

    // Enable support for Post Thumbnails on posts and pages.
    add_theme_support( 'post-thumbnails' );

    // Register menu location.
    register_nav_menus( array(
        'primary' => __( 'Primary Menu', 'my-simple-theme' ),
    ) );
}
add_action( 'after_setup_theme', 'my_simple_theme_setup' );
?>