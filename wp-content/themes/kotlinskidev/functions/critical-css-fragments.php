<?php
function kotlinskidev_get_critical_css_fragments(): array
{
    return apply_filters('kotlinskidev_critical_css_fragments', array(
        'kotlinskidev/certificate' => 'critical-certificate.css',
        'kotlinskidev/hero-carousel' => 'style-hero-carousel.css',
    ));
}

function kotlinskidev_get_active_critical_css_fragments(): array
{
    $fragments = array();

    if (is_search() || is_page(['search', 'szukaj'])) {
        $fragments[] = 'critical-search.css';
    }

    if (is_singular()) {
        $post = get_queried_object();
        if ($post instanceof WP_Post) {
            foreach (kotlinskidev_get_critical_css_fragments() as $block_name => $file) {
                if (has_block($block_name, $post)) {
                    $fragments[] = $file;
                }
            }
        }
    }

    foreach (kotlinskidev_get_above_fold_block_style_keys() as $key) {
        $fragments[] = kotlinskidev_block_style_file($key);
    }

    return array_values(array_unique($fragments));
}

function kotlinskidev_get_inlined_style_handles(): array
{
    $handles = array('kotlinskidev-hero-carousel-style' => 'style-hero-carousel.css');

    foreach (array_keys(kotlinskidev_get_block_style_registry()) as $key) {
        $handles[kotlinskidev_block_style_handle($key)] = kotlinskidev_block_style_file($key);
    }

    return apply_filters('kotlinskidev_inlined_style_handles', $handles);
}

function kotlinskidev_get_inlined_core_block_styles(): array
{
    return apply_filters('kotlinskidev_inlined_core_block_styles', array(
        'core/cover' => 'wp-block-cover',
    ));
}

function kotlinskidev_get_active_inlined_core_style_handles(): array
{
    $above_fold_blocks = kotlinskidev_get_above_fold_block_names();
    $handles           = array();

    foreach (kotlinskidev_get_inlined_core_block_styles() as $block_name => $handle) {
        if (in_array($block_name, $above_fold_blocks, true)) {
            $handles[] = $handle;
        }
    }

    return $handles;
}

function kotlinskidev_read_registered_style_css(string $handle): string
{
    $style = wp_styles()->registered[$handle] ?? null;
    if (!$style || empty($style->extra['path'])) {
        return '';
    }

    $path = (string) $style->extra['path'];
    if (!is_readable($path)) {
        return '';
    }

    $cache_key = 'kotlinskidev_core_style_' . sanitize_key($handle) . '_' . filemtime($path);
    $css       = get_transient($cache_key);
    if (false === $css) {
        $css = (string) file_get_contents($path);
        set_transient($cache_key, $css, WEEK_IN_SECONDS);
    }

    return (string) $css;
}

function kotlinskidev_print_inlined_core_block_styles(): void
{
    foreach (kotlinskidev_get_active_inlined_core_style_handles() as $handle) {
        $css = kotlinskidev_read_registered_style_css($handle);
        if ('' !== $css) {
            echo '<style id="critical-core-' . esc_attr(sanitize_key($handle)) . '">' . $css . '</style>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core block stylesheet read from wp-includes, not user input
        }
    }
}
add_action('wp_head', 'kotlinskidev_print_inlined_core_block_styles', 1);

function kotlinskidev_get_always_deferred_style_handles(): array
{
    return apply_filters('kotlinskidev_always_deferred_style_handles', array(
        'kotlinskidev-hero-carousel-view-style',
    ));
}

function kotlinskidev_filter_inlined_and_deferred_styles(string $html, string $handle): string
{
    if (in_array($handle, kotlinskidev_get_inlined_core_block_styles(), true)
        && in_array($handle, kotlinskidev_get_active_inlined_core_style_handles(), true)
        && '' !== kotlinskidev_read_registered_style_css($handle)) {
        return '';
    }

    $inlined = kotlinskidev_get_inlined_style_handles();
    if (isset($inlined[$handle])) {
        if (in_array($inlined[$handle], kotlinskidev_get_active_critical_css_fragments(), true)
            && '' !== kotlinskidev_read_cached_critical_css($inlined[$handle])) {
            return '';
        }
        return $html;
    }

    if (!in_array($handle, kotlinskidev_get_always_deferred_style_handles(), true) || false !== strpos($html, 'onload=')) {
        return $html;
    }

    $html = str_replace('<link', '<link data-no-defer="1" data-no-optimize="1"', $html);
    $html = str_replace(array('media="all"', "media='all'"), array('media="print"', "media='print'"), $html);
    $html = str_replace("media='print'", "media='print' onload=\"this.media='all'\"", $html);

    return str_replace('media="print"', 'media="print" onload="this.media=\'all\'"', $html);
}
add_filter('style_loader_tag', 'kotlinskidev_filter_inlined_and_deferred_styles', 6, 2);
