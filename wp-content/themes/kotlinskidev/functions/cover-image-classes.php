<?php
const KOTLINSKIDEV_LAZY_IMG_ATTRIBUTES   = array('loading', 'fetchpriority', 'data-lazy-src', 'data-src', 'data-lazy');
const KOTLINSKIDEV_LAZY_VIDEO_ATTRIBUTES = array('loading', 'fetchpriority', 'data-lazy', 'data-src');

function kotlinskidev_get_lazy_control_block_names(): array
{
    return array('core/cover', 'core/image', 'core/video');
}

function kotlinskidev_get_cover_video_poster_url(array $block): string
{
    $attrs = $block['attrs'] ?? array();

    if ('core/cover' !== ($block['blockName'] ?? '') || 'video' !== ($attrs['backgroundType'] ?? '')) {
        return '';
    }

    if (!empty($attrs['poster'])) {
        return (string) $attrs['poster'];
    }

    if (!empty($attrs['id'])) {
        return (string) get_the_post_thumbnail_url($attrs['id']);
    }

    return '';
}

function kotlinskidev_add_media_classes(string $attributes, array $classes): string
{
    if (false !== strpos($attributes, 'class=')) {
        return preg_replace('/class="([^"]*)"/', 'class="$1 ' . implode(' ', $classes) . '"', $attributes);
    }

    return $attributes . ' class="' . implode(' ', $classes) . '"';
}

function kotlinskidev_strip_media_attributes(string $attributes, array $attribute_names): string
{
    foreach ($attribute_names as $attribute_name) {
        $attributes = preg_replace('/\s*' . $attribute_name . '=["\'][^"\']*["\']/', '', $attributes);
    }

    return $attributes;
}

function kotlinskidev_make_img_tag_eager(string $img_attributes, array $classes, string $fetch_priority_attribute): string
{
    $img_attributes = kotlinskidev_strip_media_attributes($img_attributes, KOTLINSKIDEV_LAZY_IMG_ATTRIBUTES);
    $img_attributes .= ' loading="eager"' . $fetch_priority_attribute;

    return '<img' . kotlinskidev_add_media_classes($img_attributes, $classes) . '>';
}

function kotlinskidev_make_video_tag_eager(string $video_attributes, array $classes, string $fetch_priority_attribute): string
{
    $video_attributes = kotlinskidev_strip_media_attributes($video_attributes, KOTLINSKIDEV_LAZY_VIDEO_ATTRIBUTES);
    $video_attributes .= $fetch_priority_attribute;

    return '<video' . kotlinskidev_add_media_classes($video_attributes, $classes) . '>';
}

function control_block_lazy_loading($output, $block)
{
    if (!in_array($block['blockName'], kotlinskidev_get_lazy_control_block_names(), true)) {
        return $output;
    }

    if (!kotlinskidev_is_above_fold($block)) {
        return $output;
    }

    $lazy_class     = get_theme_mod('kotlinskidev_lazy_loading_class', 'skip-lazy');
    $classes_to_add = array($lazy_class, 'no-lazy-loading');
    $high_priority  = kotlinskidev_claim_lcp_slot(array(array('href' => kotlinskidev_get_cover_video_poster_url($block))));

    $take_high_priority = static function () use (&$high_priority): string {
        $attribute     = $high_priority ? ' fetchpriority="high"' : '';
        $high_priority = false;
        return $attribute;
    };

    $output = preg_replace_callback(
        '/<img([^>]*?)\s*\/?>/i',
        static fn (array $matches): string => kotlinskidev_make_img_tag_eager($matches[1], $classes_to_add, $take_high_priority()),
        $output
    );

    return preg_replace_callback(
        '/<video([^>]*?)\s*\/?>/i',
        static fn (array $matches): string => kotlinskidev_make_video_tag_eager($matches[1], $classes_to_add, $take_high_priority()),
        $output
    );
}
add_filter('render_block', 'control_block_lazy_loading', 10, 2);

function disable_wp_lazy_loading_for_blocks($value, $image, $context) {
    if (doing_filter('render_block')) {
        global $current_block_skip_lazy;
        if ($current_block_skip_lazy) {
            return 'eager';
        }
    }
    
    return $value;
}
add_filter('wp_img_tag_add_loading_attr', 'disable_wp_lazy_loading_for_blocks', 10, 3);

function set_lazy_loading_context($output, $block) {
    global $current_block_skip_lazy;
    
    if (!in_array($block['blockName'], kotlinskidev_get_lazy_control_block_names(), true)) {
        return $output;
    }

    $current_block_skip_lazy = kotlinskidev_is_above_fold($block);
    
    return $output;
}
add_filter('render_block', 'set_lazy_loading_context', 5, 2);

function add_lazy_loading_override_script() {
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Find all images with no-lazy-loading class and ensure they're not lazy loaded
        document.querySelectorAll('img.no-lazy-loading').forEach(function(img) {
            // Remove any lazy loading attributes that might have been added by plugins
            img.removeAttribute('data-lazy-src');
            img.removeAttribute('data-src');
            img.removeAttribute('data-lazy');
            img.removeAttribute('data-smush-lazy');
            
            // Force loading to eager
            img.setAttribute('loading', 'eager');
            
            // If the image has a data-src (lazy loading), move it to src immediately
            if (img.hasAttribute('data-src') && !img.src) {
                img.src = img.getAttribute('data-src');
            }
        });
        
        // Find all videos with no-lazy-loading class and ensure they have high priority
        document.querySelectorAll('video.no-lazy-loading').forEach(function(video) {
            // Remove any lazy loading attributes that might have been added by plugins
            video.removeAttribute('data-lazy');
            video.removeAttribute('data-src');
            
            // If the video has a data-src (lazy loading), move it to src immediately
            if (video.hasAttribute('data-src') && !video.src) {
                video.src = video.getAttribute('data-src');
            }
        });
    });
    </script>
    <?php
}
add_action('wp_footer', 'add_lazy_loading_override_script');

function add_cover_block_attributes() {
}
add_action('init', 'add_cover_block_attributes');
