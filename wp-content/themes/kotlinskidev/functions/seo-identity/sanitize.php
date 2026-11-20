<?php
function kotlinskidev_seo_identity_clean_list( $value ): array
{
    if ( is_string( $value ) ) {
        $value = preg_split( '/\r\n|\r|\n/', $value );
    }
    if ( ! is_array( $value ) ) {
        return [];
    }
    $clean = [];
    foreach ( $value as $item ) {
        if ( ! is_scalar( $item ) ) {
            continue;
        }
        $text = sanitize_text_field( (string) $item );
        if ( '' !== $text ) {
            $clean[] = $text;
        }
    }
    return array_values( array_unique( $clean ) );
}

function kotlinskidev_seo_identity_clean_urls( $value ): array
{
    $urls = [];
    foreach ( kotlinskidev_seo_identity_clean_list( $value ) as $item ) {
        $url    = esc_url_raw( $item );
        $scheme = strtolower( (string) wp_parse_url( $url, PHP_URL_SCHEME ) );
        if ( '' !== $url && in_array( $scheme, [ 'http', 'https' ], true ) ) {
            $urls[] = $url;
        }
    }
    return array_values( array_unique( $urls ) );
}

function kotlinskidev_seo_identity_clean_slugs( $value ): array
{
    if ( is_string( $value ) ) {
        $value = preg_split( '/[\r\n,\s]+/', $value );
    }
    if ( ! is_array( $value ) ) {
        return [];
    }
    $slugs = [];
    foreach ( $value as $item ) {
        $slug = is_scalar( $item ) ? sanitize_key( (string) $item ) : '';
        if ( '' !== $slug ) {
            $slugs[] = $slug;
        }
    }
    return array_values( array_unique( $slugs ) );
}

function kotlinskidev_seo_identity_clean_lang_map( $value ): array
{
    if ( ! is_array( $value ) ) {
        return [];
    }
    $map = [];
    foreach ( $value as $lang => $text ) {
        $lang = sanitize_key( (string) $lang );
        if ( '' === $lang || ! is_scalar( $text ) ) {
            continue;
        }
        $map[ $lang ] = sanitize_textarea_field( (string) $text );
    }
    return $map;
}

function kotlinskidev_seo_identity_sanitize_required_texts( array $value, array $defaults, array $clean ): array {
    foreach ( [ 'org_name', 'person_name', 'website_name' ] as $key ) {
        $text         = isset( $value[ $key ] ) && is_scalar( $value[ $key ] ) ? sanitize_text_field( (string) $value[ $key ] ) : '';
        $clean[ $key ] = '' !== $text ? $text : $defaults[ $key ];
    }
    return $clean;
}

function kotlinskidev_seo_identity_sanitize_optional_texts( array $value, array $clean ): array {
    foreach ( [ 'address_locality', 'address_region', 'area_served', 'contact_type' ] as $key ) {
        if ( isset( $value[ $key ] ) && is_scalar( $value[ $key ] ) ) {
            $clean[ $key ] = sanitize_text_field( (string) $value[ $key ] );
        }
    }
    return $clean;
}

function kotlinskidev_seo_identity_sanitize_lists( array $value, array $clean ): array {
    foreach ( [ 'org_alternate_names', 'knows_about', 'website_alternate_names' ] as $key ) {
        if ( array_key_exists( $key, $value ) ) {
            $clean[ $key ] = kotlinskidev_seo_identity_clean_list( $value[ $key ] );
        }
    }

    if ( array_key_exists( 'social_profiles', $value ) ) {
        $clean['social_profiles'] = kotlinskidev_seo_identity_clean_urls( $value['social_profiles'] );
    }

    if ( array_key_exists( 'contact_languages', $value ) ) {
        $clean['contact_languages'] = kotlinskidev_seo_identity_clean_slugs( $value['contact_languages'] );
    }

    foreach ( kotlinskidev_seo_identity_translatable_keys() as $key ) {
        if ( array_key_exists( $key, $value ) ) {
            $clean[ $key ] = kotlinskidev_seo_identity_clean_lang_map( $value[ $key ] );
        }
    }
    return $clean;
}

function kotlinskidev_seo_identity_sanitize_ids( array $value, array $clean ): array {
    foreach ( [ 'logo_id', 'person_image_id' ] as $key ) {
        if ( isset( $value[ $key ] ) && is_scalar( $value[ $key ] ) ) {
            $clean[ $key ] = absint( $value[ $key ] );
        }
    }
    return $clean;
}

function kotlinskidev_seo_identity_sanitize_country( array $value, string $default ): string {
    $country = isset( $value['address_country'] ) && is_scalar( $value['address_country'] )
        ? strtoupper( trim( sanitize_text_field( (string) $value['address_country'] ) ) )
        : '';
    return 1 === preg_match( '/^[A-Z]{2}$/', $country ) ? $country : $default;
}

function kotlinskidev_seo_identity_sanitize_page_slugs( array $value, array $defaults, array $clean ): array {
    foreach ( [ 'contact_page_slug', 'about_page_slug' ] as $key ) {
        if ( isset( $value[ $key ] ) && is_scalar( $value[ $key ] ) ) {
            $slug          = sanitize_title( (string) $value[ $key ] );
            $clean[ $key ] = '' !== $slug ? $slug : $defaults[ $key ];
        }
    }
    return $clean;
}

function kotlinskidev_sanitize_seo_identity( $value ): array
{
    $defaults = kotlinskidev_seo_identity_defaults();
    $value    = is_array( $value ) ? $value : [];

    $clean = kotlinskidev_seo_identity_sanitize_required_texts( $value, $defaults, $defaults );
    $clean = kotlinskidev_seo_identity_sanitize_optional_texts( $value, $clean );
    $clean = kotlinskidev_seo_identity_sanitize_lists( $value, $clean );
    $clean = kotlinskidev_seo_identity_sanitize_ids( $value, $clean );
    $clean['address_country'] = kotlinskidev_seo_identity_sanitize_country( $value, $defaults['address_country'] );
    $clean = kotlinskidev_seo_identity_sanitize_page_slugs( $value, $defaults, $clean );

    $clean['expose_contact'] = ! empty( $value['expose_contact'] ) && 'false' !== $value['expose_contact'] && '0' !== $value['expose_contact'];

    return array_intersect_key( $clean, $defaults );
}
