<?php
function kotlinskidev_offer_references( string $content ): array {
	if ( false === strpos( $content, 'data-kt-offer' ) ) {
		return [];
	}
	preg_match_all( '#<span\b[^>]*\bdata-kt-offer="([^"]*)"[^>]*>#', $content, $matches, PREG_SET_ORDER );
	$references = [];
	foreach ( $matches as $match ) {
		$key = sanitize_key( $match[1] );
		if ( '' === $key ) {
			continue;
		}
		preg_match( '/\bdata-kt-variant="([^"]*)"/', $match[0], $variant_match );
		$references[ $key ][ sanitize_key( $variant_match[1] ?? '' ) ] = true;
	}
	return array_map( 'array_keys', $references );
}

function kotlinskidev_offer_variant_prices( array $offer, array $variant_keys ): array {
	$prices = [];
	foreach ( $variant_keys as $variant_key ) {
		$variant = $offer['variants'][ $variant_key ] ?? null;
		if ( null === $variant ) {
			continue;
		}
		foreach ( [ 'price_from', 'price_to' ] as $price_field ) {
			$price = kotlinskidev_offer_nullable_number( $variant[ $price_field ] ?? null );
			if ( null !== $price ) {
				$prices[] = $price;
			}
		}
	}
	return $prices;
}

function kotlinskidev_offer_schema_piece( string $key, array $offer, array $prices, string $base_url ): array {
	return [
		'@type'  => 'Service',
		'@id'    => trailingslashit( $base_url ) . '#/schema/offer/' . $key,
		'name'   => $offer['name'],
		'offers' => [
			'@type'         => 'AggregateOffer',
			'priceCurrency' => $offer['currency'],
			'lowPrice'      => min( $prices ),
			'highPrice'     => max( $prices ),
		],
	];
}

function kotlinskidev_offer_schema_pieces( string $content, string $lang, string $base_url ): array {
	$pieces = [];
	foreach ( kotlinskidev_offer_references( $content ) as $key => $variant_keys ) {
		$offer = kotlinskidev_offer_get( $key, $lang );
		if ( null === $offer || ! empty( $offer['is_placeholder'] ) ) {
			continue;
		}
		$prices = kotlinskidev_offer_variant_prices( $offer, $variant_keys );
		if ( array() === $prices ) {
			continue;
		}
		$pieces[] = kotlinskidev_offer_schema_piece( $key, $offer, $prices, $base_url );
	}
	return $pieces;
}

function kotlinskidev_offer_schema_graph( array $graph, $context = null ): array {
	if ( ! is_singular() ) {
		return $graph;
	}
	$post_id = (int) get_queried_object_id();
	$content = (string) get_post_field( 'post_content', $post_id );
	foreach ( kotlinskidev_offer_schema_pieces( $content, kotlinskidev_offer_current_lang(), home_url( '/' ) ) as $piece ) {
		$graph[] = $piece;
	}
	return $graph;
}
add_filter( 'wpseo_schema_graph', 'kotlinskidev_offer_schema_graph', 20, 2 );
