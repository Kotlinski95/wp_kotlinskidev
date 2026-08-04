<?php

/**
 * Page View Tracking System
 * 
 * This file handles the backend functionality for tracking page views
 * Works alongside Google Analytics for internal WordPress sorting
 * Provide AJAX data for the bundled page view tracking script
 */

// 
function kotlinskidev_localize_page_view_data()
{
    if (is_single() || is_page()) {
        wp_localize_script('wp-typescript', 'kotlinskidev_ajax', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('kotlinskidev_page_view_nonce')
        ));
    }
}
add_action('wp_enqueue_scripts', 'kotlinskidev_localize_page_view_data', 20);

function kotlinskidev_handle_page_view_tracking()
{
    if (!wp_verify_nonce($_POST['nonce'] ?? '', 'kotlinskidev_page_view_nonce')) {
        wp_die('Security check failed');
    }

    $post_id = intval($_POST['post_id'] ?? 0);

    if (!$post_id || !get_post($post_id)) {
        wp_send_json_error('Invalid post ID');
        return;
    }

    $current_views = get_post_meta($post_id, '_kotlinskidev_page_views', true);
    $current_views = $current_views ? intval($current_views) : 0;

    $new_views = $current_views + 1;
    update_post_meta($post_id, '_kotlinskidev_page_views', $new_views);

    update_post_meta($post_id, '_kotlinskidev_last_viewed', current_time('mysql'));

    wp_send_json_success(array(
        'views' => $new_views,
        'post_id' => $post_id
    ));
}

add_action('wp_ajax_kotlinskidev_track_page_view', 'kotlinskidev_handle_page_view_tracking');
add_action('wp_ajax_nopriv_kotlinskidev_track_page_view', 'kotlinskidev_handle_page_view_tracking');

function kotlinskidev_get_page_views($post_id)
{
    $views = get_post_meta($post_id, '_kotlinskidev_page_views', true);
    return $views ? intval($views) : 0;
}

function kotlinskidev_get_popular_posts($limit = 6, $post_types = array('post', 'page'))
{
    $lang = function_exists('pll_current_language') ? pll_current_language() : '';
    $cache_key = KOTLINSKIDEV_CACHE_PREFIX . 'popular_posts_' . md5($limit . '|' . implode(',', (array) $post_types) . '|' . $lang);
    $post_ids  = get_transient($cache_key);

    if ($post_ids === false) {
        $args = array(
            'post_type' => $post_types,
            'post_status' => 'publish',
            'posts_per_page' => $limit * 2,
            'meta_key' => '_kotlinskidev_page_views',
            'orderby' => 'meta_value_num',
            'order' => 'DESC',
            'fields' => 'ids',
            'no_found_rows' => true,
            'update_post_meta_cache' => false,
            'update_post_term_cache' => false,
            'meta_query' => array(
                'relation' => 'AND',
                array(
                    'key' => '_kotlinskidev_page_views',
                    'compare' => 'EXISTS'
                )
            )
        );
        $args = kotlinskidev_apply_seo_noindex_exclusion($args);

        $post_ids = ( new WP_Query($args) )->posts;
        set_transient($cache_key, $post_ids, 15 * MINUTE_IN_SECONDS);
    }

    if (empty($post_ids)) {
        return new WP_Query(array('post__in' => array(0), 'lang' => ''));
    }

    // 'lang' => '' skips Polylang's per-post language re-validation here — the IDs
    // are already language-resolved by the cached query above, so re-checking each
    // one again on every request (cache hit or not) would be redundant DB work.
    return new WP_Query(array(
        'post__in' => $post_ids,
        'orderby' => 'post__in',
        'post_type' => $post_types,
        'post_status' => 'publish',
        'posts_per_page' => count($post_ids),
        'no_found_rows' => true,
        'lang' => '',
    ));
}

function kotlinskidev_add_views_column($columns)
{
    $columns['page_views'] = 'Page Views';
    return $columns;
}
add_filter('manage_posts_columns', 'kotlinskidev_add_views_column');
add_filter('manage_pages_columns', 'kotlinskidev_add_views_column');

function kotlinskidev_show_views_column($column, $post_id)
{
    if ($column === 'page_views') {
        $views = kotlinskidev_get_page_views($post_id);
        echo $views > 0 ? number_format($views) : '—';
    }
}
add_action('manage_posts_custom_column', 'kotlinskidev_show_views_column', 10, 2);
add_action('manage_pages_custom_column', 'kotlinskidev_show_views_column', 10, 2);

function kotlinskidev_views_column_sortable($columns)
{
    $columns['page_views'] = '_kotlinskidev_page_views';
    return $columns;
}
add_filter('manage_edit-post_sortable_columns', 'kotlinskidev_views_column_sortable');
add_filter('manage_edit-page_sortable_columns', 'kotlinskidev_views_column_sortable');

function kotlinskidev_views_column_orderby($query)
{
    if (!is_admin()) return;

    $orderby = $query->get('orderby');
    if ('_kotlinskidev_page_views' === $orderby) {
        $query->set('meta_key', '_kotlinskidev_page_views');
        $query->set('orderby', 'meta_value_num');
    }
}
add_action('pre_get_posts', 'kotlinskidev_views_column_orderby');

function kotlinskidev_add_post_id_meta()
{
    if (is_single() || is_page()) {
        global $post;
        if ($post && $post->ID) {
            echo '<meta name="post-id" content="' . esc_attr($post->ID) . '">' . "\n";
        }
    }
}
add_action('wp_head', 'kotlinskidev_add_post_id_meta');
