<?php
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

function kotlinskidev_schema_node_ids( string $root ): array {
    return [
        'website'      => $root . '#website',
        'organization' => $root . '#organization',
        'person'       => $root . '#/schema/person/adrian-kotlinski',
        'logo'         => $root . '#logo',
    ];
}

function kotlinskidev_schema_partition_graph( array $graph, array $ids ): array {
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
    return [ 'kept' => $kept, 'website' => $website, 'id_map' => $id_map, 'author_map' => $author_map ];
}

function kotlinskidev_schema_normalise_node( array $node, array $id_map, array $author_map ): array {
    foreach ( [ 'author', 'creator' ] as $person_key ) {
        $reference = $node[ $person_key ]['@id'] ?? null;
        if ( is_string( $reference ) && isset( $author_map[ $reference ] ) ) {
            $node[ $person_key ] = [ '@id' => $author_map[ $reference ] ];
        }
    }
    return kotlinskidev_schema_replace_references( $node, $id_map );
}

function kotlinskidev_schema_website_node( array $website, array $context, array $ids, array $id_map ): array {
    $root     = trailingslashit( (string) $context['root_url'] );
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
    return $website;
}

function kotlinskidev_seo_consolidate_schema_graph( array $graph, array $context ): array {
    $root      = trailingslashit( (string) $context['root_url'] );
    $ids       = kotlinskidev_schema_node_ids( $root );
    $partition = kotlinskidev_schema_partition_graph( $graph, $ids );

    $normalised = [];
    foreach ( $partition['kept'] as $node ) {
        $normalised[] = is_array( $node )
            ? kotlinskidev_schema_normalise_node( $node, $partition['id_map'], $partition['author_map'] )
            : $node;
    }

    $normalised[] = kotlinskidev_schema_website_node( $partition['website'], $context, $ids, $partition['id_map'] );
    $normalised[] = kotlinskidev_schema_organization_node( $context, $ids );
    $normalised[] = kotlinskidev_schema_person_node( $context, $ids );

    return kotlinskidev_schema_dedupe_nodes( $normalised );
}
