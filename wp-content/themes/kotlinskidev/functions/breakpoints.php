<?php
define('KOTLINSKIDEV_BREAKPOINT_DEFAULTS', [
    'mobile_max' => 781,
    'tablet_max' => 1023,
    'large'      => 1200,
]);

define('KOTLINSKIDEV_BREAKPOINT_BUILD_TOKENS', [
    '48.8125rem' => ['mobile_max', 0],
    '48.875rem'  => ['mobile_max', 1],
    '63.9375rem' => ['tablet_max', 0],
    '64rem'      => ['tablet_max', 1],
    '74.9375rem' => ['large', -1],
    '75rem'      => ['large', 0],
]);

function kotlinskidev_get_breakpoints(): array
{
    static $breakpoints = null;
    if ($breakpoints !== null) {
        return $breakpoints;
    }

    $defaults   = KOTLINSKIDEV_BREAKPOINT_DEFAULTS;
    $mobile_max = (int) get_option('kotlinskidev_breakpoint_mobile_max', $defaults['mobile_max']);
    $tablet_max = (int) get_option('kotlinskidev_breakpoint_tablet_max', $defaults['tablet_max']);
    $large      = (int) get_option('kotlinskidev_breakpoint_large', $defaults['large']);

    $tablet_max = max($tablet_max, $mobile_max + 1);
    $large      = max($large, $tablet_max + 1);

    $breakpoints = [
        'mobile_max'  => $mobile_max,
        'tablet_max'  => $tablet_max,
        'tablet_min'  => $mobile_max + 1,
        'desktop_min' => $tablet_max + 1,
        'large'       => $large,
    ];

    return $breakpoints;
}

function kotlinskidev_breakpoints_are_default(): bool
{
    $breakpoints = kotlinskidev_get_breakpoints();
    $defaults    = KOTLINSKIDEV_BREAKPOINT_DEFAULTS;

    return $breakpoints['mobile_max'] === $defaults['mobile_max']
        && $breakpoints['tablet_max'] === $defaults['tablet_max']
        && $breakpoints['large'] === $defaults['large'];
}

function kotlinskidev_breakpoints_hash(): string
{
    $breakpoints = kotlinskidev_get_breakpoints();
    return substr(md5($breakpoints['mobile_max'] . '-' . $breakpoints['tablet_max'] . '-' . $breakpoints['large']), 0, 8);
}

function kotlinskidev_breakpoint_px_to_rem(int $px): string
{
    $rem = rtrim(rtrim(number_format($px / 16, 4, '.', ''), '0'), '.');
    return $rem . 'rem';
}

function kotlinskidev_css_has_breakpoint_tokens(string $css): bool
{
    foreach (array_keys(KOTLINSKIDEV_BREAKPOINT_BUILD_TOKENS) as $token) {
        if (strpos($css, $token) !== false) {
            return true;
        }
    }
    return false;
}

function kotlinskidev_transform_breakpoint_css(string $css): string
{
    if (kotlinskidev_breakpoints_are_default()) {
        return $css;
    }

    $breakpoints  = kotlinskidev_get_breakpoints();
    $replacements = [];
    foreach (KOTLINSKIDEV_BREAKPOINT_BUILD_TOKENS as $token => $target) {
        [$key, $offset] = $target;
        $replacements['/(?<![\d.])' . preg_quote($token, '/') . '/'] = kotlinskidev_breakpoint_px_to_rem($breakpoints[$key] + $offset);
    }

    return preg_replace_callback(
        '/@media[^{]+/',
        function (array $match) use ($replacements): string {
            return preg_replace(array_keys($replacements), array_values($replacements), $match[0]);
        },
        $css
    );
}

function kotlinskidev_breakpoint_css_cache_dir(): array
{
    $uploads = wp_get_upload_dir();
    return [
        'path' => trailingslashit($uploads['basedir']) . 'kotlinskidev-css',
        'url'  => trailingslashit($uploads['baseurl']) . 'kotlinskidev-css',
    ];
}

function kotlinskidev_breakpoint_transformed_file(string $file): ?array
{
    if (!file_exists($file) || substr($file, -4) !== '.css') {
        return null;
    }

    $css = file_get_contents($file);
    if ($css === false || !kotlinskidev_css_has_breakpoint_tokens($css)) {
        return null;
    }

    $cache    = kotlinskidev_breakpoint_css_cache_dir();
    $filename = basename($file, '.css') . '-' . kotlinskidev_breakpoints_hash() . '-' . filemtime($file) . '.css';
    $target   = trailingslashit($cache['path']) . $filename;

    if (!file_exists($target)) {
        wp_mkdir_p($cache['path']);
        file_put_contents($target, kotlinskidev_transform_breakpoint_css($css));
    }

    return [
        'path' => $target,
        'url'  => trailingslashit($cache['url']) . $filename,
    ];
}

