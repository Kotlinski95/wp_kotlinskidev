<?php
function kotlinskidev_get_deferrable_block_assets(): array
{
    return apply_filters('kotlinskidev_deferrable_block_assets', array(
        'wpe/slider' => array(
            'style' => array('wpe-slider-style'),
        ),
        'kotlinskidev/gallery-lightbox' => array(
            'style' => array('kotlinskidev-gallery-lightbox-view-style'),
        ),
        'kotlinskidev/banner-carousel' => array(
            'style' => array(
                'kotlinskidev-banner-carousel-style',
                'kotlinskidev-style-banner-carousel-style',
            ),
        ),
        'kotlinskidev/hero-carousel' => array(
            'style' => array(
                'kotlinskidev-hero-carousel-style',
                'kotlinskidev-hero-carousel-view-style',
            ),
            'default_above_fold' => true,
        ),
    ));
}

function kotlinskidev_get_above_fold_defaults(): array
{
    $defaults = array();

    foreach (kotlinskidev_get_deferrable_block_assets() as $block_name => $assets) {
        $defaults[$block_name] = !empty($assets['default_above_fold']);
    }

    return $defaults;
}

function kotlinskidev_scan_blocks_for_above_fold(array $blocks, array $defaults): array
{
    $found = array();

    foreach ($blocks as $block) {
        $block_name = $block['blockName'] ?? '';

        if ('' !== $block_name && array_key_exists($block_name, $defaults)) {
            $attrs = $block['attrs'] ?? array();
            $is_above_fold = array_key_exists('kotlinskidevAboveFold', $attrs)
                ? (bool) $attrs['kotlinskidevAboveFold']
                : $defaults[$block_name];

            if ($is_above_fold) {
                $found[] = $block_name;
            }
        }

        if (!empty($block['innerBlocks'])) {
            $found = array_merge($found, kotlinskidev_scan_blocks_for_above_fold($block['innerBlocks'], $defaults));
        }
    }

    return array_unique($found);
}

function kotlinskidev_get_above_fold_block_names(): array
{
    static $cached = null;

    if (null !== $cached) {
        return $cached;
    }

    if (!is_singular()) {
        $cached = array();
        return $cached;
    }

    $post = get_queried_object();
    if (!$post instanceof WP_Post || empty($post->post_content)) {
        $cached = array();
        return $cached;
    }

    $transient_key = 'kotlinskidev_above_fold_' . $post->ID . '_' . strtotime($post->post_modified_gmt);
    $found = get_transient($transient_key);

    if (false === $found) {
        $found = kotlinskidev_scan_blocks_for_above_fold(
            parse_blocks($post->post_content),
            kotlinskidev_get_above_fold_defaults()
        );
        set_transient($transient_key, $found, WEEK_IN_SECONDS);
    }

    $cached = $found;
    return $cached;
}

function kotlinskidev_get_deferred_block_style_handles(): array
{
    static $cached = null;

    if (null !== $cached) {
        return $cached;
    }

    $above_fold_blocks = kotlinskidev_get_above_fold_block_names();
    $handles = array();

    foreach (kotlinskidev_get_deferrable_block_assets() as $block_name => $assets) {
        if (in_array($block_name, $above_fold_blocks, true)) {
            continue;
        }

        if (!empty($assets['style'])) {
            $handles = array_merge($handles, (array) $assets['style']);
        }
    }

    $cached = $handles;
    return $cached;
}

function kotlinskidev_localize_deferrable_blocks(): void
{
    wp_localize_script('kotlinskidev-editor-only', 'kotlinskidevDeferrableBlocks', array(
        'blocks' => kotlinskidev_get_above_fold_defaults(),
    ));
}
add_action('enqueue_block_editor_assets', 'kotlinskidev_localize_deferrable_blocks', 20);
