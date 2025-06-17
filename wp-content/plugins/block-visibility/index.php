<?php

/**
 * Plugin Name: Block Visibility (Mobile/Desktop)
 * Description: Adds a visibility option (mobile/desktop/both) to all blocks in the block editor.
 * Version: 1.0.0
 * Author: Adrian Kotlinski
 */

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/admin.php';

function block_visibility_enqueue_editor_assets()
{
    wp_enqueue_script(
        'block-visibility-editor',
        plugins_url('build/index.js', __FILE__),
        array('wp-blocks', 'wp-element', 'wp-edit-post', 'wp-components', 'wp-compose', 'wp-hooks', 'wp-i18n', 'wp-block-editor'),
        filemtime(plugin_dir_path(__FILE__) . 'build/index.js'),
        true
    );
    if (is_admin()) {
        wp_enqueue_style(
            'block-visibility-style',
            plugins_url('build/style-index.css', __FILE__),
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'build/style-index.css'),
            array(),
        );
    }
}
add_action('enqueue_block_editor_assets', 'block_visibility_enqueue_editor_assets');

function block_visibility_enqueue_frontend_assets()
{
    wp_enqueue_style(
        'block-visibility-style',
        plugins_url('build/style-index.css', __FILE__),
        array(),
        filemtime(plugin_dir_path(__FILE__) . 'build/style-index.css')
    );
}
add_action('wp_enqueue_scripts', 'block_visibility_enqueue_frontend_assets');

function block_visibility_output_breakpoint_css()
{
    $breakpoint = intval(get_option('block_visibility_breakpoint', 767));
    echo '<style>';
    echo '.is-visible-desktop { display: block; }';
    echo '.is-visible-mobile { display: block; }';
    echo '@media (max-width: ' . $breakpoint . 'px) {';
    echo '  .is-visible-desktop { display: none !important; }';
    echo '}';
    echo '@media (min-width: ' . ($breakpoint + 1) . 'px) {';
    echo '  .is-visible-mobile { display: none !important; }';
    echo '}';
    echo '</style>';
}
add_action('wp_head', 'block_visibility_output_breakpoint_css');
add_action('admin_head', 'block_visibility_output_breakpoint_css');

if (! is_admin()) {
    // Deregister the style so WP doesn't print it in the head
    // add_action('wp_enqueue_scripts', function () {
    //     wp_deregister_style('block-visibility-style');
    // }, 20);

    // Print the link tag in the footer
    add_action('wp_footer', function () {
        $href = plugins_url('build/style-index.css', __FILE__);
        $ver = filemtime(plugin_dir_path(__FILE__) . 'build/style-index.css');
        echo '<link rel="stylesheet" id="block-visibility-style-css" href="' . esc_url($href) . '?ver=' . $ver . '" type="text/css" media="all" />';
    });
}
