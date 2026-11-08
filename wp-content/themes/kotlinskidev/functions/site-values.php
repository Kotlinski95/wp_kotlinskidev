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

        $clean = ['key' => $key, 'type' => $type, 'value' => ''];
        if ('years_since' === $type) {
            $source         = trim(sanitize_text_field((string) ($row['source'] ?? $row['value'] ?? '')));
            $clean['value'] = kotlinskidev_site_value_is_valid_source($source) ? $source : '';
        } elseif ('static' === $type) {
            $raw = $row['value'] ?? '';
            if (is_array($raw)) {
                $texts = [];
                foreach ($raw as $slug => $text) {
                    $slug = sanitize_key((string) $slug);
                    if ('' !== $slug) {
                        $texts[$slug] = sanitize_text_field((string) $text);
                    }
                }
                $clean['value'] = $texts;
            } else {
                $clean['value'] = sanitize_text_field((string) $raw);
            }
        }
        $rows[] = $clean;
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
        $stored = get_option(KOTLINSKIDEV_SITE_VALUES_OPTION, []);
        $rows   = [];
        if (is_array($stored)) {
            foreach ($stored as $row) {
                if (is_array($row) && isset($row['key'])) {
                    $rows[(string) $row['key']] = $row;
                }
            }
        }
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
        static function (array $match) use ($rows): string {
            if (!isset($rows[$match[1]])) {
                return $match[0];
            }
            $resolved = kotlinskidev_site_value_resolve($rows[$match[1]]);
            return null === $resolved ? $match[0] : esc_html($resolved);
        },
        $block_content
    );
}
add_filter('render_block', 'kotlinskidev_replace_site_value_tokens', 20);
