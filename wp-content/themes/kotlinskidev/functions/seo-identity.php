<?php
const KOTLINSKIDEV_SEO_IDENTITY_OPTION = 'kotlinskidev_seo_identity';
const KOTLINSKIDEV_SCHEMA_LOGO_OPTION  = 'kotlinskidev_schema_logo_id';

function kotlinskidev_seo_identity_defaults(): array
{
    return [
        'org_name'              => 'Kotlinskidev',
        'org_alternate_names'   => [ 'Kotlinskidev Web Development' ],
        'description'           => [],
        'logo_id'               => 0,
        'social_profiles'       => [
            'https://www.linkedin.com/in/adriankotlinski/',
            'https://github.com/Kotlinski95',
            'https://x.com/AdiKotlinski',
            'https://www.youtube.com/@adriankotlinski6927',
            'https://www.instagram.com/adriankotlinski',
            'https://www.facebook.com/adrian.kotlinski.9/',
        ],
        'person_name'           => 'Adrian Kotliński',
        'job_title'             => [
            'pl' => 'Programista frontend (Senior)',
            'en' => 'Senior Frontend Developer',
        ],
        'person_image_id'       => 0,
        'address_locality'      => 'Katowice',
        'address_region'        => '',
        'address_country'       => 'PL',
        'area_served'           => 'Poland',
        'knows_about'           => [
            'Web development',
            'Frontend development',
            'Next.js',
            'Angular',
            'WordPress',
            'Website performance optimization',
            'E-commerce development',
        ],
        'contact_type'          => 'customer service',
        'contact_languages'     => [ 'pl', 'en' ],
        'contact_page_slug'     => 'kontakt',
        'about_page_slug'       => 'o-mnie',
        'expose_contact'        => false,
        'website_name'          => 'Kotlinskidev',
        'website_alternate_names' => [ 'Kotlinskidev Web Development' ],
    ];
}

function kotlinskidev_seo_identity_translatable_keys(): array
{
    return [ 'description', 'job_title' ];
}

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

function kotlinskidev_sanitize_seo_identity( $value ): array
{
    $defaults = kotlinskidev_seo_identity_defaults();
    $value    = is_array( $value ) ? $value : [];
    $clean    = $defaults;

    foreach ( [ 'org_name', 'person_name', 'website_name' ] as $key ) {
        $text         = isset( $value[ $key ] ) && is_scalar( $value[ $key ] ) ? sanitize_text_field( (string) $value[ $key ] ) : '';
        $clean[ $key ] = '' !== $text ? $text : $defaults[ $key ];
    }

    foreach ( [ 'address_locality', 'address_region', 'area_served', 'contact_type' ] as $key ) {
        if ( isset( $value[ $key ] ) && is_scalar( $value[ $key ] ) ) {
            $clean[ $key ] = sanitize_text_field( (string) $value[ $key ] );
        }
    }

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

    foreach ( [ 'logo_id', 'person_image_id' ] as $key ) {
        if ( isset( $value[ $key ] ) && is_scalar( $value[ $key ] ) ) {
            $clean[ $key ] = absint( $value[ $key ] );
        }
    }

    $country = isset( $value['address_country'] ) && is_scalar( $value['address_country'] )
        ? strtoupper( trim( sanitize_text_field( (string) $value['address_country'] ) ) )
        : '';
    $clean['address_country'] = 1 === preg_match( '/^[A-Z]{2}$/', $country ) ? $country : $defaults['address_country'];

    foreach ( [ 'contact_page_slug', 'about_page_slug' ] as $key ) {
        if ( isset( $value[ $key ] ) && is_scalar( $value[ $key ] ) ) {
            $slug          = sanitize_title( (string) $value[ $key ] );
            $clean[ $key ] = '' !== $slug ? $slug : $defaults[ $key ];
        }
    }

    $clean['expose_contact'] = ! empty( $value['expose_contact'] ) && 'false' !== $value['expose_contact'] && '0' !== $value['expose_contact'];

    return array_intersect_key( $clean, $defaults );
}

