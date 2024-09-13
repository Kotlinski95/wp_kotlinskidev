<?php
// Enqueue styles and scripts
function my_simple_theme_scripts() {
    wp_enqueue_style( 'style', get_stylesheet_uri() );
    wp_enqueue_style('nav-style', get_template_directory_uri() . '/styles/nav.css');
    wp_enqueue_style('page-style', get_template_directory_uri() . '/styles/page.css');
    wp_enqueue_style('footer-style', get_template_directory_uri() . '/styles/footer.css');
}
add_action( 'wp_enqueue_scripts', 'my_simple_theme_scripts' );
?>