<?php
function kotlinskidev_offer_rest_value( WP_REST_Request $request ): array {
	$lang     = (string) ( $request->get_param( 'lang' ) ?: kotlinskidev_offer_current_lang() );
	$resolved = kotlinskidev_offer_resolve(
		sanitize_key( (string) $request->get_param( 'offer' ) ),
		sanitize_key( (string) $request->get_param( 'variant' ) ),
		sanitize_key( (string) $request->get_param( 'field' ) ),
		sanitize_key( $lang )
	);
	return [
		'value'       => $resolved['value'],
		'placeholder' => $resolved['placeholder'],
	];
}

function kotlinskidev_offer_rest_list( WP_REST_Request $request ): array {
	$lang = sanitize_key( (string) ( $request->get_param( 'lang' ) ?: kotlinskidev_offer_current_lang() ) );
	$list = [];
	foreach ( kotlinskidev_offer_map( $lang ) as $key => $offer ) {
		$variants = [];
		foreach ( $offer['variants'] as $variant_key => $variant ) {
			$variants[] = [
				'key'   => (string) $variant_key,
				'label' => $variant['label'],
			];
		}
		$list[] = [
			'key'            => (string) $key,
			'name'           => $offer['name'],
			'currency'       => $offer['currency'],
			'is_placeholder' => $offer['is_placeholder'],
			'variants'       => $variants,
		];
	}
	return $list;
}

function kotlinskidev_offer_rest_permission(): bool {
	return current_user_can( 'edit_posts' );
}

function kotlinskidev_register_offer_routes(): void {
	register_rest_route( 'kotlinskidev/v1', '/offer-value', [
		'methods'             => 'GET',
		'callback'            => 'kotlinskidev_offer_rest_value',
		'permission_callback' => 'kotlinskidev_offer_rest_permission',
		'args'                => [
			'offer'   => [ 'type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_key' ],
			'variant' => [ 'type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_key' ],
			'field'   => [ 'type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_key' ],
			'lang'    => [ 'type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_key' ],
		],
	] );

	register_rest_route( 'kotlinskidev/v1', '/offers', [
		'methods'             => 'GET',
		'callback'            => 'kotlinskidev_offer_rest_list',
		'permission_callback' => 'kotlinskidev_offer_rest_permission',
		'args'                => [
			'lang' => [ 'type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_key' ],
		],
	] );
}
add_action( 'rest_api_init', 'kotlinskidev_register_offer_routes' );
