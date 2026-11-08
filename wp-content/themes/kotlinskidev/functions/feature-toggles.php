<?php
const KOTLINSKIDEV_FEATURE_TOGGLES_VERSION_OPTION = 'kotlinskidev_feature_toggles_version';
const KOTLINSKIDEV_FEATURE_TOGGLES_VERSION        = 2;

function kotlinskidev_features_added_in_version_two(): array {
    return [ 'offers', 'article_toc', 'site_values', 'cover_video_controls' ];
}

function kotlinskidev_toggleable_feature_keys(): array {
    return [
        'project_cards',
        'article_cards',
        'service_locations',
        'certificates',
        'canvas_backgrounds',
        'offers',
        'article_toc',
        'site_values',
        'cover_video_controls',
    ];
}

function kotlinskidev_toggleable_features(): array {
    return [
        'project_cards'      => __( 'Project Cards', 'kotlinskidev' ),
        'article_cards'      => __( 'Article Cards', 'kotlinskidev' ),
        'service_locations'  => __( 'Service Locations', 'kotlinskidev' ),
        'certificates'       => __( 'Certificates', 'kotlinskidev' ),
        'canvas_backgrounds' => __( 'Canvas Backgrounds', 'kotlinskidev' ),
        'offers'               => __( 'Offers', 'kotlinskidev' ),
        'article_toc'          => __( 'Article Table of Contents', 'kotlinskidev' ),
        'site_values'          => __( 'Site Values', 'kotlinskidev' ),
        'cover_video_controls' => __( 'Cover Video Controls', 'kotlinskidev' ),
    ];
}

function kotlinskidev_get_enabled_features(): array {
    return (array) get_option( 'kotlinskidev_enabled_features', kotlinskidev_toggleable_feature_keys() );
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

function kotlinskidev_migrate_feature_toggles(): void {
    if ( (int) get_option( KOTLINSKIDEV_FEATURE_TOGGLES_VERSION_OPTION, 0 ) >= KOTLINSKIDEV_FEATURE_TOGGLES_VERSION ) {
        return;
    }

    $saved = get_option( 'kotlinskidev_enabled_features', false );
    if ( is_array( $saved ) ) {
        update_option(
            'kotlinskidev_enabled_features',
            array_values( array_unique( array_merge( $saved, kotlinskidev_features_added_in_version_two() ) ) )
        );
    }

    update_option( KOTLINSKIDEV_FEATURE_TOGGLES_VERSION_OPTION, KOTLINSKIDEV_FEATURE_TOGGLES_VERSION );
}
