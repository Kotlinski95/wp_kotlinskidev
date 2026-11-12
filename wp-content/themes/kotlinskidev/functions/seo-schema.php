<?php
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

function kotlinskidev_schema_logo_data( string $root_url ): array {
    $logo     = [];
    $image_id = (int) kotlinskidev_get_effective_seo_identity()['logo_id'];
    if ( $image_id > 0 ) {
        $src = wp_get_attachment_image_src( $image_id, 'full' );
        if ( is_array( $src ) && ! empty( $src[0] ) ) {
            $logo = [ 'url' => (string) $src[0], 'width' => (int) $src[1], 'height' => (int) $src[2] ];
        }
    }
    if ( [] === $logo ) {
        $icon = get_site_icon_url( 512 );
        if ( is_string( $icon ) && '' !== $icon ) {
            $logo = [ 'url' => $icon, 'width' => 512, 'height' => 512 ];
        }
    }
    $filtered = apply_filters( 'kotlinskidev_schema_logo', $logo );
    $logo     = is_array( $filtered ) ? $filtered : $logo;
    $path     = (string) wp_parse_url( (string) ( $logo['url'] ?? '' ), PHP_URL_PATH );
    $valid    = '' !== $path
        && 'svg' !== strtolower( pathinfo( $path, PATHINFO_EXTENSION ) )
        && (int) ( $logo['width'] ?? 0 ) >= 112
        && (int) ( $logo['height'] ?? 0 ) >= 112;
    return $valid ? $logo : [];
}

function kotlinskidev_schema_person_image_data( int $image_id ): array {
    if ( $image_id <= 0 ) {
        return [];
    }
    $src = wp_get_attachment_image_src( $image_id, 'full' );
    if ( ! is_array( $src ) || empty( $src[0] ) ) {
        return [];
    }
    return [ 'url' => (string) $src[0], 'width' => (int) $src[1], 'height' => (int) $src[2] ];
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

function kotlinskidev_schema_build_context(): array {
    $language = kotlinskidev_schema_current_language();
    $root_url = kotlinskidev_schema_root_url();
    $raw      = kotlinskidev_get_effective_seo_identity();
    $identity = kotlinskidev_seo_identity_resolve( $raw, $language );
    $city     = '';
    if ( is_singular( 'service_location' ) ) {
        $city = trim( (string) get_post_meta( (int) get_queried_object_id(), 'city', true ) );
    }
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
        'city'        => $city,
    ];
    if ( ! empty( $identity['expose_contact'] ) ) {
        $contact = kotlinskidev_get_contact_info();
        if ( '' !== trim( (string) ( $contact['email'] ?? '' ) ) ) {
            $context['contact_email'] = trim( (string) $contact['email'] );
        }
        if ( '' !== trim( (string) ( $contact['phone'] ?? '' ) ) ) {
            $context['contact_phone'] = trim( (string) $contact['phone'] );
        }
    }
    return $context;
}

function kotlinskidev_schema_replace_references( $value, array $id_map ) {
    if ( ! is_array( $value ) ) {
        return $value;
    }
    foreach ( $value as $key => $child ) {
        if ( '@id' === $key && is_string( $child ) && isset( $id_map[ $child ] ) ) {
            $value[ $key ] = $id_map[ $child ];
        } elseif ( is_array( $child ) ) {
            $value[ $key ] = kotlinskidev_schema_replace_references( $child, $id_map );
        }
    }
    return $value;
}

function kotlinskidev_schema_node_types( array $node ): array {
    return array_map( 'strval', (array) ( $node['@type'] ?? [] ) );
}

function kotlinskidev_schema_is_representation_node( array $node, string $person_id ): bool {
    $id = (string) ( $node['@id'] ?? '' );
    if ( $id === $person_id ) {
        return false;
    }
    if ( str_contains( $id, '#/schema/person/' ) ) {
        return true;
    }
    return str_contains( $id, '#/schema/organization/' );
}

function kotlinskidev_schema_dedupe_nodes( array $graph ): array {
    $seen   = [];
    $result = [];
    foreach ( $graph as $node ) {
        $id = is_array( $node ) ? ( $node['@id'] ?? null ) : null;
        if ( is_string( $id ) ) {
            if ( isset( $seen[ $id ] ) ) {
                continue;
            }
            $seen[ $id ] = true;
        }
        $result[] = $node;
    }
    return $result;
}

