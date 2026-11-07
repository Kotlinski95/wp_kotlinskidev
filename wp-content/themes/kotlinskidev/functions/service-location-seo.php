<?php
function kotlinskidev_service_location_is_ready( array $fields ): bool {
    if ( '' === trim( (string) ( $fields['local_intro'] ?? '' ) ) ) {
        return false;
    }

    foreach ( [ 'local_audience', 'local_distance' ] as $key ) {
        if ( '' !== trim( (string) ( $fields[ $key ] ?? '' ) ) ) {
            return true;
        }
    }

    foreach ( [ 'local_faq', 'featured_projects' ] as $key ) {
        if ( ! empty( $fields[ $key ] ) && is_array( $fields[ $key ] ) ) {
            return true;
        }
    }

    return false;
}

function kotlinskidev_service_location_post_is_ready( int $post_id ): bool {
    return kotlinskidev_service_location_is_ready( kotlinskidev_get_service_location_local_fields( $post_id ) );
}

function kotlinskidev_service_location_is_thin_published( int $post_id ): bool {
    return $post_id > 0
        && 'publish' === get_post_status( $post_id )
        && ! kotlinskidev_service_location_post_is_ready( $post_id );
}

function kotlinskidev_service_location_filter_robots( array $robots ): array {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) || ! is_singular( 'service_location' ) ) {
        return $robots;
    }

    if ( ! kotlinskidev_service_location_is_thin_published( (int) get_queried_object_id() ) ) {
        return $robots;
    }

    unset( $robots['index'] );
    $robots['noindex'] = true;
    $robots['follow']  = true;

    return $robots;
}
add_filter( 'wp_robots', 'kotlinskidev_service_location_filter_robots', 20 );

function kotlinskidev_service_location_filter_yoast_robots( $robots ) {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) || ! is_singular( 'service_location' ) ) {
        return $robots;
    }

    if ( ! kotlinskidev_service_location_is_thin_published( (int) get_queried_object_id() ) ) {
        return $robots;
    }

    return 'noindex, follow';
}
add_filter( 'wpseo_robots', 'kotlinskidev_service_location_filter_yoast_robots', 20 );

function kotlinskidev_service_location_thin_published_ids(): array {
    $ids = get_posts( [
        'post_type'        => 'service_location',
        'post_status'      => 'publish',
        'posts_per_page'   => -1,
        'fields'           => 'ids',
        'lang'             => '',
        'suppress_filters' => false,
    ] );

    return array_values( array_filter( array_map( 'intval', (array) $ids ), 'kotlinskidev_service_location_is_thin_published' ) );
}

function kotlinskidev_service_location_exclude_from_sitemap( $excluded ): array {
    $excluded = is_array( $excluded ) ? $excluded : [];

    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return $excluded;
    }

    return array_values( array_unique( array_merge( $excluded, kotlinskidev_service_location_thin_published_ids() ) ) );
}
add_filter( 'wpseo_exclude_from_sitemap_by_post_ids', 'kotlinskidev_service_location_exclude_from_sitemap' );

function kotlinskidev_service_location_schema_language( int $post_id ): string {
    if ( function_exists( 'pll_get_post_language' ) ) {
        $lang = pll_get_post_language( $post_id );
        if ( is_string( $lang ) && '' !== $lang ) {
            return $lang;
        }
    }

    return substr( (string) get_locale(), 0, 2 );
}

function kotlinskidev_service_location_filter_schema( array $schema, int $post_id ): array {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return $schema;
    }

    $fields = kotlinskidev_get_service_location_local_fields( $post_id );
    if ( ! kotlinskidev_service_location_is_ready( $fields ) ) {
        return [];
    }

    $city = trim( (string) get_post_meta( $post_id, 'city', true ) );

    $schema['description'] = $fields['local_intro'];
    $schema['inLanguage']  = kotlinskidev_service_location_schema_language( $post_id );

    if ( '' !== $city ) {
        $schema['areaServed'] = [
            '@type'   => 'City',
            'name'    => $city,
            'address' => [
                '@type'          => 'PostalAddress',
                'addressCountry' => 'PL',
            ],
        ];
    }

    return $schema;
}
add_filter( 'kotlinskidev_service_location_schema', 'kotlinskidev_service_location_filter_schema', 10, 2 );

function kotlinskidev_service_location_columns( array $columns ): array {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return $columns;
    }

    $columns['kotlinskidev_local_content'] = __( 'Local content', 'kotlinskidev' );

    return $columns;
}
add_filter( 'manage_service_location_posts_columns', 'kotlinskidev_service_location_columns' );

function kotlinskidev_service_location_column_label( bool $ready ): string {
    return $ready ? __( 'Ready', 'kotlinskidev' ) : __( 'Needs content', 'kotlinskidev' );
}

function kotlinskidev_service_location_render_column( string $column, int $post_id ): void {
    if ( 'kotlinskidev_local_content' !== $column ) {
        return;
    }

    $ready = kotlinskidev_service_location_post_is_ready( $post_id );
    $color = $ready ? '#00a32a' : '#d63638';

    echo '<strong style="color:' . esc_attr( $color ) . '">' . esc_html( kotlinskidev_service_location_column_label( $ready ) ) . '</strong>';
}
add_action( 'manage_service_location_posts_custom_column', 'kotlinskidev_service_location_render_column', 10, 2 );
