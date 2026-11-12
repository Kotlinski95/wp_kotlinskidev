<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

const KOTLINSKIDEV_SERVICE_LOCATION_READY_IDS_TTL = 12 * HOUR_IN_SECONDS;

function kotlinskidev_service_location_ready_ids_cache_key( string $lang ): string {
    return KOTLINSKIDEV_CACHE_PREFIX . 'city_grid_ready_ids_' . sanitize_key( $lang );
}

function kotlinskidev_service_location_ready_ids( string $lang ): array {
    $cache_key = kotlinskidev_service_location_ready_ids_cache_key( $lang );
    $cached    = get_transient( $cache_key );

    if ( is_array( $cached ) ) {
        return array_map( 'intval', $cached );
    }

    $query_args = [
        'post_type'              => 'service_location',
        'post_status'            => 'publish',
        'posts_per_page'         => -1,
        'fields'                 => 'ids',
        'no_found_rows'          => true,
        'update_post_term_cache' => false,
        'suppress_filters'       => false,
        'meta_key'               => 'city',
        'orderby'                => 'meta_value',
        'order'                  => 'ASC',
    ];

    if ( '' !== $lang ) {
        $query_args['lang'] = $lang;
    }

    $ready_ids = array_values(
        array_filter(
            array_map( 'intval', get_posts( $query_args ) ),
            'kotlinskidev_service_location_post_is_ready'
        )
    );

    set_transient( $cache_key, $ready_ids, KOTLINSKIDEV_SERVICE_LOCATION_READY_IDS_TTL );

    return $ready_ids;
}

function kotlinskidev_service_location_flush_ready_ids_cache(): void {
    $languages = function_exists( 'pll_languages_list' ) ? (array) pll_languages_list() : [];

    foreach ( array_merge( [ '' ], $languages ) as $lang ) {
        delete_transient( kotlinskidev_service_location_ready_ids_cache_key( (string) $lang ) );
    }
}

function kotlinskidev_service_location_flush_ready_ids_on_post( $post_id ): void {
    if ( 'service_location' === get_post_type( (int) $post_id ) ) {
        kotlinskidev_service_location_flush_ready_ids_cache();
    }
}

function kotlinskidev_service_location_flush_ready_ids_on_meta( $meta_id, $post_id ): void {
    kotlinskidev_service_location_flush_ready_ids_on_post( $post_id );
}

add_action( 'save_post_service_location', 'kotlinskidev_service_location_flush_ready_ids_cache' );
add_action( 'deleted_post', 'kotlinskidev_service_location_flush_ready_ids_on_post' );
add_action( 'trashed_post', 'kotlinskidev_service_location_flush_ready_ids_on_post' );
add_action( 'untrashed_post', 'kotlinskidev_service_location_flush_ready_ids_on_post' );
add_action( 'added_post_meta', 'kotlinskidev_service_location_flush_ready_ids_on_meta', 10, 2 );
add_action( 'updated_post_meta', 'kotlinskidev_service_location_flush_ready_ids_on_meta', 10, 2 );
add_action( 'deleted_post_meta', 'kotlinskidev_service_location_flush_ready_ids_on_meta', 10, 2 );
