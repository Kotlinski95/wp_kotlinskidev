<?php
function kotlinskidev_render_city_map_block(): string {
    $city = get_post_meta( get_the_ID(), 'city', true );

    if ( ! $city ) {
        return '';
    }

    $embed_url = 'https://www.google.com/maps?q=' . rawurlencode( $city . ', Poland' ) . '&output=embed';
    $title     = sprintf( /* translators: %s: city name */ __( 'Map of %s', 'kotlinskidev' ), $city );

    return sprintf(
        '<div class="kt-city-map"><iframe class="kt-city-map__frame" src="%1$s" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="%2$s"></iframe><button type="button" class="kt-city-map__expand" data-city-map-expand data-city-map-src="%1$s" data-city-map-title="%2$s" aria-label="%3$s"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm16 0h2v6h-6v-2h4v-4z"/></svg></button></div>',
        esc_url( $embed_url ),
        esc_attr( $title ),
        esc_attr__( 'View larger map', 'kotlinskidev' )
    );
}

function kotlinskidev_register_city_map_block(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    register_block_type( 'kotlinskidev/city-map', [
        'title'            => __( 'City Map', 'kotlinskidev' ),
        'category'         => 'kotlinskidev',
        'icon'             => 'location',
        'render_callback'  => 'kotlinskidev_render_city_map_block',
    ] );
}
add_action( 'init', 'kotlinskidev_register_city_map_block' );
