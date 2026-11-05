<?php
function kotlinskidev_toggleable_features(): array {
    return [
        'project_cards'      => __( 'Project Cards', 'kotlinskidev' ),
        'article_cards'      => __( 'Article Cards', 'kotlinskidev' ),
        'service_locations'  => __( 'Service Locations', 'kotlinskidev' ),
        'certificates'       => __( 'Certificates', 'kotlinskidev' ),
        'canvas_backgrounds' => __( 'Canvas Backgrounds', 'kotlinskidev' ),
    ];
}

function kotlinskidev_get_enabled_features(): array {
    return (array) get_option( 'kotlinskidev_enabled_features', array_keys( kotlinskidev_toggleable_features() ) );
}

function kotlinskidev_feature_enabled( string $feature ): bool {
    return in_array( $feature, kotlinskidev_get_enabled_features(), true );
}

function kotlinskidev_sanitize_enabled_features( $value ): array {
    $known = array_keys( kotlinskidev_toggleable_features() );

    if ( ! is_array( $value ) ) {
        return [];
    }

    return array_values( array_intersect( $known, array_filter( array_map( 'sanitize_key', $value ) ) ) );
}
