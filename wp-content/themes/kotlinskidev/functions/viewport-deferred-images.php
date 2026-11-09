<?php
function kotlinskidev_should_defer_panel_images(): bool
{
    if (is_admin() || is_feed() || wp_is_json_request()) {
        return false;
    }

    return !(defined('REST_REQUEST') && REST_REQUEST);
}

function kotlinskidev_defer_image_tag(string $tag): string
{
    if (1 !== preg_match('/\ssrc=/i', $tag) || 1 === preg_match('/\sdata-src=/i', $tag)) {
        return $tag;
    }

    $deferred = preg_replace('/(\s)(src|srcset|sizes)=/i', '$1data-$2=', $tag);

    return $deferred . '<noscript>' . $tag . '</noscript>';
}

function kotlinskidev_defer_content_tabs_images(string $block_content, array $block, $instance = null): string
{
    if (!kotlinskidev_should_defer_panel_images() || false === strpos($block_content, '<img')) {
        return $block_content;
    }

    if (kotlinskidev_is_above_fold($block)) {
        return $block_content;
    }

    $deferred = preg_replace_callback(
        '/<img\b[^>]*>/i',
        static fn (array $match): string => kotlinskidev_defer_image_tag($match[0]),
        $block_content
    );

    return is_string($deferred) ? $deferred : $block_content;
}
add_filter('render_block_kotlinskidev/content-tabs-item', 'kotlinskidev_defer_content_tabs_images', 10, 3);
