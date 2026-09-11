<?php
add_action('wp_enqueue_scripts', function () {
    if (has_block('kotlinskidev/banner-carousel')) {
        wp_enqueue_style('swiper-css', get_template_directory_uri() . '/node_modules/swiper/swiper-bundle.min.css');
        wp_enqueue_script('swiper-js', get_template_directory_uri() . '/node_modules/swiper/swiper-bundle.min.js', [], null, true);
        wp_enqueue_script('banner-carousel-init', get_template_directory_uri() . '/src/blocks/banner-carousel/init.js', ['swiper-js'], null, true);

        wp_enqueue_script(
            'kotlinskidev-banner-carousel',
            kotlinskidev_build_url('js', 'banner-carousel.js'),
            // ['wp-blocks', 'wp-element'], // Only necessary dependencies for frontend
            [], // Only necessary dependencies for frontend
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
});

// Enqueue editor assets
add_action('enqueue_block_editor_assets', function () {
    $banner_carousel_asset_path = kotlinskidev_build_path('js', 'banner-carousel.asset.php');
    $banner_carousel_asset = file_exists($banner_carousel_asset_path)
        ? include $banner_carousel_asset_path
        : ['dependencies' => [], 'version' => null];

    wp_enqueue_script(
        'kotlinskidev-banner-carousel-editor',
        kotlinskidev_build_url('js', 'banner-carousel.js'),
        $banner_carousel_asset['dependencies'],
        $banner_carousel_asset['version'],
        true
    );
    wp_enqueue_style(
        'kotlinskidev-banner-carousel-editor-style',
        kotlinskidev_build_url('css', 'banner-carousel.css'),
        [],
        null
    );
    wp_enqueue_style(
        'kotlinskidev-style-banner-carousel-editor-style',
        kotlinskidev_build_url('css', 'style-banner-carousel.css'),
        [],
        null
    );
});

// Extend defer attribute to WordPress core scripts
add_filter('script_loader_tag', function ($tag, $handle) {
    $defer_scripts = [
        'swiper-js',
        'banner-carousel-init',
        'kotlinskidev-banner-carousel'
    ];
    if (in_array($handle, $defer_scripts)) {
        return str_replace(' src', ' defer src', $tag);
    }
    return $tag;
}, 10, 2);

// Inject block attributes as data-banner-carousel-settings
add_filter('render_block', function ($block_content, $block) {
    // Check if the block is the banner-carousel block
    if ($block['blockName'] === 'kotlinskidev/banner-carousel') {
        // Extract block attributes
        $attributes = isset($block['attrs']) ? $block['attrs'] : [];

        // Pass block attributes to the frontend
        $settings = [
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

        // Inject settings as a data attribute in the block's wrapper
        $block_content = preg_replace(
            '/<div/',
            '<div data-banner-carousel-settings="' . esc_attr(json_encode($settings)) . '"',
            $block_content,
            1
        );
    }

    return $block_content;
}, 10, 2);