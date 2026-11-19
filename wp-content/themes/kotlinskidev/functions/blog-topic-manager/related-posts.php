<?php
function kotlinskidev_get_related_posts($post_id = null, $limit = 3) {
    if (!$post_id) {
        $post_id = get_the_ID();
    }

    $categories = get_the_category($post_id);
    if (empty($categories)) {
        return array();
    }

    $category_ids = array();
    foreach ($categories as $category) {
        $category_ids[] = $category->term_id;
    }

    $post_lang = function_exists('pll_get_post_language') ? pll_get_post_language($post_id) : '';

    $candidate_ids = get_posts(array(
        'category__in' => $category_ids,
        'post__not_in' => array($post_id),
        'posts_per_page' => -1,
        'post_status' => 'publish',
        'fields' => 'ids',
        'no_found_rows' => true,
        'suppress_filters' => false,
        'lang' => $post_lang,
    ));

    if (empty($candidate_ids)) {
        return array();
    }

    shuffle($candidate_ids);
    $selected_ids = array_slice($candidate_ids, 0, $limit);

    return get_posts(array(
        'post__in' => $selected_ids,
        'orderby' => 'post__in',
        'posts_per_page' => $limit,
        'post_status' => 'publish',
        'no_found_rows' => true,
        'suppress_filters' => false,
        'lang' => $post_lang,
    ));
}
