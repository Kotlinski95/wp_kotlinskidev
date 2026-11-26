<?php
function kotlinskidev_register_offer_meta(): void {
	$auth = static function (): bool {
		return current_user_can( 'edit_posts' );
	};

	register_post_meta( 'kt_offer', 'offer_key', [
		'type'              => 'string',
		'single'            => true,
		'show_in_rest'      => [ 'schema' => [ 'type' => 'string', 'enum' => array_merge( [ '' ], kotlinskidev_offer_keys() ) ] ],
		'sanitize_callback' => 'sanitize_key',
		'auth_callback'     => $auth,
	] );

	register_post_meta( 'kt_offer', 'currency', [
		'type'              => 'string',
		'single'            => true,
		'default'           => 'EUR',
		'show_in_rest'      => [ 'schema' => [ 'type' => 'string', 'enum' => [ 'EUR', 'PLN' ] ] ],
		'sanitize_callback' => 'kotlinskidev_offer_sanitize_currency',
		'auth_callback'     => $auth,
	] );

	register_post_meta( 'kt_offer', 'is_placeholder', [
		'type'              => 'boolean',
		'single'            => true,
		'default'           => false,
		'show_in_rest'      => true,
		'sanitize_callback' => 'rest_sanitize_boolean',
		'auth_callback'     => $auth,
	] );

	register_post_meta( 'kt_offer', 'variants', [
		'type'              => 'array',
		'single'            => true,
		'default'           => [],
		'show_in_rest'      => [ 'schema' => kotlinskidev_offer_variants_schema() ],
		'sanitize_callback' => 'kotlinskidev_offer_sanitize_variants',
		'auth_callback'     => $auth,
	] );
}
add_action( 'init', 'kotlinskidev_register_offer_meta' );