function kotlinskidev_get_seo_identity( bool $reset = false ): array
{
    static $identity = null;
    if ( $reset ) {
        $identity = null;
        return [];
    }
    if ( null === $identity ) {
        $stored = get_option( KOTLINSKIDEV_SEO_IDENTITY_OPTION, [] );
        $stored = is_array( $stored ) ? $stored : [];
        $merged = array_merge( kotlinskidev_seo_identity_defaults(), array_intersect_key( $stored, kotlinskidev_seo_identity_defaults() ) );
        if ( ! array_key_exists( 'logo_id', $stored ) ) {
            $merged['logo_id'] = absint( get_option( KOTLINSKIDEV_SCHEMA_LOGO_OPTION, 0 ) );
        }
        $identity = $merged;
    }
    return $identity;
}

function kotlinskidev_seo_identity_language(): string
{
    if ( function_exists( 'pll_current_language' ) ) {
        $slug = pll_current_language();
        if ( is_string( $slug ) && '' !== $slug ) {
            return $slug;
        }
    }
    return substr( (string) get_locale(), 0, 2 );
}

function kotlinskidev_seo_identity_resolve( array $identity, string $language ): array
{
    foreach ( kotlinskidev_seo_identity_translatable_keys() as $key ) {
        $map = $identity[ $key ] ?? [];
        if ( ! is_array( $map ) ) {
            $identity[ $key ] = (string) $map;
            continue;
        }
        $text = '';
        foreach ( [ $language, 'en' ] as $candidate ) {
            if ( isset( $map[ $candidate ] ) && '' !== trim( (string) $map[ $candidate ] ) ) {
                $text = (string) $map[ $candidate ];
                break;
            }
        }
        if ( '' === $text ) {
            foreach ( $map as $candidate ) {
                if ( '' !== trim( (string) $candidate ) ) {
                    $text = (string) $candidate;
                    break;
                }
            }
        }
        $identity[ $key ] = $text;
    }
    return $identity;
}

function kotlinskidev_seo_identity_overridable_keys(): array
{
    return [
        'org_name',
        'org_alternate_names',
        'logo_id',
        'person_name',
        'person_image_id',
        'website_name',
        'website_alternate_names',
        'social_profiles',
    ];
}

function kotlinskidev_seo_identity_yoast_social_urls( array $social ): array
{
    $urls = [];
    foreach ( [ 'facebook_site', 'twitter_site', 'instagram_url', 'linkedin_url', 'youtube_url', 'pinterest_url', 'mastodon_url' ] as $field ) {
        $value = isset( $social[ $field ] ) && is_scalar( $social[ $field ] ) ? trim( (string) $social[ $field ] ) : '';
        if ( '' === $value ) {
            continue;
        }
        if ( 'twitter_site' === $field && 1 !== preg_match( '#^https?://#i', $value ) ) {
            $value = 'https://x.com/' . ltrim( $value, '@' );
        }
        $urls[] = $value;
    }
    $other = isset( $social['other_social_urls'] ) && is_array( $social['other_social_urls'] ) ? $social['other_social_urls'] : [];
    return array_merge( $urls, $other );
}