function kotlinskidev_schema_organization_node( array $context, array $ids ): array {
    $root     = (string) $context['root_url'];
    $identity = kotlinskidev_schema_identity( $context );
    $address  = [
        '@type'           => 'PostalAddress',
        'addressLocality' => (string) $identity['address_locality'],
    ];
    if ( '' !== (string) $identity['address_region'] ) {
        $address['addressRegion'] = (string) $identity['address_region'];
    }
    $address['addressCountry'] = (string) $identity['address_country'];
    $node = [
        '@type'         => 'ProfessionalService',
        '@id'           => $ids['organization'],
        'name'          => (string) $identity['org_name'],
        'alternateName' => array_values( (array) $identity['org_alternate_names'] ),
        'url'           => $root,
        'address'       => $address,
        'areaServed'    => [ '@type' => 'Country', 'name' => (string) $identity['area_served'] ],
        'knowsAbout'    => array_values( (array) $identity['knows_about'] ),
        'founder'       => [ '@id' => $ids['person'] ],
        'sameAs'        => array_values( (array) $context['social'] ),
    ];
    if ( [] === $node['alternateName'] ) {
        unset( $node['alternateName'] );
    }
    if ( [] === $node['knowsAbout'] ) {
        unset( $node['knowsAbout'] );
    }
    if ( '' === (string) $identity['area_served'] ) {
        unset( $node['areaServed'] );
    }
    if ( '' !== (string) $identity['description'] ) {
        $node['description'] = (string) $identity['description'];
    }
    $logo = (array) ( $context['logo'] ?? [] );
    if ( [] !== $logo ) {
        $node['logo']  = [
            '@type'      => 'ImageObject',
            '@id'        => $ids['logo'],
            'url'        => $logo['url'],
            'contentUrl' => $logo['url'],
            'width'      => (int) $logo['width'],
            'height'     => (int) $logo['height'],
            'caption'    => (string) $identity['org_name'],
        ];
        $node['image'] = [ '@id' => $ids['logo'] ];
    }
    $contact_url = (string) ( $context['contact_url'] ?? '' );
    if ( '' !== $contact_url ) {
        $contact_point = [
            '@type'             => 'ContactPoint',
            'contactType'       => (string) $identity['contact_type'],
            'url'               => $contact_url,
            'availableLanguage' => array_values( (array) $identity['contact_languages'] ),
        ];
        foreach ( [ 'contact_email' => 'email', 'contact_phone' => 'telephone' ] as $context_key => $schema_key ) {
            $value = (string) ( $context[ $context_key ] ?? '' );
            if ( '' !== $value ) {
                $contact_point[ $schema_key ] = $value;
            }
        }
        $node['contactPoint'] = $contact_point;
    }
    $city = (string) ( $context['city'] ?? '' );
    if ( '' !== $city ) {
        $cities = [ '@type' => 'City', 'name' => $city ];
        $node['areaServed'] = isset( $node['areaServed'] ) ? [ $node['areaServed'], $cities ] : $cities;
    }
    return $node;
}

function kotlinskidev_schema_person_node( array $context, array $ids ): array {
    $identity = kotlinskidev_schema_identity( $context );
    $node     = [
        '@type'    => 'Person',
        '@id'      => $ids['person'],
        'name'     => (string) $identity['person_name'],
        'jobTitle' => (string) $identity['job_title'],
        'worksFor' => [ '@id' => $ids['organization'] ],
        'sameAs'   => array_values( (array) $context['social'] ),
    ];
    if ( '' === $node['jobTitle'] ) {
        unset( $node['jobTitle'] );
    }
    $about_url = (string) ( $context['about_url'] ?? '' );
    if ( '' !== $about_url ) {
        $node['url'] = $about_url;
    }
    $person_image = (array) ( $context['person_image'] ?? [] );
    if ( [] !== $person_image ) {
        $node['image'] = [
            '@type'      => 'ImageObject',
            '@id'        => $ids['person_image'] ?? $ids['person'] . '/image',
            'url'        => $person_image['url'],
            'contentUrl' => $person_image['url'],
            'width'      => (int) $person_image['width'],
            'height'     => (int) $person_image['height'],
            'caption'    => (string) $identity['person_name'],
        ];
    } elseif ( [] !== (array) ( $context['logo'] ?? [] ) ) {
        $node['image'] = [ '@id' => $ids['logo'] ];
    }
    return $node;
}

