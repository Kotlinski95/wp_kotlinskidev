<?php
function kotlinskidev_enqueue_banner_carousel_assets()
{
    if (!has_block('kotlinskidev/banner-carousel')) {
        return;
    }

    wp_enqueue_style('swiper-css', get_template_directory_uri() . '/node_modules/swiper/swiper-bundle.min.css');
    wp_enqueue_script('swiper-js', get_template_directory_uri() . '/node_modules/swiper/swiper-bundle.min.js', [], null, true);
    wp_enqueue_script('banner-carousel-init', get_template_directory_uri() . '/src/blocks/banner-carousel/init.js', ['swiper-js'], null, true);

    wp_enqueue_script(
        'kotlinskidev-banner-carousel',
        kotlinskidev_build_url('js', 'banner-carousel.js'),
        [],
        null,
        true
    );
    wp_enqueue_style(
        'kotlinskidev-banner-carousel-style',
        kotlinskidev_build_url('css', 'banner-carousel.css'),
        [],
        null
    );
    wp_enqueue_style(
        'kotlinskidev-style-banner-carousel-style',
        kotlinskidev_build_url('css', 'style-banner-carousel.css'),
        [],
        null
    );
}
add_action('wp_enqueue_scripts', 'kotlinskidev_enqueue_banner_carousel_assets');

function kotlinskidev_defer_banner_carousel_scripts($tag, $handle)
{
    $deferred_handles = [
        'swiper-js',
        'banner-carousel-init',
        'kotlinskidev-banner-carousel'
    ];
    if (in_array($handle, $deferred_handles)) {
        return str_replace(' src', ' defer src', $tag);
    }
    return $tag;
}
add_filter('script_loader_tag', 'kotlinskidev_defer_banner_carousel_scripts', 10, 2);

function kotlinskidev_banner_carousel_settings(array $attributes): array
{
    return [
        'showPagination' => $attributes['showPagination'] ?? true,
        'showArrows' => $attributes['showArrows'] ?? true,
        'slidesPerView' => $attributes['slidesPerView'] ?? 1,
        'enableAutoSwiping' => $attributes['enableAutoSwiping'] ?? false,
        'autoSwipingTime' => $attributes['autoSwipingTime'] ?? 5,
        'enableLoopMode' => $attributes['enableLoopMode'] ?? false,
        'slidesPerMobile' => $attributes['slidesPerMobile'] ?? 1,
        'slidesPerTablet' => $attributes['slidesPerTablet'] ?? 1,
        'slidesPerDesktop' => $attributes['slidesPerDesktop'] ?? 1,
        'showScrollbar' => $attributes['showScrollbar'] ?? false,
    ];
}

function kotlinskidev_add_banner_carousel_settings_attribute($block_content, $block)
{
    if ($block['blockName'] === 'kotlinskidev/banner-carousel') {
        $attributes = isset($block['attrs']) ? $block['attrs'] : [];
        $settings = kotlinskidev_banner_carousel_settings($attributes);

        $block_content = preg_replace(
            '/<div/',
            '<div data-banner-carousel-settings="' . esc_attr(json_encode($settings)) . '"',
            $block_content,
            1
        );
    }

    return $block_content;
}
add_filter('render_block', 'kotlinskidev_add_banner_carousel_settings_attribute', 10, 2);
