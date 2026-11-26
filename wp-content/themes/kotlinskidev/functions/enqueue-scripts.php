<?php
const KOTLINSKIDEV_CRITICAL_STYLE_HANDLE = 'critical-style';
const KOTLINSKIDEV_GLOBAL_STYLE_HANDLE = 'global-style';
const KOTLINSKIDEV_MAIN_SCRIPT_HANDLE = 'wp-typescript';

function defer_global_css()
{
    $main_css_path = kotlinskidev_build_path('css', 'main.css');
    $main_css_ver  = file_exists($main_css_path) ? filemtime($main_css_path) : null;
    wp_enqueue_style(KOTLINSKIDEV_GLOBAL_STYLE_HANDLE, kotlinskidev_build_url('css', 'main.css'), [], $main_css_ver, 'print');
}
add_action('wp_enqueue_scripts', 'defer_global_css');

function kotlinskidev_read_cached_critical_js(string $critical_js_path): string
{
    $cache_key   = 'kotlinskidev_critical_js_' . filemtime($critical_js_path);
    $critical_js = get_transient($cache_key);
    if ($critical_js === false) {
        $critical_js = file_get_contents($critical_js_path);
        if ($critical_js) {
            set_transient($cache_key, $critical_js, WEEK_IN_SECONDS);
        }
    }

    return $critical_js ?: '';
}

function inline_critical_js()
{
    $critical_js_path = kotlinskidev_build_path('js', 'critical.js');
    if (!file_exists($critical_js_path)) {
        return;
    }

    $critical_js = kotlinskidev_read_cached_critical_js($critical_js_path);
    if ($critical_js) {
        echo '<script id="critical-js" charset="utf-8">' . $critical_js . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme build output read from build/js/critical.js, not user input; escaping would corrupt the inline JS
    }
}
add_action('wp_head', 'inline_critical_js', 2);

function kotlinskidev_protect_critical_stylesheet(string $html): string
{
    return str_replace('<link', '<link data-no-optimize="1" data-critical="true"', $html);
}

function kotlinskidev_make_stylesheet_non_blocking(string $html): string
{
    $html = str_replace('<link', '<link data-no-defer="1" data-no-optimize="1"', $html);
    $html = str_replace('media="all"', 'media="print"', $html);
    $html = str_replace("media='all'", "media='print'", $html);
    if (strpos($html, 'onload=') === false) {
        $html = str_replace("media='print'", "media='print' onload=\"this.media='all'\"", $html);
        $html = str_replace('media="print"', 'media="print" onload="this.media=\'all\'"', $html);
    }

    return $html;
}

function kotlinskidev_get_deferred_style_handles(): array
{
    return array_merge(
        [
            'wp-block-navigation',
            'wp-pwa-manager-frontend',
        ],
        kotlinskidev_get_deferred_block_style_handles(),
        kotlinskidev_get_block_style_link_handles()
    );
}

function master_css_filter($html, $handle)
{
    if ($handle === KOTLINSKIDEV_CRITICAL_STYLE_HANDLE) {
        $html = kotlinskidev_protect_critical_stylesheet($html);
    }

    if ($handle === KOTLINSKIDEV_GLOBAL_STYLE_HANDLE) {
        $html = kotlinskidev_make_stylesheet_non_blocking($html);
    }

    $deferred_handles = kotlinskidev_get_deferred_style_handles();
    if (in_array($handle, $deferred_handles, true)) {
        $html = kotlinskidev_make_stylesheet_non_blocking($html);
    }

    return $html;
}
add_filter('style_loader_tag', 'master_css_filter', 5, 2);

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

function kotlinskidev_read_cached_critical_css(string $relative_filename): string
{
    $css_path = kotlinskidev_build_path('css', $relative_filename);
    if (!file_exists($css_path)) {
        return '';
    }

    $cache_key = 'kotlinskidev_critical_css_' . sanitize_key($relative_filename) . '_' . filemtime($css_path) . '_' . kotlinskidev_breakpoints_hash();
    $css = get_transient($cache_key);
    if ($css === false) {
        $css = file_get_contents($css_path);
        if ($css) {
            $css = kotlinskidev_transform_breakpoint_css($css);
            set_transient($cache_key, $css, WEEK_IN_SECONDS);
        }
    }

    return $css ?: '';
}

function inline_critical_css()
{
    $critical_css = kotlinskidev_read_cached_critical_css('critical.css');
    if ($critical_css) {
        echo '<style id="critical-css">' . $critical_css . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme build output read from build/css/critical.css, not user input; escaping would corrupt the inline CSS
    }

    foreach (kotlinskidev_get_active_critical_css_fragments() as $fragment_filename) {
        $fragment_css = kotlinskidev_read_cached_critical_css($fragment_filename);
        if ($fragment_css) {
            echo '<style id="critical-css-' . esc_attr(sanitize_key(basename($fragment_filename, '.css'))) . '">' . $fragment_css . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme build output read from build/css/*.css, not user input; escaping would corrupt the inline CSS
        }
    }
}
add_action('wp_head', 'inline_critical_css', 1);

function kotlinskidev_editor_styles(): void
{
    wp_enqueue_style(
        'kotlinskidev-editor-overrides',
        kotlinskidev_build_url('css', 'editor.css'),
        array(),
        wp_get_theme()->get('Version')
    );
}

function kotlinskidev_editor_scripts(): void
{
    $asset = include kotlinskidev_build_path('js', 'editor.asset.php');
    wp_enqueue_script(
        'kotlinskidev-editor-only',
        kotlinskidev_build_url('js', 'editor.js'),
        $asset['dependencies'],
        $asset['version'],
        true
    );
    wp_set_script_translations('kotlinskidev-editor-only', 'kotlinskidev', get_template_directory() . '/languages');
}

add_action('enqueue_block_editor_assets', 'kotlinskidev_editor_styles');
add_action('enqueue_block_editor_assets', 'kotlinskidev_editor_scripts');

function kotlinskidev_get_theme_script_data(): array
{
    return [
        'themeUrl' => get_template_directory_uri(),
        'assetsUrl' => get_template_directory_uri() . '/assets',
        'imagesUrl' => get_template_directory_uri() . '/assets/images',
        'mobileBreakpoint' => kotlinskidev_get_breakpoints()['mobile_max'],
        'breakpoints' => kotlinskidev_get_breakpoints(),
        'scrollOffsets' => kotlinskidev_get_scroll_offsets(),
        'inViewBand' => kotlinskidev_get_in_view_band_config(),
    ];
}

function kotlinskidev_enqueue_main_script(): void
{
    $script_args = include kotlinskidev_build_path('js', 'main.asset.php');
    wp_enqueue_script(
        KOTLINSKIDEV_MAIN_SCRIPT_HANDLE,
        kotlinskidev_build_url('js', 'main.js'),
        $script_args['dependencies'],
        $script_args['version'],
        [
            'strategy' => 'defer',
            'in_footer' => false,
        ]
    );

    wp_localize_script(KOTLINSKIDEV_MAIN_SCRIPT_HANDLE, 'kotlinskiTheme', kotlinskidev_get_theme_script_data());
}
add_action('wp_enqueue_scripts', 'kotlinskidev_enqueue_main_script');
