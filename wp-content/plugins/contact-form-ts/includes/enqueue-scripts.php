<?php

// Global variable to track if contact form is used on the page
global $contact_form_ts_used;
$contact_form_ts_used = false;

/**
 * Enqueue editor assets (only for block editor)
 */
function contact_form_ts_enqueue_editor_assets() {
    // Only load in the block editor
    if ( is_admin() ) {
        $asset_file = include plugin_dir_path( __FILE__ ) . '../build/index.asset.php';
        
        wp_enqueue_script(
            'contact-form-ts-editor',
            plugins_url( '../build/index.js', __FILE__ ),
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        wp_enqueue_style(
            'contact-form-ts-editor-style',
            plugins_url( '../build/style-index.css', __FILE__ ),
            [],
            $asset_file['version']
        );
    }
}
add_action( 'enqueue_block_editor_assets', 'contact_form_ts_enqueue_editor_assets' );

/**
 * Mark that contact form is used on this page
 * This function is called from the render callback
 */
function contact_form_ts_mark_as_used() {
    global $contact_form_ts_used;
    $contact_form_ts_used = true;
}

/**
 * Conditionally enqueue frontend styles only if contact form is used
 */
function contact_form_ts_enqueue_frontend_styles() {
    global $contact_form_ts_used;
    
    // Only enqueue if the contact form is actually used on this page
    if ( $contact_form_ts_used && ! is_admin() ) {
        wp_enqueue_style(
            'contact-form-ts-frontend-style',
            plugins_url( '../build/style-index.css', __FILE__ ),
            [],
            filemtime( plugin_dir_path( __FILE__ ) . '../build/style-index.css' )
        );
    }
}
add_action( 'wp_enqueue_scripts', 'contact_form_ts_enqueue_frontend_styles' );

/**
 * Alternative method: Use render_block filter to detect and enqueue assets
 * This is a more modern WordPress approach for conditional asset loading
 */
function contact_form_ts_enqueue_on_render( $block_content, $block ) {
    // Check if this is our contact form block
    if ( isset( $block['blockName'] ) && $block['blockName'] === 'contact-form-ts/form' ) {
        // Mark as used for the wp_enqueue_scripts method above
        contact_form_ts_mark_as_used();
        
        // Alternative: Directly enqueue here (this method takes priority)
        if ( ! wp_style_is( 'contact-form-ts-frontend-style', 'enqueued' ) && ! is_admin() ) {
            wp_enqueue_style(
                'contact-form-ts-frontend-style',
                plugins_url( '../build/style-index.css', __FILE__ ),
                [],
                filemtime( plugin_dir_path( __FILE__ ) . '../build/style-index.css' )
            );
        }
    }
    
    return $block_content;
}
add_filter( 'render_block', 'contact_form_ts_enqueue_on_render', 10, 2 );

