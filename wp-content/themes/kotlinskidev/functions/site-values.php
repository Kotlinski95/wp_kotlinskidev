<?php
const KOTLINSKIDEV_SITE_VALUES_OPTION = 'kotlinskidev_site_values';

function kotlinskidev_site_value_types(): array
{
    return ['years_since', 'current_year', 'static'];
}

function kotlinskidev_site_value_is_valid_source(string $source): bool
{
    if (1 === preg_match('/^\d{4}$/', $source)) {
        return true;
    }
    if (1 !== preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $source, $m)) {
        return false;
    }
    return checkdate((int) $m[2], (int) $m[3], (int) $m[1]);
}

function kotlinskidev_sanitize_site_value_translations(array $translations): array
{
    $texts = [];
    foreach ($translations as $slug => $text) {
        $slug = sanitize_key((string) $slug);
        if ('' !== $slug) {
            $texts[$slug] = sanitize_text_field((string) $text);
        }
    }
    return $texts;
}

function kotlinskidev_sanitize_static_site_value($raw)
{
    return is_array($raw)
        ? kotlinskidev_sanitize_site_value_translations($raw)
        : sanitize_text_field((string) $raw);
}

function kotlinskidev_sanitize_years_since_source(array $row): string
{
    $source = trim(sanitize_text_field((string) ($row['source'] ?? $row['value'] ?? '')));
    return kotlinskidev_site_value_is_valid_source($source) ? $source : '';
}

function kotlinskidev_sanitize_site_value_row(string $key, string $type, array $row): array
{
    $clean = ['key' => $key, 'type' => $type, 'value' => ''];
    if ('years_since' === $type) {
        $clean['value'] = kotlinskidev_sanitize_years_since_source($row);
    } elseif ('static' === $type) {
        $clean['value'] = kotlinskidev_sanitize_static_site_value($row['value'] ?? '');
    }
    return $clean;
}

function kotlinskidev_sanitize_site_values($value): array
{
    if (!is_array($value)) {
        return [];
    }

    $rows = [];
    $seen = [];
    foreach ($value as $row) {
        if (!is_array($row)) {
            continue;
        }
        $key  = sanitize_key((string) ($row['key'] ?? ''));
        $type = (string) ($row['type'] ?? '');
        if ('' === $key || isset($seen[$key]) || !in_array($type, kotlinskidev_site_value_types(), true)) {
            continue;
        }
        $seen[$key] = true;
        $rows[]     = kotlinskidev_sanitize_site_value_row($key, $type, $row);
    }

    return $rows;
}

function kotlinskidev_load_site_values_by_key(): array
{
    $stored = get_option(KOTLINSKIDEV_SITE_VALUES_OPTION, []);
    $rows   = [];
    if (is_array($stored)) {
        foreach ($stored as $row) {
            if (is_array($row) && isset($row['key'])) {
                $rows[(string) $row['key']] = $row;
            }
        }
    }
    return $rows;
}

function kotlinskidev_get_site_values(bool $reset = false): array
{
    static $rows = null;
    if ($reset) {
        $rows = null;
        return [];
    }
    if (null === $rows) {
        $rows = kotlinskidev_load_site_values_by_key();
    }
    return $rows;
}

function kotlinskidev_reset_site_values_cache(): void
{
    kotlinskidev_get_site_values(true);
}
add_action('update_option_' . KOTLINSKIDEV_SITE_VALUES_OPTION, 'kotlinskidev_reset_site_values_cache');
add_action('add_option_' . KOTLINSKIDEV_SITE_VALUES_OPTION, 'kotlinskidev_reset_site_values_cache');
add_action('delete_option_' . KOTLINSKIDEV_SITE_VALUES_OPTION, 'kotlinskidev_reset_site_values_cache');

function kotlinskidev_site_value_years_since(string $source): ?string
{
    if (!kotlinskidev_site_value_is_valid_source($source)) {
        return null;
    }
    $today = (string) wp_date('Y-m-d');
    if (strlen($source) === 4) {
        return (string) max(0, (int) substr($today, 0, 4) - (int) $source);
    }
    $years = (new DateTimeImmutable($source))->diff(new DateTimeImmutable($today));
    return $years->invert ? '0' : (string) $years->y;
}

function kotlinskidev_site_value_static(mixed $value, ?string $lang): ?string
{
    if (!is_array($value)) {
        $text = (string) $value;
        return '' === $text ? null : $text;
    }
    if (null === $lang && function_exists('pll_current_language')) {
        $current = pll_current_language();
        $lang    = is_string($current) && '' !== $current ? $current : null;
    }
    if (null !== $lang && isset($value[$lang]) && '' !== (string) $value[$lang]) {
        return (string) $value[$lang];
    }
    foreach ($value as $text) {
        if ('' !== (string) $text) {
            return (string) $text;
        }
    }
    return null;
}

function kotlinskidev_site_value_resolve(array $row, ?string $lang = null): ?string
{
    switch ($row['type'] ?? '') {
        case 'current_year':
            return (string) wp_date('Y');
        case 'years_since':
            return kotlinskidev_site_value_years_since((string) ($row['value'] ?? ''));
        case 'static':
            return kotlinskidev_site_value_static($row['value'] ?? '', $lang);
    }
    return null;
}

function kotlinskidev_render_site_value_token(array $match, array $rows): string
{
    if (!isset($rows[$match[1]])) {
        return $match[0];
    }
    $resolved = kotlinskidev_site_value_resolve($rows[$match[1]]);
    return null === $resolved ? $match[0] : esc_html($resolved);
}

function kotlinskidev_replace_site_value_tokens(string $block_content): string
{
    if (function_exists('kotlinskidev_feature_enabled') && !kotlinskidev_feature_enabled('site_values')) {
        return $block_content;
    }
    if (!str_contains($block_content, '{token:')) {
        return $block_content;
    }
    $rows = kotlinskidev_get_site_values();
    if ([] === $rows) {
        return $block_content;
    }

    return (string) preg_replace_callback(
        '/\{token:([a-z0-9_-]+)\}/',
        static fn (array $match): string => kotlinskidev_render_site_value_token($match, $rows),
        $block_content
    );
}
add_filter('render_block', 'kotlinskidev_replace_site_value_tokens', 20);
