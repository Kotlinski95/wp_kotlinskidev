<?php
function defer_global_css()
{
    // Enqueue the global stylesheet with media="print" to prevent it from blocking render
    $main_css_path = get_template_directory() . '/build/main.css';
    $main_css_ver  = file_exists($main_css_path) ? filemtime($main_css_path) : null;
    wp_enqueue_style('global-style', get_template_directory_uri() . '/build/main.css', [], $main_css_ver, 'print');
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
        echo '<script id="critical-js" charset="utf-8">' . $critical_js . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme build output read from build/critical.js, not user input; escaping would corrupt the inline JS
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
    if ($handle === 'icomoon-style') {
        $html = str_replace("rel='stylesheet'", "rel='preload' as='style' onload='this.rel=\"stylesheet\"'", $html);
    }

    $deferred_handles = array_merge(
        [
            'wp-block-navigation',
            'wp-pwa-manager-frontend',
        ],
        kotlinskidev_get_deferred_block_style_handles()
    );
    if (in_array($handle, $deferred_handles, true)) {
        $html = str_replace('<link', '<link data-no-defer="1" data-no-optimize="1"', $html);
        $html = str_replace('media="all"', 'media="print"', $html);
        $html = str_replace("media='all'", "media='print'", $html);
        if (strpos($html, 'onload=') === false) {
            $html = str_replace("media='print'", "media='print' onload=\"this.media='all'\"", $html);
            $html = str_replace('media="print"', 'media="print" onload="this.media=\'all\'"', $html);
        }
    }

    return $html;
}
add_filter('style_loader_tag', 'master_css_filter', 5, 2); // Higher priority to run before plugins

function kotlinskidev_defer_deferrable_scripts($tag, $handle)
{
    $deferred_script_handles = [
        'wp-pwa-manager-frontend',
    ];

    if (!in_array($handle, $deferred_script_handles, true)) {
        return $tag;
    }

    if (strpos($tag, ' defer') !== false) {
        return $tag;
    }

    return str_replace(' src=', ' defer src=', $tag);
}
add_filter('script_loader_tag', 'kotlinskidev_defer_deferrable_scripts', 10, 2);



// Inline critical CSS and preload non-critical styles
function inline_critical_css()
{
    $critical_css_path = get_template_directory() . '/build/critical.css';
    if (file_exists($critical_css_path)) {
        // Cache the file — it only changes on build deploys or breakpoint setting changes.
        $cache_key = 'kotlinskidev_critical_css_' . filemtime($critical_css_path) . '_' . kotlinskidev_breakpoints_hash();
        $critical_css = get_transient($cache_key);
        if ($critical_css === false) {
            $critical_css = file_get_contents($critical_css_path);
            if ($critical_css) {
                $critical_css = kotlinskidev_transform_breakpoint_css($critical_css);
                set_transient($cache_key, $critical_css, WEEK_IN_SECONDS);
            }
        }
        if ($critical_css) {
            echo '<style id="critical-css">' . $critical_css . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme build output read from build/critical.css, not user input; escaping would corrupt the inline CSS
        }
    }
    
    // Non-critical styles - preload asynchronously
    wp_enqueue_style('icomoon-style', get_template_directory_uri() . '/assets/css/icomoon.css', false, null);
}
add_action('wp_head', 'inline_critical_css', 1);

function kotlinskidev_editor_styles(): void
{
    wp_enqueue_style(
        'kotlinskidev-editor-overrides',
        get_template_directory_uri() . '/build/editor.css',
        array(),
        wp_get_theme()->get('Version')
    );
}

function kotlinskidev_editor_scripts(): void
{
    $asset = include get_template_directory() . '/build/editor.asset.php';
    wp_enqueue_script(
        'kotlinskidev-editor-only',
        get_template_directory_uri() . '/build/editor.js',
        $asset['dependencies'],
        $asset['version'],
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
        'mobileBreakpoint' => kotlinskidev_get_breakpoints()['mobile_max'],
        'breakpoints' => kotlinskidev_get_breakpoints(),
        'scrollOffsets' => kotlinskidev_get_scroll_offsets(),
    ]);
    
    // When used in a WordPress plugin
    //$script_args = include( plugin_dir_path( __FILE__ ) . 'assets/public/scripts.asset.php');
    //wp_enqueue_script('wp-typescript', plugins_url('assets/public/scripts.js', __FILE__), $script_args['dependencies'], $script_args['version']);
});

