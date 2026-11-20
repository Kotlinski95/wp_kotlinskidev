<?php
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
