<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

const KOTLINSKIDEV_TERM_LATEST_POST_TTL = 12 * HOUR_IN_SECONDS;

function kotlinskidev_term_latest_post_version(): int {
    return (int) get_transient( KOTLINSKIDEV_CACHE_PREFIX . 'term_latest_post_version' );
}

function kotlinskidev_term_latest_post_cache_key( int $term_id, string $taxonomy, string $lang ): string {
    return sprintf(
        '%sterm_latest_post_%s_%d_%s_%d',
        KOTLINSKIDEV_CACHE_PREFIX,
        sanitize_key( $taxonomy ),
        $term_id,
        sanitize_key( $lang ),
        kotlinskidev_term_latest_post_version()
    );
}

function kotlinskidev_term_latest_post_query_args( int $term_id, string $taxonomy, string $lang ): array {
    $args = [
        'posts_per_page'         => 1,
        'post_status'            => 'publish',
        'suppress_filters'       => false,
        'lang'                   => $lang,
        'fields'                 => 'ids',
        'no_found_rows'          => true,
        'update_post_term_cache' => false,
    ];

    if ( 'post_tag' === $taxonomy ) {
        $args['tag_id'] = $term_id;
    } else {
        $args['category'] = $term_id;
    }

    return $args;
}

function kotlinskidev_get_term_latest_post_id( int $term_id, string $taxonomy ): int {
    $lang      = function_exists( 'pll_current_language' ) ? (string) pll_current_language() : '';
    $cache_key = kotlinskidev_term_latest_post_cache_key( $term_id, $taxonomy, $lang );
    $cached    = get_transient( $cache_key );

    if ( false !== $cached ) {
        return (int) $cached;
    }

    $ids       = get_posts( kotlinskidev_term_latest_post_query_args( $term_id, $taxonomy, $lang ) );
    $latest_id = empty( $ids ) ? 0 : (int) $ids[0];

    set_transient( $cache_key, $latest_id, KOTLINSKIDEV_TERM_LATEST_POST_TTL );

    return $latest_id;
}

function kotlinskidev_purge_term_latest_post_cache(): void {
    set_transient( KOTLINSKIDEV_CACHE_PREFIX . 'term_latest_post_version', kotlinskidev_term_latest_post_version() + 1 );
}

function kotlinskidev_purge_term_latest_post_cache_on_post( $post_id ): void {
    if ( 'post' === get_post_type( (int) $post_id ) ) {
        kotlinskidev_purge_term_latest_post_cache();
    }
}

function kotlinskidev_purge_term_latest_post_cache_on_object_terms( $object_id, $terms, $tt_ids, $taxonomy ): void {
    if ( in_array( $taxonomy, [ 'category', 'post_tag' ], true ) ) {
        kotlinskidev_purge_term_latest_post_cache();
    }
}

function kotlinskidev_purge_term_latest_post_cache_on_term( $term_id, $tt_id, $taxonomy ): void {
    if ( in_array( $taxonomy, [ 'category', 'post_tag' ], true ) ) {
        kotlinskidev_purge_term_latest_post_cache();
    }
}

add_action( 'save_post_post', 'kotlinskidev_purge_term_latest_post_cache' );
add_action( 'delete_post', 'kotlinskidev_purge_term_latest_post_cache_on_post' );
add_action( 'trashed_post', 'kotlinskidev_purge_term_latest_post_cache_on_post' );
add_action( 'untrashed_post', 'kotlinskidev_purge_term_latest_post_cache_on_post' );
add_action( 'set_object_terms', 'kotlinskidev_purge_term_latest_post_cache_on_object_terms', 10, 4 );
add_action( 'edited_term', 'kotlinskidev_purge_term_latest_post_cache_on_term', 10, 3 );
