<?php
function kotlinskidev_schema_postal_address( array $identity ): array {
    $address = [
        '@type'           => 'PostalAddress',
        'addressLocality' => (string) $identity['address_locality'],
    ];
    if ( '' !== (string) $identity['address_region'] ) {
        $address['addressRegion'] = (string) $identity['address_region'];
    }
    $address['addressCountry'] = (string) $identity['address_country'];
    return $address;
}

function kotlinskidev_schema_image_object( string $id, array $image, string $caption ): array {
    return [
        '@type'      => 'ImageObject',
        '@id'        => $id,
        'url'        => $image['url'],
        'contentUrl' => $image['url'],
        'width'      => (int) $image['width'],
        'height'     => (int) $image['height'],
        'caption'    => $caption,
    ];
}

function kotlinskidev_schema_contact_point( array $context, array $identity, string $contact_url ): array {
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
    return $contact_point;
}

function kotlinskidev_schema_organization_base_node( array $context, array $ids, array $identity ): array {
    $node = [
        '@type'         => 'ProfessionalService',
        '@id'           => $ids['organization'],
        'name'          => (string) $identity['org_name'],
        'alternateName' => array_values( (array) $identity['org_alternate_names'] ),
        'url'           => (string) $context['root_url'],
        'address'       => kotlinskidev_schema_postal_address( $identity ),
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
    return $node;
}

function kotlinskidev_schema_organization_node( array $context, array $ids ): array {
    $identity = kotlinskidev_schema_identity( $context );
    $node     = kotlinskidev_schema_organization_base_node( $context, $ids, $identity );
    $logo     = (array) ( $context['logo'] ?? [] );
    if ( [] !== $logo ) {
        $node['logo']  = kotlinskidev_schema_image_object( $ids['logo'], $logo, (string) $identity['org_name'] );
        $node['image'] = [ '@id' => $ids['logo'] ];
    }
    $contact_url = (string) ( $context['contact_url'] ?? '' );
    if ( '' !== $contact_url ) {
        $node['contactPoint'] = kotlinskidev_schema_contact_point( $context, $identity, $contact_url );
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
        $node['image'] = kotlinskidev_schema_image_object(
            $ids['person_image'] ?? $ids['person'] . '/image',
            $person_image,
            (string) $identity['person_name']
        );
    } elseif ( [] !== (array) ( $context['logo'] ?? [] ) ) {
        $node['image'] = [ '@id' => $ids['logo'] ];
    }
    return $node;
}
