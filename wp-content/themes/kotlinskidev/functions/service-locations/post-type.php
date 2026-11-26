<?php
function kotlinskidev_register_service_location_post_type(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    register_post_type( 'service_location', [
        'labels' => [
            'name'          => __( 'Service Locations', 'kotlinskidev' ),
            'singular_name' => __( 'Service Location', 'kotlinskidev' ),
            'add_new_item'  => __( 'Add New City Page', 'kotlinskidev' ),
            'edit_item'     => __( 'Edit City Page', 'kotlinskidev' ),
            'search_items'  => __( 'Search City Pages', 'kotlinskidev' ),
            'not_found'     => __( 'No city pages found', 'kotlinskidev' ),
        ],
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_rest'       => true,
        'menu_icon'          => 'dashicons-location-alt',
        'menu_position'      => 22,
        'supports'           => [ 'title', 'editor', 'thumbnail', 'custom-fields' ],
        'has_archive'        => false,
        'rewrite'            => [ 'slug' => 'tworzenie-stron-www', 'with_front' => false ],
    ] );
}
add_action( 'init', 'kotlinskidev_register_service_location_post_type' );

function kotlinskidev_service_location_city_meta_auth(): bool {
    return current_user_can( 'edit_posts' );
}

function kotlinskidev_register_service_location_meta(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    register_post_meta( 'service_location', 'city', [
        'type'              => 'string',
        'single'            => true,
        'show_in_rest'      => true,
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback'     => 'kotlinskidev_service_location_city_meta_auth',
    ] );
}
add_action( 'init', 'kotlinskidev_register_service_location_meta' );
