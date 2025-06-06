<?php

function contact_form_ts_enqueue_assets() {
    wp_enqueue_script(
        'contact-form-ts-editor',
        plugins_url( '../build/index.js', __FILE__ ),
        filemtime( plugin_dir_path( __FILE__ ) . '../build/index.js' )
    );

    wp_enqueue_style(
        'contact-form-ts-style',
        plugins_url( '../build/style-index.css', __FILE__ ),
        [],
        filemtime( plugin_dir_path( __FILE__ ) . '../build/style-index.css' )
    );
}
add_action( 'enqueue_block_editor_assets', 'contact_form_ts_enqueue_assets' );
add_action( 'wp_enqueue_scripts', 'contact_form_ts_enqueue_assets' );
