<?php
function defer_global_css()
{
    // Enqueue the global stylesheet with media="print" to prevent it from blocking render
    wp_enqueue_style('global-style', get_template_directory_uri() . '/build/main.css', [], null, 'print');
}
add_action('wp_enqueue_scripts', 'defer_global_css');

// Inline critical JavaScript for frontend
function inline_critical_js()
{
    $critical_js_path = get_template_directory() . '/build/critical.js';
    if (!file_exists($critical_js_path)) {
        return;
    }

    // Cache the file contents — it only changes on build deploys.
    // filemtime() in the cache key auto-invalidates whenever the file changes.
    $cache_key  = 'kotlinskidev_critical_js_' . filemtime($critical_js_path);
    $critical_js = get_transient($cache_key);
    if ($critical_js === false) {
        $critical_js = file_get_contents($critical_js_path);
        if ($critical_js) {
            set_transient($cache_key, $critical_js, WEEK_IN_SECONDS);
        }
    }

    if ($critical_js) {
        echo '<script id="critical-js" charset="utf-8">' . $critical_js . '</script>';
    }
}
add_action('wp_head', 'inline_critical_js', 2); // Load after critical CSS

// Master filter for all CSS modifications
function master_css_filter($html, $handle)
{
    // Handle critical CSS protection
    if ($handle === 'critical-style') {
        $html = str_replace('<link', '<link data-no-optimize="1" data-critical="true"', $html);
    }
    
    // Handle main CSS defer - force media="print" and add onload
    if ($handle === 'global-style') {
        // Add protection attributes first
        $html = str_replace('<link', '<link data-no-defer="1" data-no-optimize="1"', $html);
        
        // Force media to "print" (override any plugin changes)
        $html = str_replace('media="all"', 'media="print"', $html);
        $html = str_replace("media='all'", "media='print'", $html);
        
        // Then add the onload event if it's not already there
        if (strpos($html, 'onload=') === false) {
            $html = str_replace("media='print'", "media='print' onload=\"this.media='all'\"", $html);
            $html = str_replace('media="print"', 'media="print" onload="this.media=\'all\'"', $html);
        }
        
    }
    
    // Handle non-critical style preloading
    if ($handle === 'icomoon-style' || $handle === 'tailwind-css') {
        $html = str_replace("rel='stylesheet'", "rel='preload' as='style' onload='this.rel=\"stylesheet\"'", $html);
    }
    
    return $html;
}
add_filter('style_loader_tag', 'master_css_filter', 5, 2); // Higher priority to run before plugins



// Inline critical CSS and preload non-critical styles
function inline_critical_css()
{
    $critical_css_path = get_template_directory() . '/build/critical.css';
    if (file_exists($critical_css_path)) {
        // Cache the file — it only changes on build deploys.
        $cache_key = 'kotlinskidev_critical_css_' . filemtime($critical_css_path);
        $critical_css = get_transient($cache_key);
        if ($critical_css === false) {
            $critical_css = file_get_contents($critical_css_path);
            if ($critical_css) {
                set_transient($cache_key, $critical_css, WEEK_IN_SECONDS);
            }
        }
        if ($critical_css) {
            echo '<style id="critical-css">' . $critical_css . '</style>';
        }
    }
    
    // Non-critical styles - preload asynchronously
    wp_enqueue_style('icomoon-style', get_template_directory_uri() . '/assets/css/icomoon.css', false, null);
    wp_enqueue_style('tailwind-css', get_template_directory_uri() . '/build/tailwind.css', false, null);
}
add_action('wp_head', 'inline_critical_css', 1);

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

}
add_action('enqueue_block_editor_assets', 'kotlinskidev_editor_styles');
add_action('enqueue_block_editor_assets', 'kotlinskidev_editor_scripts');


add_action('wp_enqueue_scripts', function (): void {
    $script_args = include get_template_directory() . '/build/main.asset.php';
    wp_enqueue_script(
        'wp-typescript',
        get_template_directory_uri() . '/build/main.js',
        $script_args['dependencies'],
        $script_args['version'],
        [
            'strategy' => 'defer',
            'in_footer' => false, // Note: This is the default value.
        ]
    );
    
    // Make theme URL globally available to all JavaScript files
    wp_localize_script('wp-typescript', 'kotlinskiTheme', [
        'themeUrl' => get_template_directory_uri(),
        'assetsUrl' => get_template_directory_uri() . '/assets',
        'imagesUrl' => get_template_directory_uri() . '/assets/images',
        'mobileBreakpoint' => (int) get_theme_mod('mobile_breakpoint', 767),
    ]);
    
    // When used in a WordPress plugin
    //$script_args = include( plugin_dir_path( __FILE__ ) . 'assets/public/scripts.asset.php');
    //wp_enqueue_script('wp-typescript', plugins_url('assets/public/scripts.js', __FILE__), $script_args['dependencies'], $script_args['version']);
});

