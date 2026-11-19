<?php
function kotlinskidev_is_polish_search_page_request() {
    if (!is_page()) {
        return false;
    }

    $template = get_page_template_slug();
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search query detection, no state change
    return $template === 'search_pl.html' && isset($_GET['s']) && !empty($_GET['s']);
}

function kotlinskidev_exclude_noindex_content_from_search($query) {
    $excluded = kotlinskidev_apply_seo_noindex_exclusion(array(
        'meta_query' => (array) $query->get('meta_query'),
        'post__not_in' => (array) $query->get('post__not_in'),
    ));
    if (!empty($excluded['meta_query'])) {
        $query->set('meta_query', $excluded['meta_query']);
    }
    if (!empty($excluded['post__not_in'])) {
        $query->set('post__not_in', $excluded['post__not_in']);
    }
}

function kotlinskidev_enhance_search($query) {
    if (is_admin() || !$query->is_main_query()) {
        return;
    }

    $is_search = $query->is_search();
    $is_polish_search = kotlinskidev_is_polish_search_page_request();

    if (!$is_search && !$is_polish_search) {
        return;
    }

    $query->set('post_type', array('post', 'page'));
    $query->set('orderby', 'relevance');
    $query->set('order', 'DESC');

    kotlinskidev_exclude_noindex_content_from_search($query);

    if ($is_polish_search) {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search query filtering, no state change
        $query->set('s', sanitize_text_field(wp_unslash($_GET['s'])));
        $query->is_search = true;
        $query->is_page = false;
    }
}
add_action('pre_get_posts', 'kotlinskidev_enhance_search');
