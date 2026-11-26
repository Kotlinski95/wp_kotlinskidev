<?php
function kotlinskidev_service_location_slug_translations(): array {
    return [
        'en' => 'creating-websites',
    ];
}

function kotlinskidev_service_location_default_rewrite_base(): string {
    $post_type = get_post_type_object( 'service_location' );
    return $post_type && is_array( $post_type->rewrite ) ? sanitize_title( (string) ( $post_type->rewrite['slug'] ?? '' ) ) : '';
}

function kotlinskidev_register_service_location_translated_rewrite_rules(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    foreach ( kotlinskidev_service_location_slug_translations() as $lang => $slug ) {
        $lang = sanitize_key( $lang );
        $slug = sanitize_title( $slug );
        add_rewrite_rule( '^' . $lang . '/' . $slug . '/([^/]+)/?$', 'index.php?service_location=$matches[1]&lang=' . $lang, 'top' );
    }

    $default_lang = function_exists( 'pll_default_language' ) ? sanitize_key( (string) pll_default_language() ) : '';
    $default_base = kotlinskidev_service_location_default_rewrite_base();

    if ( '' !== $default_lang && '' !== $default_base && ! isset( kotlinskidev_service_location_slug_translations()[ $default_lang ] ) ) {
        add_rewrite_rule( '^' . $default_base . '/([^/]+)/?$', 'index.php?service_location=$matches[1]&lang=' . $default_lang, 'top' );
    }
}
add_action( 'init', 'kotlinskidev_register_service_location_translated_rewrite_rules', 20 );

function kotlinskidev_find_service_location_id_by_slug_and_language( string $slug, string $lang ): int {
    global $wpdb;

    $post_id = $wpdb->get_var( $wpdb->prepare(
        "SELECT p.ID FROM {$wpdb->posts} p
        INNER JOIN {$wpdb->term_relationships} tr ON tr.object_id = p.ID
        INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id AND tt.taxonomy = 'language'
        INNER JOIN {$wpdb->terms} t ON t.term_id = tt.term_id
        WHERE p.post_type = 'service_location' AND p.post_name = %s AND t.slug = %s
        LIMIT 1",
        $slug,
        $lang
    ) );

    return (int) $post_id;
}

function kotlinskidev_scope_service_location_query_to_language( WP_Query $query ): void {
    if ( is_admin() || ! $query->is_main_query() ) {
        return;
    }

    $slug = (string) $query->get( 'service_location' );
    $lang = sanitize_key( (string) $query->get( 'lang' ) );
    if ( '' === $slug || '' === $lang ) {
        return;
    }

    $post_id = kotlinskidev_find_service_location_id_by_slug_and_language( $slug, $lang );
    if ( $post_id <= 0 ) {
        return;
    }

    $query->set( 'p', $post_id );
    $query->set( 'service_location', '' );
    $query->set( 'name', '' );
}
add_action( 'pre_get_posts', 'kotlinskidev_scope_service_location_query_to_language', 5 );

function kotlinskidev_keep_service_location_slug_unique_per_language( string $slug, int $post_id, string $post_status, string $post_type, int $post_parent, string $original_slug ): string {
    if ( 'service_location' !== $post_type || $slug === $original_slug || ! function_exists( 'pll_get_post_language' ) ) {
        return $slug;
    }

    $lang = (string) pll_get_post_language( $post_id, 'slug' );
    if ( '' === $lang ) {
        return $slug;
    }

    $existing_id = kotlinskidev_find_service_location_id_by_slug_and_language( $original_slug, $lang );

    return ( 0 === $existing_id || $existing_id === $post_id ) ? $original_slug : $slug;
}
add_filter( 'wp_unique_post_slug', 'kotlinskidev_keep_service_location_slug_unique_per_language', 10, 6 );

function kotlinskidev_service_location_translated_post_link( string $link, WP_Post $post ): string {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return $link;
    }

    if ( 'service_location' !== $post->post_type || ! function_exists( 'pll_get_post_language' ) ) {
        return $link;
    }

    $translations = kotlinskidev_service_location_slug_translations();
    $lang         = pll_get_post_language( $post->ID );

    if ( isset( $translations[ $lang ] ) ) {
        $link = str_replace( 'tworzenie-stron-www', $translations[ $lang ], $link );
    }

    return $link;
}
add_filter( 'post_type_link', 'kotlinskidev_service_location_translated_post_link', 10, 2 );
