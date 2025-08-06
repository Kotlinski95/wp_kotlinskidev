<?php
function defer_global_css()
{
    // Enqueue the global stylesheet with media="print" to prevent it from blocking render
    wp_enqueue_style('global-style', get_template_directory_uri() . '/build/main.css', [], null, 'print');

    // Add a filter to change the media attribute to "all" after loading
    add_filter('style_loader_tag', 'defer_css_media_attribute', 10, 2);
}
add_action('wp_enqueue_scripts', 'defer_global_css');

function defer_css_media_attribute($html, $handle)
{
    // Check if it's the global stylesheet
    if ('global-style' === $handle) {
        // Modify the link tag to use "media=print" initially
        $html = str_replace("rel='stylesheet'", "rel='stylesheet' media='print'", $html);

        // Add an onload event to change the media attribute to "all" after the page is loaded
        $html = str_replace("media='print'", "media='print' onload=\"this.media='all'\"", $html);
    }
    return $html;
}



// Preload critical.css for faster rendering
function preload_critical_css()
{
    // Critical CSS
    wp_enqueue_style('critical-style', get_template_directory_uri() . '/build/critical.css', false, null);
    // Icomoon fonts
    wp_enqueue_style('icomoon-style', get_template_directory_uri() . '/assets/css/icomoon.css', false, null);
    // Tailwind CSS
    wp_enqueue_style('tailwind-css', get_template_directory_uri() . '/build/tailwind.css', false, null);
    add_filter('style_loader_tag',  'preload_filter', 10, 2);
    function preload_filter($html, $handle)
    {
        if ($handle === 'critical-style' || $handle === 'icomoon-style' || $handle === 'tailwind-css') {
            $html = str_replace("rel='stylesheet'", "rel='preload' as='style' onload='this.rel=\"stylesheet\"'", $html);
        }
        return $html;
    }
}
add_action('wp_head', 'preload_critical_css', 1);

// Enqueue styles for the block editor (Gutenberg)
function kotlinskidev_editor_styles()
{
    // Load the same styles in the editor as on the frontend
    wp_enqueue_style(
        'kotlinskidev-editor-style',
        get_template_directory_uri() . '/build/main.css',
        array(),
        wp_get_theme()->get('Version')
    );

    // Also load critical CSS in editor
    wp_enqueue_style(
        'kotlinskidev-editor-critical',
        get_template_directory_uri() . '/build/critical.css',
        array(),
        wp_get_theme()->get('Version')
    );

    // Load Tailwind CSS in editor
    wp_enqueue_style(
        'kotlinskidev-editor-tailwind',
        get_template_directory_uri() . '/build/tailwind.css',
        array(),
        wp_get_theme()->get('Version')
    );

    // Load Editor overrides CSS in editor
    wp_enqueue_style(
        'kotlinskidev-editor-overrides',
        get_template_directory_uri() . '/build/editor.css',
        array(),
        wp_get_theme()->get('Version')
    );

    // Load banner carousel
    wp_enqueue_style(
        'kotlinskidev-banner-carousel-styles',
        get_template_directory_uri() . '/build/banner-carousel.css',
        array(),
        wp_get_theme()->get('Version')
    );
}
function kotlinskidev_editor_scripts()
{
    // Load the main JavaScript file in editor (includes scroll animations)
    wp_enqueue_script(
        'kotlinskidev-editor-index-js',
        get_template_directory_uri() . '/build/main.js',
        array(),
        wp_get_theme()->get('Version'),
        true
    );

    // Load critical JavaScript file in editor
    wp_enqueue_script(
        'kotlinskidev-editor-critical-js',
        get_template_directory_uri() . '/build/critical.js',
        array(),
        wp_get_theme()->get('Version'),
        true
    );

    // Load editor-only functionality (scroll animation controls)
    wp_enqueue_script(
        'kotlinskidev-editor-only',
        get_template_directory_uri() . '/build/editor.js',
        array(),
        wp_get_theme()->get('Version'),
        true
    );

    // Load banner carousel
    wp_enqueue_script(
        'kotlinskidev-banner-carousel',
        get_template_directory_uri() . '/build/banner-carousel.js',
        array(),
        wp_get_theme()->get('Version'),
        true
    );
}
add_action('enqueue_block_editor_assets', 'kotlinskidev_editor_styles');
add_action('enqueue_block_editor_assets', 'kotlinskidev_editor_scripts');
