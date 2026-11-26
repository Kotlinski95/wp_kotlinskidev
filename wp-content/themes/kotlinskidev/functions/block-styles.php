<?php
function kotlinskidev_get_block_style_registry(): array
{
    static $registry = null;

    if (null === $registry) {
        $path     = get_template_directory() . '/src/block-styles.json';
        $decoded  = is_readable($path) ? json_decode((string) file_get_contents($path), true) : null;
        $registry = is_array($decoded) ? $decoded : array();
    }

    return apply_filters('kotlinskidev_block_style_registry', $registry);
}

function kotlinskidev_block_style_handle(string $key): string
{
    return 'kotlinskidev-block-' . $key;
}

function kotlinskidev_block_style_file(string $key): string
{
    return 'blocks/' . $key . '.css';
}

function kotlinskidev_block_style_collected(?string $key = null, bool $reset = false): array
{
    static $collected = array();

    if ($reset) {
        $collected = array();
    }

    if (null !== $key) {
        $collected[$key] = true;
    }

    return array_keys($collected);
}

function kotlinskidev_block_style_class_matches(array $tokens, array $classes): bool
{
    foreach ($classes as $class) {
        if (str_ends_with($class, '-')) {
            foreach ($tokens as $token) {
                if (str_starts_with($token, $class)) {
                    return true;
                }
            }
        } elseif (in_array($class, $tokens, true)) {
            return true;
        }
    }

    return false;
}

function kotlinskidev_block_style_block_matches(array $definition, array $block): bool
{
    $name  = (string) ($block['blockName'] ?? '');
    $attrs = is_array($block['attrs'] ?? null) ? $block['attrs'] : array();

    if ('' !== $name && in_array($name, $definition['blocks'] ?? array(), true)) {
        return true;
    }

    foreach ($definition['attrs'] ?? array() as $attr) {
        if (!empty($attrs[$attr])) {
            return true;
        }
    }

    if (!empty($definition['classes']) && is_string($attrs['className'] ?? null)) {
        $tokens = preg_split('/\s+/', trim($attrs['className']), -1, PREG_SPLIT_NO_EMPTY);
        return kotlinskidev_block_style_class_matches($tokens ?: array(), $definition['classes']);
    }

    return false;
}

function kotlinskidev_collect_block_styles($block_content, $block)
{
    if (is_admin() || !is_array($block) || '' === trim((string) $block_content)) {
        return $block_content;
    }

    $collected = kotlinskidev_block_style_collected();

    foreach (kotlinskidev_get_block_style_registry() as $key => $definition) {
        if (!in_array($key, $collected, true) && kotlinskidev_block_style_block_matches($definition, $block)) {
            kotlinskidev_block_style_collected($key);
        }
    }

    return $block_content;
}
add_filter('render_block', 'kotlinskidev_collect_block_styles', 5, 2);

const KOTLINSKIDEV_BLOCK_STYLE_SINGULAR_CONDITION_PREFIX = 'singular:';

function kotlinskidev_block_style_template_matches(string $condition): bool
{
    if (str_starts_with($condition, KOTLINSKIDEV_BLOCK_STYLE_SINGULAR_CONDITION_PREFIX)) {
        return is_singular(substr($condition, strlen(KOTLINSKIDEV_BLOCK_STYLE_SINGULAR_CONDITION_PREFIX)));
    }

    return match ($condition) {
        'single'  => is_singular('post'),
        'archive' => is_home() || is_archive(),
        'search'  => is_search() || is_page(array('search', 'szukaj')),
        '404'     => is_404(),
        default   => false,
    };
}

function kotlinskidev_add_template_matched_block_style_keys(array $registry, array $active): array
{
    foreach ($registry as $key => $definition) {
        if (!empty($definition['always'])) {
            $active[$key] = true;
            continue;
        }

        foreach ($definition['templates'] ?? array() as $condition) {
            if (kotlinskidev_block_style_template_matches($condition)) {
                $active[$key] = true;
                break;
            }
        }
    }

    return $active;
}

function kotlinskidev_add_block_style_dependency_keys(array $registry, array $active): array
{
    $queue = array_keys($active);
    while ($queue) {
        $key = array_shift($queue);
        foreach ($registry[$key]['deps'] ?? array() as $dependency) {
            if (isset($registry[$dependency]) && !isset($active[$dependency])) {
                $active[$dependency] = true;
                $queue[]             = $dependency;
            }
        }
    }

    return $active;
}

function kotlinskidev_get_active_block_style_keys(): array
{
    $registry = kotlinskidev_get_block_style_registry();
    $active   = array_fill_keys(kotlinskidev_block_style_collected(), true);
    $active   = kotlinskidev_add_template_matched_block_style_keys($registry, $active);
    $active   = kotlinskidev_add_block_style_dependency_keys($registry, $active);

    return array_values(array_filter(array_keys($registry), static fn (string $key): bool => isset($active[$key])));
}

function kotlinskidev_get_above_fold_block_style_keys(): array
{
    $above_fold = kotlinskidev_get_above_fold_block_names();
    $registry = kotlinskidev_get_block_style_registry();
    $keys     = array();

    foreach (kotlinskidev_get_active_block_style_keys() as $key) {
        if (!empty($registry[$key]['inline']) || array_intersect($registry[$key]['blocks'] ?? array(), $above_fold)) {
            $keys[] = $key;
        }
    }

    return $keys;
}

function kotlinskidev_get_block_style_link_handles(): array
{
    return array_map('kotlinskidev_block_style_handle', array_keys(kotlinskidev_get_block_style_registry()));
}

function kotlinskidev_enqueue_block_styles(): void
{
    foreach (kotlinskidev_get_active_block_style_keys() as $key) {
        $file = kotlinskidev_block_style_file($key);
        $path = kotlinskidev_build_path('css', $file);
        if (!file_exists($path)) {
            continue;
        }

        wp_enqueue_style(kotlinskidev_block_style_handle($key), kotlinskidev_build_url('css', $file), array(), (string) filemtime($path), 'all');
    }
}
add_action('wp_enqueue_scripts', 'kotlinskidev_enqueue_block_styles', 20);
