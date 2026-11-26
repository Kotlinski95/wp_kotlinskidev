<?php
const KOTLINSKIDEV_SCHEMA_SITE_ICON_SIZE = 512;
const KOTLINSKIDEV_SCHEMA_LOGO_MIN_SIZE  = 112;

function kotlinskidev_schema_social_profiles(): array {
    $profiles = array_values( array_filter( (array) kotlinskidev_get_effective_seo_identity()['social_profiles'], 'is_string' ) );
    $filtered = apply_filters( 'kotlinskidev_schema_social_profiles', $profiles );
    return is_array( $filtered ) ? array_values( array_filter( $filtered, 'is_string' ) ) : $profiles;
}

function kotlinskidev_schema_current_language(): string {
    return kotlinskidev_seo_identity_language();
}

function kotlinskidev_schema_root_url(): string {
    $root = function_exists( 'pll_default_language' ) && function_exists( 'pll_home_url' )
        ? (string) pll_home_url( (string) pll_default_language() )
        : home_url( '/' );
    return trailingslashit( '' !== $root ? $root : home_url( '/' ) );
}

function kotlinskidev_schema_page_url( string $default_language_slug, string $language ): string {
    $page = get_page_by_path( $default_language_slug );
    if ( ! $page instanceof WP_Post ) {
        return '';
    }
    $page_id = (int) $page->ID;
    if ( function_exists( 'pll_get_post' ) ) {
        $translated = (int) pll_get_post( $page_id, $language );
        if ( $translated > 0 ) {
            $page_id = $translated;
        }
    }
    $url = get_permalink( $page_id );
    return is_string( $url ) ? $url : '';
}

function kotlinskidev_schema_attachment_image_data( int $image_id ): array {
    if ( $image_id <= 0 ) {
        return [];
    }
    $src = wp_get_attachment_image_src( $image_id, 'full' );
    if ( ! is_array( $src ) || empty( $src[0] ) ) {
        return [];
    }
    return [ 'url' => (string) $src[0], 'width' => (int) $src[1], 'height' => (int) $src[2] ];
}

function kotlinskidev_schema_site_icon_logo(): array {
    $icon = get_site_icon_url( KOTLINSKIDEV_SCHEMA_SITE_ICON_SIZE );
    if ( ! is_string( $icon ) || '' === $icon ) {
        return [];
    }
    return [ 'url' => $icon, 'width' => KOTLINSKIDEV_SCHEMA_SITE_ICON_SIZE, 'height' => KOTLINSKIDEV_SCHEMA_SITE_ICON_SIZE ];
}

function kotlinskidev_schema_logo_is_valid( array $logo ): bool {
    $path = (string) wp_parse_url( (string) ( $logo['url'] ?? '' ), PHP_URL_PATH );
    return '' !== $path
        && 'svg' !== strtolower( pathinfo( $path, PATHINFO_EXTENSION ) )
        && (int) ( $logo['width'] ?? 0 ) >= KOTLINSKIDEV_SCHEMA_LOGO_MIN_SIZE
        && (int) ( $logo['height'] ?? 0 ) >= KOTLINSKIDEV_SCHEMA_LOGO_MIN_SIZE;
}

function kotlinskidev_schema_logo_data( string $root_url ): array {
    $logo = kotlinskidev_schema_attachment_image_data( (int) kotlinskidev_get_effective_seo_identity()['logo_id'] );
    if ( [] === $logo ) {
        $logo = kotlinskidev_schema_site_icon_logo();
    }
    $filtered = apply_filters( 'kotlinskidev_schema_logo', $logo );
    $logo     = is_array( $filtered ) ? $filtered : $logo;
    return kotlinskidev_schema_logo_is_valid( $logo ) ? $logo : [];
}

function kotlinskidev_schema_person_image_data( int $image_id ): array {
    return kotlinskidev_schema_attachment_image_data( $image_id );
}

function kotlinskidev_schema_identity( array $context ): array {
    return (array) ( $context['identity'] ?? kotlinskidev_seo_identity_resolve( kotlinskidev_seo_identity_defaults(), (string) ( $context['language'] ?? 'en' ) ) );
}

function kotlinskidev_schema_site_description( string $language ): string {
    $tagline = trim( (string) get_bloginfo( 'description' ) );
    if ( '' === $tagline ) {
        return '';
    }
    if ( 'en' === $language ) {
        return $tagline;
    }
    $translated = function_exists( 'pll__' ) ? trim( (string) pll__( $tagline ) ) : $tagline;
    return $translated !== $tagline ? $translated : '';
}

function kotlinskidev_schema_current_city(): string {
    if ( ! is_singular( 'service_location' ) ) {
        return '';
    }
    return trim( (string) get_post_meta( (int) get_queried_object_id(), 'city', true ) );
}

function kotlinskidev_schema_exposed_contact_details(): array {
    $details = [];
    $contact = kotlinskidev_get_contact_info();
    if ( '' !== trim( (string) ( $contact['email'] ?? '' ) ) ) {
        $details['contact_email'] = trim( (string) $contact['email'] );
    }
    if ( '' !== trim( (string) ( $contact['phone'] ?? '' ) ) ) {
        $details['contact_phone'] = trim( (string) $contact['phone'] );
    }
    return $details;
}

function kotlinskidev_schema_build_context(): array {
    $language = kotlinskidev_schema_current_language();
    $root_url = kotlinskidev_schema_root_url();
    $raw      = kotlinskidev_get_effective_seo_identity();
    $identity = kotlinskidev_seo_identity_resolve( $raw, $language );
    $context = [
        'language'    => $language,
        'identity'    => $identity,
        'person_image' => kotlinskidev_schema_person_image_data( (int) $raw['person_image_id'] ),
        'locale'      => str_replace( '_', '-', (string) get_locale() ),
        'root_url'    => $root_url,
        'logo'        => kotlinskidev_schema_logo_data( $root_url ),
        'social'      => kotlinskidev_schema_social_profiles(),
        'description' => kotlinskidev_schema_site_description( $language ),
        'contact_url' => kotlinskidev_schema_page_url( (string) $identity['contact_page_slug'], $language ),
        'about_url'   => kotlinskidev_schema_page_url( (string) $identity['about_page_slug'], $language ),
        'city'        => kotlinskidev_schema_current_city(),
    ];
    if ( ! empty( $identity['expose_contact'] ) ) {
        $context = array_merge( $context, kotlinskidev_schema_exposed_contact_details() );
    }
    return $context;
}
