<?php
function kotlinskidev_get_related_articles_candidate($post_id, array $tag_ids, array $category_ids, array $already_included, $limit) {
    $args = array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => $limit,
        'post__not_in' => $already_included,
        'orderby' => 'date',
        'order' => 'DESC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    );

    if (!empty($category_ids)) {
        $args['category__in'] = $category_ids;
    }
    if (!empty($tag_ids)) {
        $args['tag__in'] = $tag_ids;
    }

    $found = array();
    $query = new WP_Query($args);
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $post_obj = get_post();
            if ($post_obj->ID !== $post_id) {
                $found[] = $post_obj;
            }
        }
        wp_reset_postdata();
    }

    return $found;
}

function kotlinskidev_get_related_articles_for_current_post($limit = 3) {
    $current_post_id = get_the_ID();
    $current_categories = get_the_category($current_post_id);
    $current_tags = get_the_tags($current_post_id);
    $category_ids = !empty($current_categories) ? array($current_categories[0]->term_id) : array();
    $tag_ids = !empty($current_tags) ? array_map(fn ($tag) => $tag->term_id, $current_tags) : array();

    $matching_stages = array(
        array('tag_ids' => $tag_ids, 'category_ids' => $category_ids, 'is_applicable' => !empty($category_ids) && !empty($tag_ids)),
        array('tag_ids' => array(), 'category_ids' => $category_ids, 'is_applicable' => !empty($category_ids)),
        array('tag_ids' => $tag_ids, 'category_ids' => array(), 'is_applicable' => !empty($tag_ids)),
        array('tag_ids' => array(), 'category_ids' => array(), 'is_applicable' => true),
    );

    $related_posts = array();

    foreach ($matching_stages as $stage_index => $stage) {
        $is_first_stage = $stage_index === 0;
        if (!$stage['is_applicable'] || (!$is_first_stage && count($related_posts) >= $limit)) {
            continue;
        }

        $related_posts = array_merge($related_posts, kotlinskidev_get_related_articles_candidate(
            $current_post_id,
            $stage['tag_ids'],
            $stage['category_ids'],
            array_merge(array($current_post_id), array_column($related_posts, 'ID')),
            $limit - count($related_posts)
        ));
    }

    return array_values(array_filter($related_posts, fn ($post) => $post->ID !== $current_post_id));
}