function kotlinskidev_breakpoint_swap_style_src(string $src, string $handle): string
{
    if (kotlinskidev_breakpoints_are_default()) {
        return $src;
    }

    $build_url = get_template_directory_uri() . '/build/';
    if (strpos($src, $build_url) !== 0) {
        return $src;
    }

    $relative    = strtok(substr($src, strlen($build_url)), '?');
    $transformed = kotlinskidev_breakpoint_transformed_file(get_template_directory() . '/build/' . $relative);

    return $transformed === null ? $src : $transformed['url'];
}
add_filter('style_loader_src', 'kotlinskidev_breakpoint_swap_style_src', 10, 2);

function kotlinskidev_breakpoint_swap_inline_style_paths(): void
{
    if (kotlinskidev_breakpoints_are_default()) {
        return;
    }

    $build_dir = get_template_directory() . '/build/';
    foreach (wp_styles()->registered as $style) {
        $path = $style->extra['path'] ?? '';
        if ($path === '' || strpos($path, $build_dir) !== 0) {
            continue;
        }
        $transformed = kotlinskidev_breakpoint_transformed_file($path);
        if ($transformed !== null) {
            $style->extra['path'] = $transformed['path'];
        }
    }
}
add_action('wp_enqueue_scripts', 'kotlinskidev_breakpoint_swap_inline_style_paths', 100);

function kotlinskidev_transform_editor_styles(array $settings): array
{
    if (kotlinskidev_breakpoints_are_default() || empty($settings['styles']) || !is_array($settings['styles'])) {
        return $settings;
    }

    foreach ($settings['styles'] as $index => $style) {
        if (is_array($style) && !empty($style['css'])) {
            $settings['styles'][$index]['css'] = kotlinskidev_transform_breakpoint_css($style['css']);
        }
    }

    return $settings;
}
add_filter('block_editor_settings_all', 'kotlinskidev_transform_editor_styles');

function kotlinskidev_bridge_theme_mod_mobile_breakpoint($value)
{
    return kotlinskidev_get_breakpoints()['mobile_max'];
}
add_filter('theme_mod_mobile_breakpoint', 'kotlinskidev_bridge_theme_mod_mobile_breakpoint');

function kotlinskidev_bridge_theme_mod_tablet_breakpoint($value)
{
    return kotlinskidev_get_breakpoints()['tablet_max'];
}
add_filter('theme_mod_tablet_breakpoint', 'kotlinskidev_bridge_theme_mod_tablet_breakpoint');

function kotlinskidev_get_css_breakpoints(): array
{
    $breakpoints = kotlinskidev_get_breakpoints();

    return [
        'mobile'  => "@media (max-width: {$breakpoints['mobile_max']}px)",
        'tablet'  => "@media (min-width: {$breakpoints['tablet_min']}px) and (max-width: {$breakpoints['tablet_max']}px)",
        'desktop' => "@media (min-width: {$breakpoints['desktop_min']}px)",
        'large'   => "@media (min-width: {$breakpoints['large']}px)",
    ];
}

function kotlinskidev_get_js_breakpoints(): array
{
    return kotlinskidev_get_breakpoints();
}

function kotlinskidev_build_scoped_responsive_css( string $selector, array $properties ): string
{
    $media_queries = kotlinskidev_get_css_breakpoints();
    $css = '';

    foreach ( [ 'desktop', 'tablet', 'mobile' ] as $device ) {
        $declarations = '';
        foreach ( $properties as $css_property => $values ) {
            if ( ! empty( $values[ $device ] ) ) {
                $declarations .= "{$css_property}:{$values[ $device ]};";
            }
        }
        if ( '' !== $declarations ) {
            $css .= "{$media_queries[ $device ]}{{$selector}{{$declarations}}}";
        }
    }

    return $css;
}

function kotlinskidev_localize_breakpoints(): void
{
    wp_localize_script('kotlinskidev-editor-only', 'kotlinskidevBreakpoints', kotlinskidev_get_js_breakpoints());
}
add_action('enqueue_block_editor_assets', 'kotlinskidev_localize_breakpoints', 20);

function kotlinskidev_flush_breakpoint_css_cache(): void
{
    $cache = kotlinskidev_breakpoint_css_cache_dir();
    if (!is_dir($cache['path'])) {
        return;
    }
    foreach (glob(trailingslashit($cache['path']) . '*.css') ?: [] as $file) {
        unlink($file);
    }
}
add_action('update_option_kotlinskidev_breakpoint_mobile_max', 'kotlinskidev_flush_breakpoint_css_cache');
add_action('update_option_kotlinskidev_breakpoint_tablet_max', 'kotlinskidev_flush_breakpoint_css_cache');
add_action('update_option_kotlinskidev_breakpoint_large', 'kotlinskidev_flush_breakpoint_css_cache');
