<?php
// Enqueue styles and scripts
function my_simple_theme_scripts() {
    wp_enqueue_style('global-style', get_template_directory_uri() . '/build/main.css');
}
add_action( 'wp_enqueue_scripts', 'my_simple_theme_scripts' );

// Preload critical.css for faster rendering
function preload_critical_css() {
    wp_enqueue_style('preload-style', get_template_directory_uri() . '/build/critical.css', false, null);
    add_filter( 'style_loader_tag',  'preload_filter', 10, 2 );
    function preload_filter( $html, $handle ){
        if (strcmp($handle, 'preload-style') == 0) {
            $html = str_replace("rel='stylesheet'", "rel='preload' as='style' onload='this.rel=\"stylesheet\"'", $html);
        }
        return $html;
    }
}
add_action( 'wp_head', 'preload_critical_css', 1 );
?>

