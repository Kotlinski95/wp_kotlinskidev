<?php
function add_poster_image_to_cover_video($output, $block)
{

    if (
        // Only cover blocks
        $block['blockName'] == 'core/cover' &&

        // Only video's
        isset($block['attrs']['backgroundType']) && $block['attrs']['backgroundType'] == 'video' &&

        // Only video's without a poster attribute
        strpos($output, 'poster=') === false
    ) {

        // Get the featured image of the video attachment
        $poster_image = get_the_post_thumbnail_url($block['attrs']['id']);

        if ($poster_image) {

            $output = preg_replace('/(<video\b[^><]*)>/i', '$1 poster="' . $poster_image . '">', $output);
        }
    }

    return $output;
}
add_filter('render_block', 'add_poster_image_to_cover_video', 10, 2);