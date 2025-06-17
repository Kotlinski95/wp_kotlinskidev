<?php

/**
 * Plugin Name: Responsive Image
 * Description: A custom block that allows separate images for desktop and mobile in the block editor.
 * Version: 1.0.0
 * Author: Adrian Kotlinski
 */

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

function responsive_image_block_register()
{
    // Automatically load dependencies and version.
    $asset_file = include(plugin_dir_path(__FILE__) . 'build/index.asset.php');

    wp_register_script(
        'responsive-image-block-editor',
        plugins_url('build/index.js', __FILE__),
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    if (is_admin()) {
        wp_register_style(
            'responsive-image-block-style',
            plugins_url('build/style-index.css', __FILE__),
            array(),
            $asset_file['version'],
        );
    }


    register_block_type(__DIR__, array(
        'editor_script' => 'responsive-image-block-editor',
    ));
}

if (! is_admin()) {
    // Deregister the style so WP doesn't print it in the head
    // add_action('wp_enqueue_scripts', function () {
    //     wp_deregister_style('responsive-image-block-style');
    // }, 20);

    // Print the link tag in the footer
    add_action('wp_footer', function () {
        $href = plugins_url('build/style-index.css', __FILE__);
        $ver = filemtime(plugin_dir_path(__FILE__) . 'build/style-index.css');
        echo '<link rel="stylesheet" id="responsive-image-block-style-css" href="' . esc_url($href) . '?ver=' . $ver . '" type="text/css" media="all" />';
    });
}


add_action('init', 'responsive_image_block_register');
