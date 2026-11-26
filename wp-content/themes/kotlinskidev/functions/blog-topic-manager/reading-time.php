<?php
function kotlinskidev_reading_time($post_id = null) {
    if (!$post_id) {
        $post_id = get_the_ID();
    }

    $words_per_minute = 200;
    $content = get_post_field('post_content', $post_id);
    $word_count = str_word_count(strip_tags($content));
    $reading_time = ceil($word_count / $words_per_minute);

    return esc_html($reading_time . ' ' . __('min read', 'kotlinskidev'));
}
