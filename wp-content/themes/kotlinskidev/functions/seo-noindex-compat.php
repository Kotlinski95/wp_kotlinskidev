<?php
function kotlinskidev_detect_active_seo_plugin(): string
{
    if (defined('WPSEO_VERSION')) {
        return 'yoast';
    }
    if (defined('RANK_MATH_VERSION')) {
        return 'rankmath';
    }
    if (defined('AIOSEO_VERSION')) {
        return 'aioseo';
    }
    if (defined('SEOPRESS_VERSION')) {
        return 'seopress';
    }
    return '';
}

function kotlinskidev_get_aioseo_noindex_post_ids(): array
{
    global $wpdb;

    $cache_key = KOTLINSKIDEV_CACHE_PREFIX . 'aioseo_noindex_ids';
    $post_ids = get_transient($cache_key);

    if ($post_ids === false) {
        $table = $wpdb->prefix . 'aioseo_posts';
        $post_ids = $wpdb->get_col("SELECT post_id FROM {$table} WHERE robots_noindex = 1"); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        $post_ids = array_map('absint', (array) $post_ids);
        set_transient($cache_key, $post_ids, 15 * MINUTE_IN_SECONDS);
    }

    return $post_ids;
}

function kotlinskidev_apply_seo_noindex_exclusion(array $query_args): array
{
    $plugin = kotlinskidev_detect_active_seo_plugin();

    if ('' === $plugin) {
        return $query_args;
    }

    if ('aioseo' === $plugin) {
        $noindex_ids = kotlinskidev_get_aioseo_noindex_post_ids();
        if (!empty($noindex_ids)) {
            $existing = $query_args['post__not_in'] ?? array();
            $query_args['post__not_in'] = array_values(array_unique(array_merge($existing, $noindex_ids)));
        }
        return $query_args;
    }

    $plugin_meta = array(
        'yoast' => array(
            'key' => '_yoast_wpseo_meta-robots-noindex',
            'value' => '1',
            'compare' => '!=',
        ),
        'seopress' => array(
            'key' => '_seopress_robots_index',
            'value' => 'yes',
            'compare' => '!=',
        ),
        'rankmath' => array(
            'key' => 'rank_math_robots',
            'value' => 'noindex',
            'compare' => 'NOT LIKE',
        ),
    );

    if (!isset($plugin_meta[$plugin])) {
        return $query_args;
    }

    $meta = $plugin_meta[$plugin];
    $noindex_clause = array(
        'relation' => 'OR',
        array(
            'key' => $meta['key'],
            'compare' => 'NOT EXISTS',
        ),
        array(
            'key' => $meta['key'],
            'value' => $meta['value'],
            'compare' => $meta['compare'],
        ),
    );

    $existing_meta_query = $query_args['meta_query'] ?? array();
    $query_args['meta_query'] = empty($existing_meta_query)
        ? $noindex_clause
        : array('relation' => 'AND', $existing_meta_query, $noindex_clause);

    return $query_args;
}
