<?php
function kotlinskidev_create_blog_pages() {
    $topics_page_en = get_page_by_path('blog-topics');
    $topics_page_pl = get_page_by_path('tematy-bloga');

    if (!$topics_page_en) {
        wp_insert_post(array(
            'post_title' => 'Blog Topics',
            'post_content' => 'Explore articles organized by development topics and expertise areas.',
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_name' => 'blog-topics',
            'page_template' => 'archive-category.html'
        ));
    }

    if (!$topics_page_pl) {
        wp_insert_post(array(
            'post_title' => 'Tematy Bloga',
            'post_content' => 'Przeglądaj artykuły podzielone według tematów i obszarów ekspertyzy.',
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_name' => 'tematy-bloga',
            'page_template' => 'archive-category.html'
        ));
    }
}
add_action('after_switch_theme', 'kotlinskidev_create_blog_pages');

function kotlinskidev_display_post_states($post_states, $post) {
    if ($post->post_name === 'blog-topics') {
        $post_states['blog_topics'] = __('Blog Topics Page', 'kotlinskidev');
    }
    if ($post->post_name === 'tematy-bloga') {
        $post_states['blog_topics_pl'] = __('Blog Topics Page (PL)', 'kotlinskidev');
    }
    return $post_states;
}
add_filter('display_post_states', 'kotlinskidev_display_post_states', 10, 2);

function kotlinskidev_add_category_columns($columns) {
    $columns['post_count'] = __('Articles', 'kotlinskidev');
    $columns['last_updated'] = __('Last Updated', 'kotlinskidev');
    return $columns;
}
add_filter('manage_edit-category_columns', 'kotlinskidev_add_category_columns');

function kotlinskidev_category_last_updated_label($term_id) {
    $latest_post = get_posts(array(
        'category' => $term_id,
        'posts_per_page' => 1,
        'post_status' => 'publish',
        'suppress_filters' => false,
        'lang' => function_exists('pll_get_term_language') ? pll_get_term_language($term_id) : '',
    ));

    if (empty($latest_post)) {
        return '—';
    }

    return human_time_diff(get_the_time('U', $latest_post[0]->ID), current_time('timestamp')) . ' ago';
}

function kotlinskidev_category_column_content($content, $column_name, $term_id) {
    if ($column_name === 'post_count') {
        $category = get_category($term_id);
        $content = $category->count . ' articles';
    }

    if ($column_name === 'last_updated') {
        $content = kotlinskidev_category_last_updated_label($term_id);
    }

    return $content;
}
add_filter('manage_category_custom_column', 'kotlinskidev_category_column_content', 10, 3);
