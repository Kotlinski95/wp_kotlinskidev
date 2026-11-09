<?php
function kotlinskidev_get_above_fold_media_blocks(): array
{
    return array(
        'core/image'                   => false,
        'core/cover'                   => false,
        'core/video'                   => false,
        'kotlinskidev/hero-carousel'   => true,
        'kotlinskidev/device-frame'    => false,
    );
}

function &kotlinskidev_above_fold_state(): array
{
    static $state = array(
        'claimed'          => false,
        'preload_url'      => '',
        'hero_carousels'   => 0,
    );

    return $state;
}

function kotlinskidev_reset_above_fold_state(): void
{
    $state = &kotlinskidev_above_fold_state();
    $state = array(
        'claimed'        => false,
        'preload_url'    => '',
        'hero_carousels' => 0,
    );
}

function kotlinskidev_is_above_fold(array $block): bool
{
    $block_name = $block['blockName'] ?? '';
    $attrs      = $block['attrs'] ?? array();

    $is_first_hero_carousel = false;
    if ('kotlinskidev/hero-carousel' === $block_name) {
        $state = &kotlinskidev_above_fold_state();
        $is_first_hero_carousel = 0 === $state['hero_carousels'];
        ++$state['hero_carousels'];
    }

    if (isset($attrs['kotlinskidevAboveFold'])) {
        return (bool) $attrs['kotlinskidevAboveFold'];
    }

    if (isset($attrs['kotlinskidevSkipLazy'])) {
        return (bool) $attrs['kotlinskidevSkipLazy'];
    }

    if ('kotlinskidev/device-frame' === $block_name) {
        return 'eager' === ($attrs['loading'] ?? '') || 'high' === ($attrs['fetchPriority'] ?? '');
    }

    if ('kotlinskidev/hero-carousel' === $block_name) {
        return $is_first_hero_carousel && empty($attrs['lazyLoad']);
    }

    return false;
}

function kotlinskidev_claim_lcp_slot(string $preload_url = ''): bool
{
    $state = &kotlinskidev_above_fold_state();

    if ($state['claimed']) {
        return false;
    }

    $state['claimed']     = true;
    $state['preload_url'] = $preload_url;

    wp_high_priority_element_flag(false);
    wp_increase_content_media_count(wp_omit_loading_attr_threshold());

    return true;
}

function kotlinskidev_print_lcp_preload(): void
{
    $state = kotlinskidev_above_fold_state();

    if (!$state['claimed'] || '' === $state['preload_url']) {
        return;
    }

    printf(
        '<link rel="preload" as="image" fetchpriority="high" href="%s">' . "\n",
        esc_url($state['preload_url'])
    );
}
add_action('wp_head', 'kotlinskidev_print_lcp_preload', 1);

function kotlinskidev_resolve_hero_carousel_above_fold(array $parsed_block): array
{
    if ('kotlinskidev/hero-carousel' !== ($parsed_block['blockName'] ?? '')) {
        return $parsed_block;
    }

    $parsed_block['attrs']['kotlinskidevAboveFold'] = kotlinskidev_is_above_fold($parsed_block);

    return $parsed_block;
}
add_filter('render_block_data', 'kotlinskidev_resolve_hero_carousel_above_fold', 10, 1);
