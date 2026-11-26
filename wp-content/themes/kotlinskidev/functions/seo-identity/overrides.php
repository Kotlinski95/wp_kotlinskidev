<?php
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

const KOTLINSKIDEV_SEO_IDENTITY_YOAST_SOURCE = 'Yoast SEO';

function kotlinskidev_seo_identity_yoast_override( $value ): array {
    return [ 'value' => $value, 'source' => KOTLINSKIDEV_SEO_IDENTITY_YOAST_SOURCE ];
}

function kotlinskidev_seo_identity_yoast_text( $value ): string {
    return is_scalar( $value ) ? sanitize_text_field( (string) $value ) : '';
}

function kotlinskidev_seo_identity_yoast_company_overrides( array $titles ): array {
    $overrides = [];
    $name      = kotlinskidev_seo_identity_yoast_text( $titles['company_name'] ?? '' );
    if ( '' !== $name ) {
        $overrides['org_name'] = kotlinskidev_seo_identity_yoast_override( $name );
    }
    $alternates = kotlinskidev_seo_identity_clean_list( $titles['company_alternate_name'] ?? '' );
    if ( [] !== $alternates ) {
        $overrides['org_alternate_names'] = kotlinskidev_seo_identity_yoast_override( $alternates );
    }
    $logo = absint( $titles['company_logo_id'] ?? 0 );
    if ( $logo > 0 ) {
        $overrides['logo_id'] = kotlinskidev_seo_identity_yoast_override( $logo );
    }
    return $overrides;
}

function kotlinskidev_seo_identity_yoast_person_overrides( array $titles, string $person_display_name ): array {
    $overrides = [];
    $person    = kotlinskidev_seo_identity_yoast_text( $person_display_name );
    if ( '' !== $person ) {
        $overrides['person_name'] = kotlinskidev_seo_identity_yoast_override( $person );
    }
    $image = absint( $titles['person_logo_id'] ?? 0 );
    if ( $image > 0 ) {
        $overrides['person_image_id'] = kotlinskidev_seo_identity_yoast_override( $image );
    }
    return $overrides;
}

function kotlinskidev_seo_identity_yoast_website_overrides( array $titles ): array {
    $overrides = [];
    $website   = kotlinskidev_seo_identity_yoast_text( $titles['website_name'] ?? '' );
    if ( '' !== $website ) {
        $overrides['website_name'] = kotlinskidev_seo_identity_yoast_override( $website );
    }
    $website_alternates = kotlinskidev_seo_identity_clean_list( $titles['alternate_website_name'] ?? '' );
    if ( [] !== $website_alternates ) {
        $overrides['website_alternate_names'] = kotlinskidev_seo_identity_yoast_override( $website_alternates );
    }
    return $overrides;
}

function kotlinskidev_seo_identity_yoast_social_overrides( array $social, array $own_social_profiles ): array {
    $yoast_urls = kotlinskidev_seo_identity_clean_urls( kotlinskidev_seo_identity_yoast_social_urls( $social ) );
    if ( [] === $yoast_urls ) {
        return [];
    }
    $merged = kotlinskidev_seo_identity_clean_urls( array_merge( $yoast_urls, array_values( array_filter( $own_social_profiles, 'is_string' ) ) ) );
    return [ 'social_profiles' => kotlinskidev_seo_identity_yoast_override( $merged ) ];
}

function kotlinskidev_seo_identity_yoast_overrides( array $titles, array $social, string $person_display_name, array $own_social_profiles ): array
{
    $mode = isset( $titles['company_or_person'] ) && is_scalar( $titles['company_or_person'] ) ? (string) $titles['company_or_person'] : '';

    $overrides = [];
    if ( 'company' === $mode ) {
        $overrides = array_merge( $overrides, kotlinskidev_seo_identity_yoast_company_overrides( $titles ) );
    }
    if ( 'person' === $mode ) {
        $overrides = array_merge( $overrides, kotlinskidev_seo_identity_yoast_person_overrides( $titles, $person_display_name ) );
    }

    return array_merge(
        $overrides,
        kotlinskidev_seo_identity_yoast_website_overrides( $titles ),
        kotlinskidev_seo_identity_yoast_social_overrides( $social, $own_social_profiles )
    );
}

function kotlinskidev_seo_identity_yoast_person_display_name( array $titles ): string {
    $user_id = absint( $titles['company_or_person_user_id'] ?? 0 );
    if ( 'person' !== ( $titles['company_or_person'] ?? '' ) || $user_id <= 0 ) {
        return '';
    }
    $user = get_userdata( $user_id );
    return is_object( $user ) && isset( $user->display_name ) ? (string) $user->display_name : '';
}

function kotlinskidev_seo_identity_external_overrides(): array
{
    $titles = get_option( 'wpseo_titles', [] );
    $social = get_option( 'wpseo_social', [] );
    $titles = is_array( $titles ) ? $titles : [];
    $social = is_array( $social ) ? $social : [];

    $overrides = [];
    if ( defined( 'WPSEO_VERSION' ) || [] !== $titles || [] !== $social ) {
        $own       = kotlinskidev_get_seo_identity()['social_profiles'] ?? [];
        $overrides = kotlinskidev_seo_identity_yoast_overrides(
            $titles,
            $social,
            kotlinskidev_seo_identity_yoast_person_display_name( $titles ),
            is_array( $own ) ? $own : []
        );
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
