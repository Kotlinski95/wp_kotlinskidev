<?php
function kotlinskidev_offer_transient_name( string $lang ): string {
	return 'kotlinskidev_offers_' . $lang;
}

function kotlinskidev_offer_memo( ?string $lang = null, ?array $set = null, bool $reset = false ): ?array {
	static $memo = [];

	if ( $reset ) {
		$memo = [];
		return null;
	}
	if ( null !== $set && null !== $lang ) {
		$memo[ $lang ] = $set;
	}
	return null === $lang ? null : ( $memo[ $lang ] ?? null );
}

function kotlinskidev_offer_build_map( string $lang ): array {
	$posts = get_posts( [
		'post_type'        => 'kt_offer',
		'post_status'      => 'publish',
		'numberposts'      => -1,
		'no_found_rows'    => true,
		'update_post_term_cache' => false,
		'orderby'          => 'menu_order',
		'order'            => 'ASC',
		'lang'             => $lang,
		'suppress_filters' => false,
	] );

	$map = [];
	foreach ( $posts as $post ) {
		$key = sanitize_key( (string) get_post_meta( $post->ID, 'offer_key', true ) );
		if ( '' === $key || isset( $map[ $key ] ) ) {
			continue;
		}
		$currency = kotlinskidev_offer_sanitize_currency( get_post_meta( $post->ID, 'currency', true ) );
		$variants = [];
		foreach ( kotlinskidev_offer_sanitize_variants( get_post_meta( $post->ID, 'variants', true ) ) as $variant ) {
			$variants[ $variant['key'] ] = $variant;
		}
		$map[ $key ] = [
			'name'           => (string) get_the_title( $post ),
			'currency'       => $currency,
			'is_placeholder' => (bool) get_post_meta( $post->ID, 'is_placeholder', true ),
			'variants'       => $variants,
		];
	}
	return $map;
}

function kotlinskidev_offer_map( string $lang ): array {
	$memoized = kotlinskidev_offer_memo( $lang );
	if ( null !== $memoized ) {
		return $memoized;
	}

	$cached = get_transient( kotlinskidev_offer_transient_name( $lang ) );
	if ( is_array( $cached ) ) {
		kotlinskidev_offer_memo( $lang, $cached );
		return $cached;
	}

	$map = kotlinskidev_offer_build_map( $lang );
	set_transient( kotlinskidev_offer_transient_name( $lang ), $map, WEEK_IN_SECONDS );
	kotlinskidev_offer_memo( $lang, $map );
	return $map;
}

function kotlinskidev_offer_get( string $key, string $lang ): ?array {
	$map = kotlinskidev_offer_map( $lang );
	return $map[ $key ] ?? null;
}

function kotlinskidev_offer_flush_cache(): void {
	foreach ( kotlinskidev_offer_languages() as $lang ) {
		delete_transient( kotlinskidev_offer_transient_name( (string) $lang ) );
	}
	kotlinskidev_offer_memo( null, null, true );
}