function kotlinskidev_seo_consolidate_schema_graph( array $graph, array $context ): array {
    $root = trailingslashit( (string) $context['root_url'] );
    $ids  = [
        'website'      => $root . '#website',
        'organization' => $root . '#organization',
        'person'       => $root . '#/schema/person/adrian-kotlinski',
        'logo'         => $root . '#logo',
    ];

    $id_map     = [];
    $author_map = [];
    $website    = [];
    $kept       = [];
    foreach ( $graph as $node ) {
        if ( ! is_array( $node ) ) {
            $kept[] = $node;
            continue;
        }
        $id = (string) ( $node['@id'] ?? '' );
        if ( in_array( 'WebSite', kotlinskidev_schema_node_types( $node ), true ) ) {
            $website = $node;
            if ( '' !== $id ) {
                $id_map[ $id ] = $ids['website'];
            }
            continue;
        }
        if ( kotlinskidev_schema_is_representation_node( $node, $ids['person'] ) ) {
            $id_map[ $id ]     = $ids['organization'];
            $author_map[ $id ] = $ids['person'];
            continue;
        }
        $kept[] = $node;
    }

    $normalised = [];
    foreach ( $kept as $node ) {
        if ( is_array( $node ) ) {
            foreach ( [ 'author', 'creator' ] as $person_key ) {
                $reference = $node[ $person_key ]['@id'] ?? null;
                if ( is_string( $reference ) && isset( $author_map[ $reference ] ) ) {
                    $node[ $person_key ] = [ '@id' => $author_map[ $reference ] ];
                }
            }
            $node = kotlinskidev_schema_replace_references( $node, $id_map );
        }
        $normalised[] = $node;
    }

    $identity = kotlinskidev_schema_identity( $context );
    $website = array_merge(
        $website,
        [
            '@type'         => 'WebSite',
            '@id'           => $ids['website'],
            'url'           => $root,
            'name'          => (string) $identity['website_name'],
            'alternateName' => array_values( (array) $identity['website_alternate_names'] ),
            'inLanguage'    => (string) $context['locale'],
            'publisher'     => [ '@id' => $ids['organization'] ],
        ]
    );
    if ( [] === $website['alternateName'] ) {
        unset( $website['alternateName'] );
    }
    $description = '' !== (string) $identity['description'] ? (string) $identity['description'] : (string) ( $context['description'] ?? '' );
    if ( '' !== $description ) {
        $website['description'] = $description;
    } else {
        unset( $website['description'] );
    }
    if ( isset( $website['potentialAction'] ) && is_array( $website['potentialAction'] ) ) {
        $website['potentialAction'] = kotlinskidev_schema_replace_references( $website['potentialAction'], $id_map );
    }

    $normalised[] = $website;
    $normalised[] = kotlinskidev_schema_organization_node( $context, $ids );
    $normalised[] = kotlinskidev_schema_person_node( $context, $ids );

    return kotlinskidev_schema_dedupe_nodes( $normalised );
}

function kotlinskidev_seo_schema_graph_filter( $graph, $yoast_context = null ) {
    if ( ! kotlinskidev_feature_enabled( 'custom_seo' ) || ! is_array( $graph ) ) {
        return $graph;
    }
    return kotlinskidev_seo_consolidate_schema_graph( $graph, kotlinskidev_schema_build_context() );
}
add_filter( 'wpseo_schema_graph', 'kotlinskidev_seo_schema_graph_filter', 30, 2 );

function kotlinskidev_hreflang_add_x_default( $hreflangs ) {
    if ( ! kotlinskidev_feature_enabled( 'custom_seo' ) || ! is_array( $hreflangs ) || ! function_exists( 'pll_default_language' ) ) {
        return $hreflangs;
    }
    foreach ( array_keys( $hreflangs ) as $code ) {
        if ( 'x-default' === strtolower( (string) $code ) ) {
            return $hreflangs;
        }
    }
    $default = strtolower( (string) pll_default_language() );
    foreach ( $hreflangs as $code => $url ) {
        $prefix = strtolower( (string) strtok( str_replace( '_', '-', (string) $code ), '-' ) );
        if ( $prefix === $default && is_string( $url ) && '' !== $url ) {
            $hreflangs['x-default'] = $url;
            break;
        }
    }
    return $hreflangs;
}
add_filter( 'pll_rel_hreflang_attributes', 'kotlinskidev_hreflang_add_x_default' );
