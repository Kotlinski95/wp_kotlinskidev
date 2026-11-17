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

function kotlinskidev_onetap_style_file(string $css): ?array
{
    $uploads = wp_get_upload_dir();
    if (!empty($uploads['error'])) {
        return null;
    }

    $name = 'onetap-' . substr(md5($css), 0, 12) . '.css';
    $dir  = trailingslashit($uploads['basedir']) . 'kotlinskidev-cache';
    $path = $dir . '/' . $name;

    if (!is_readable($path)) {
        if (!wp_mkdir_p($dir) || false === file_put_contents($path, $css)) {
            return null;
        }
    }

    return array(
        'url' => set_url_scheme(trailingslashit($uploads['baseurl']) . 'kotlinskidev-cache/' . $name),
    );
}

function kotlinskidev_print_onetap_inline_style(): void
{
    $css = $GLOBALS['kotlinskidev_onetap_inline_css'] ?? '';
    if (!is_string($css) || '' === trim($css)) {
        return;
    }

    $css  = wp_strip_all_tags($css);
    $file = kotlinskidev_onetap_style_file($css);

    if (null !== $file) {
        printf(
            '<link rel="stylesheet" id="accessibility-onetap-inline-css" href="%s" media="print" onload="this.media=\'all\'" data-no-optimize="1"><noscript><link rel="stylesheet" href="%s"></noscript>',
            esc_url($file['url']),
            esc_url($file['url'])
        );
        return;
    }

    echo '<style id="accessibility-onetap-inline-css">' . $css . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CSS passed through wp_strip_all_tags
}
add_action('wp_footer', 'kotlinskidev_print_onetap_inline_style', 20);
