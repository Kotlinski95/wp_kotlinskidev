<?php

function contact_form_ts_enqueue_assets() {
    wp_enqueue_script(
        'contact-form-ts-editor',
        plugins_url( '../build/index.js', __FILE__ ),
        filemtime( plugin_dir_path( __FILE__ ) . '../build/index.js' ),
        '1.0.0',
        true // Load script in footer (defer)
    );

    // This add the styles inside <head>
    if ( is_admin() ) {
        wp_enqueue_style(
            'contact-form-ts-style',
            plugins_url( '../build/style-index.css', __FILE__ ),
            [],
            filemtime( plugin_dir_path( __FILE__ ) . '../build/style-index.css' )
        );
    }
}
add_action( 'enqueue_block_editor_assets', 'contact_form_ts_enqueue_assets' );
add_action( 'wp_enqueue_scripts', 'contact_form_ts_enqueue_assets' );

// // Deregister the style so WP doesn't print it in the head
add_action('wp_enqueue_scripts', function() {
    if ( ! is_admin() ) {
        wp_deregister_style('contact-form-ts-style');
    }
}, 20);

// Print the link tag in the footer
if ( ! is_admin() ) {
    add_action('wp_footer', function() {
        $href = plugins_url('../build/style-index.css', __FILE__);
        $ver = filemtime(plugin_dir_path(__FILE__) . '../build/style-index.css');
        echo '<link rel="stylesheet" id="contact-form-ts-style-css" href="' . esc_url($href) . '?ver=' . $ver . '" type="text/css" media="all" />';
    });
}

