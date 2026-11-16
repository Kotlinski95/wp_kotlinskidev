<?php

const KOTLINSKIDEV_ONETAP_STYLE_HANDLE = 'accessibility-onetap';

function kotlinskidev_detach_onetap_inline_style(): void
{
    if (is_admin()) {
        return;
    }

    $styles = wp_styles();
    $registered = $styles->registered[KOTLINSKIDEV_ONETAP_STYLE_HANDLE] ?? null;
    if (!$registered || empty($registered->extra['after'])) {
        return;
    }

    $GLOBALS['kotlinskidev_onetap_inline_css'] = implode("\n", array_filter((array) $registered->extra['after']));
    unset($registered->extra['after']);
}
add_action('wp_head', 'kotlinskidev_detach_onetap_inline_style', 7);

function kotlinskidev_print_onetap_inline_style(): void
{
    $css = $GLOBALS['kotlinskidev_onetap_inline_css'] ?? '';
    if (!is_string($css) || '' === trim($css)) {
        return;
    }

    echo '<style id="accessibility-onetap-inline-css">' . wp_strip_all_tags($css) . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CSS passed through wp_strip_all_tags
}
add_action('wp_footer', 'kotlinskidev_print_onetap_inline_style', 20);
