<?php
/**
 * Plugin Name: Responsive Image
 * Description: A custom block that allows separate images for desktop and mobile in the block editor.
 * Version: 1.0.0
 * Author: Adrian Kotlinski
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function responsive_image_block_register() {
    // Automatically load dependencies and version.
    $asset_file = include( plugin_dir_path( __FILE__ ) . 'build/index.asset.php' );

    wp_register_script(
        'responsive-image-block-editor',
        plugins_url( 'build/index.js', __FILE__ ),
        $asset_file['dependencies'],
        $asset_file['version']
    );

    wp_register_style(
        'responsive-image-block-style',
        plugins_url( 'build/style-index.css', __FILE__ ),
        array(),
        $asset_file['version']
    );

    register_block_type( __DIR__, array(
        'editor_script' => 'responsive-image-block-editor',
        'style'         => 'responsive-image-block-style',
    ) );
}
add_action( 'init', 'responsive_image_block_register' );
