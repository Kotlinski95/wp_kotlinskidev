<?php
function kotlinskidev_handle_polish_search_integration() {
    if (get_page_template_slug() !== 'search_pl.html') {
        return;
    }

    global $wp_query;

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search query detection, no state change
    if (isset($_GET['s']) && !empty($_GET['s'])) {
        $wp_query->is_search = true;
        $wp_query->is_page = false;
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search query filtering, no state change
        $wp_query->set('s', sanitize_text_field(wp_unslash($_GET['s'])));
    }
}
add_action('wp', 'kotlinskidev_handle_polish_search_integration');

function kotlinskidev_get_polish_search_page_id() {
    $cache_key = 'kotlinskidev_polish_search_page_id';
    $polish_page_id = wp_cache_get($cache_key);

    if ($polish_page_id === false) {
        $polish_search_pages = get_pages(array(
            'meta_key'   => '_wp_page_template',
            'meta_value' => 'search_pl.html',
            'number'     => 1,
        ));
        $polish_page_id = !empty($polish_search_pages) ? $polish_search_pages[0]->ID : 0;
        wp_cache_set($cache_key, $polish_page_id, '', HOUR_IN_SECONDS);
    }

    return $polish_page_id;
}

function kotlinskidev_redirect_to_polish_search($url) {
    if (get_locale() != 'pl_PL' || strpos($url, '/?s=') === false) {
        return $url;
    }

    $polish_page_id = kotlinskidev_get_polish_search_page_id();

    if ($polish_page_id) {
        $polish_url  = get_permalink($polish_page_id);
        $search_term = str_replace('/?s=', '', $url);
        $url = add_query_arg('s', $search_term, $polish_url);
    }

    return $url;
}
add_filter('search_link', 'kotlinskidev_redirect_to_polish_search');

function kotlinskidev_display_polish_search_states($post_states, $post) {
    $template = get_page_template_slug($post->ID);

    if ($template === 'search_pl.html') {
        $post_states['polish_search'] = __('Polish Search Page', 'kotlinskidev');
    }
    return $post_states;
}
add_filter('display_post_states', 'kotlinskidev_display_polish_search_states', 10, 2);