function kotlinskidev_seo_identity_yoast_overrides( array $titles, array $social, string $person_display_name, array $own_social_profiles ): array
{
    $source    = 'Yoast SEO';
    $overrides = [];
    $mode      = isset( $titles['company_or_person'] ) && is_scalar( $titles['company_or_person'] ) ? (string) $titles['company_or_person'] : '';

    $text = static function ( $value ): string {
        return is_scalar( $value ) ? sanitize_text_field( (string) $value ) : '';
    };

    if ( 'company' === $mode ) {
        $name = $text( $titles['company_name'] ?? '' );
        if ( '' !== $name ) {
            $overrides['org_name'] = [ 'value' => $name, 'source' => $source ];
        }
        $alternates = kotlinskidev_seo_identity_clean_list( $titles['company_alternate_name'] ?? '' );
        if ( [] !== $alternates ) {
            $overrides['org_alternate_names'] = [ 'value' => $alternates, 'source' => $source ];
        }
        $logo = absint( $titles['company_logo_id'] ?? 0 );
        if ( $logo > 0 ) {
            $overrides['logo_id'] = [ 'value' => $logo, 'source' => $source ];
        }
    }

    if ( 'person' === $mode ) {
        $person = $text( $person_display_name );
        if ( '' !== $person ) {
            $overrides['person_name'] = [ 'value' => $person, 'source' => $source ];
        }
        $image = absint( $titles['person_logo_id'] ?? 0 );
        if ( $image > 0 ) {
            $overrides['person_image_id'] = [ 'value' => $image, 'source' => $source ];
        }
    }

    $website = $text( $titles['website_name'] ?? '' );
    if ( '' !== $website ) {
        $overrides['website_name'] = [ 'value' => $website, 'source' => $source ];
    }
    $website_alternates = kotlinskidev_seo_identity_clean_list( $titles['alternate_website_name'] ?? '' );
    if ( [] !== $website_alternates ) {
        $overrides['website_alternate_names'] = [ 'value' => $website_alternates, 'source' => $source ];
    }

    $yoast_urls = kotlinskidev_seo_identity_clean_urls( kotlinskidev_seo_identity_yoast_social_urls( $social ) );
    if ( [] !== $yoast_urls ) {
        $merged = kotlinskidev_seo_identity_clean_urls( array_merge( $yoast_urls, array_values( array_filter( $own_social_profiles, 'is_string' ) ) ) );
        $overrides['social_profiles'] = [ 'value' => $merged, 'source' => $source ];
    }

    return $overrides;
}

function kotlinskidev_seo_identity_external_overrides(): array
{
    $titles = get_option( 'wpseo_titles', [] );
    $social = get_option( 'wpseo_social', [] );
    $titles = is_array( $titles ) ? $titles : [];
    $social = is_array( $social ) ? $social : [];

    $overrides = [];
    if ( defined( 'WPSEO_VERSION' ) || [] !== $titles || [] !== $social ) {
        $person_name = '';
        $user_id     = absint( $titles['company_or_person_user_id'] ?? 0 );
        if ( 'person' === ( $titles['company_or_person'] ?? '' ) && $user_id > 0 ) {
            $user        = get_userdata( $user_id );
            $person_name = is_object( $user ) && isset( $user->display_name ) ? (string) $user->display_name : '';
        }
        $own       = kotlinskidev_get_seo_identity()['social_profiles'] ?? [];
        $overrides = kotlinskidev_seo_identity_yoast_overrides( $titles, $social, $person_name, is_array( $own ) ? $own : [] );
    }

    $filtered = apply_filters( 'kotlinskidev_seo_identity_external_overrides', $overrides );
    return is_array( $filtered ) ? $filtered : $overrides;
}

function kotlinskidev_apply_seo_identity_overrides( array $identity, array $overrides ): array
{
    foreach ( $overrides as $key => $override ) {
        if ( is_array( $override ) && array_key_exists( 'value', $override ) && array_key_exists( $key, $identity ) ) {
            $identity[ $key ] = $override['value'];
        }
    }
    return $identity;
}

function kotlinskidev_get_effective_seo_identity(): array
{
    return kotlinskidev_apply_seo_identity_overrides( kotlinskidev_get_seo_identity(), kotlinskidev_seo_identity_external_overrides() );
}

function kotlinskidev_seo_identity( string $key, ?string $language = null )
{
    $resolved = kotlinskidev_seo_identity_resolve(
        kotlinskidev_get_effective_seo_identity(),
        $language ?? kotlinskidev_seo_identity_language()
    );
    return $resolved[ $key ] ?? null;
}
