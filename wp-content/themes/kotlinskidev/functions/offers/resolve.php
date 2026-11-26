<?php
function kotlinskidev_offer_resolve( string $key, string $variant, string $field, string $lang ): array {
	$offer = kotlinskidev_offer_get( $key, $lang );
	if ( null === $offer || ! isset( $offer['variants'][ $variant ] ) || ! in_array( $field, [ 'price', 'price_from', 'price_to', 'duration', 'label', 'included' ], true ) ) {
		return [
			'value'       => kotlinskidev_offer_fallback( $field ),
			'placeholder' => false,
			'missing'     => true,
		];
	}
	return [
		'value'       => kotlinskidev_offer_format( $offer['variants'][ $variant ], $field, (string) $offer['currency'] ),
		'placeholder' => ! empty( $offer['is_placeholder'] ) && kotlinskidev_offer_is_money_field( $field ),
		'missing'     => false,
	];
}
