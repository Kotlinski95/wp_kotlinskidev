<?php
function kotlinskidev_get_search_excerpt($content, $search_query, $word_limit = 40) {
    $content = wp_strip_all_tags(strip_shortcodes($content));
    $search_pos = stripos($content, $search_query);

    if ($search_pos === false) {
        $excerpt = wp_trim_words($content, $word_limit, '...');
        return kotlinskidev_highlight_search_terms($excerpt, $search_query);
    }

    $start = max(0, $search_pos - 100);
    $excerpt = substr($content, $start, 300);

    if ($start > 0) {
        $excerpt = '...' . substr($excerpt, strpos($excerpt, ' '));
    }
    if (strlen($content) > $start + 300) {
        $excerpt = substr($excerpt, 0, strrpos($excerpt, ' ')) . '...';
    }

    return kotlinskidev_highlight_search_terms($excerpt, $search_query);
}

function kotlinskidev_highlight_search_terms($text, $search_query) {
    $text = esc_html($text);

    if (empty($search_query)) {
        return $text;
    }

    $minimum_highlight_length = 2;

    foreach (explode(' ', $search_query) as $word) {
        $word = esc_html(trim($word));
        if (strlen($word) > $minimum_highlight_length) {
            $text = preg_replace(
                '/(' . preg_quote($word, '/') . ')/i',
                '<mark style="background:#5259ff;color:white;padding:0.125rem 0.25rem;border-radius:0.1875rem;">$1</mark>',
                $text
            );
        }
    }

    return $text;
}
