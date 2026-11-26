<?php

const KOTLINSKIDEV_CMPLZ_BANNER_STYLE_HANDLE = 'cmplz-banner-1-optin';
const KOTLINSKIDEV_CMPLZ_BANNER_SCRIPT_HANDLE = 'cmplz-cookiebanner';

function kotlinskidev_cmplz_banner_skip_page(): bool
{
    if (!function_exists('is_singular') || !is_singular()) {
        return false;
    }

    $post = get_post();
    if (!$post || empty($post->post_content)) {
        return false;
    }

    $content = (string) $post->post_content;

    foreach (['cmplz-document', 'cmplz-cookies'] as $shortcode) {
        if (has_shortcode($content, $shortcode)) {
            return true;
        }
    }

    return str_contains($content, '<!-- wp:complianz/');
}

function kotlinskidev_minify_inline_css(string $css): string
{
    $css = preg_replace('#/\*.*?\*/#s', '', $css) ?? $css;
    $css = preg_replace('/\s+/', ' ', $css) ?? $css;
    $css = preg_replace('/\s*([{};,>])\s*/', '$1', $css) ?? $css;
    $css = str_replace(';}', '}', $css);

    return trim($css);
}

function kotlinskidev_cmplz_banner_css_path(): string
{
    $styles = wp_styles();
    $registered = $styles->registered[KOTLINSKIDEV_CMPLZ_BANNER_STYLE_HANDLE] ?? null;
    if (!$registered || !is_string($registered->src) || '' === $registered->src) {
        return '';
    }

    $uploads = wp_get_upload_dir();
    $src = strtok($registered->src, '?');
    $base_url = (string) ($uploads['baseurl'] ?? '');
    $base_dir = (string) ($uploads['basedir'] ?? '');
    if ('' === $base_url || '' === $base_dir || !str_starts_with((string) $src, $base_url)) {
        return '';
    }

    return $base_dir . substr((string) $src, strlen($base_url));
}

function kotlinskidev_cmplz_banner_inline_css(): string
{
    $path = kotlinskidev_cmplz_banner_css_path();
    if ('' === $path || !is_readable($path)) {
        return '';
    }

    $cache_key = 'kotlinskidev_cmplz_banner_css_' . filemtime($path);
    $css = get_transient($cache_key);
    if (false === $css) {
        $css = kotlinskidev_minify_inline_css((string) file_get_contents($path));
        if ('' !== $css) {
            set_transient($cache_key, $css, WEEK_IN_SECONDS);
        }
    }

    return is_string($css) ? $css : '';
}

function kotlinskidev_cmplz_banner_script_src(): string
{
    $scripts = wp_scripts();
    $registered = $scripts->registered[KOTLINSKIDEV_CMPLZ_BANNER_SCRIPT_HANDLE] ?? null;
    if (!$registered || !is_string($registered->src) || '' === $registered->src) {
        return '';
    }

    $src = $registered->src;
    if (!preg_match('|^(https?:)?//|', $src)) {
        $src = $scripts->base_url . $src;
    }

    $version = $registered->ver ?: $scripts->default_version;
    if ($version) {
        $src = add_query_arg('ver', $version, $src);
    }

    return (string) apply_filters('script_loader_src', $src, KOTLINSKIDEV_CMPLZ_BANNER_SCRIPT_HANDLE);
}

function kotlinskidev_print_cmplz_banner_critical(): void
{
    if (is_admin() || is_feed()) {
        return;
    }

    if (kotlinskidev_cmplz_banner_skip_page()) {
        echo '<meta name="kt-cmplz-skip" content="1">'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup
        return;
    }

    $css = kotlinskidev_cmplz_banner_inline_css();
    if ('' === $css) {
        return;
    }

    echo '<style id="critical-css-cmplz-banner">' . $css . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted sitewide Complianz banner stylesheet from uploads, not user input

    $src = kotlinskidev_cmplz_banner_script_src();
    if ('' !== $src) {
        echo '<link rel="preload" as="script" href="' . esc_url($src) . '">'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped with esc_url
    }
}
add_action('wp_head', 'kotlinskidev_print_cmplz_banner_critical', 1);

function kotlinskidev_drop_cmplz_banner_style_link(string $html, string $handle): string
{
    if (KOTLINSKIDEV_CMPLZ_BANNER_STYLE_HANDLE !== $handle) {
        return $html;
    }

    return '' === kotlinskidev_cmplz_banner_inline_css() || kotlinskidev_cmplz_banner_skip_page() ? $html : '';
}
add_filter('style_loader_tag', 'kotlinskidev_drop_cmplz_banner_style_link', 1, 2);

function kotlinskidev_print_cmplz_banner_parsed_marker(): void
{
    if (is_admin() || is_feed() || kotlinskidev_cmplz_banner_skip_page()) {
        return;
    }

    echo '<script>document.documentElement.classList.add("kt-cmplz-parsed")</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup
}
add_action('wp_footer', 'kotlinskidev_print_cmplz_banner_parsed_marker', 9999);
