<?php
function kotlinskidev_offer_keys(): array {
	return [ 'website', 'ecommerce', 'web-app', 'performance-audit', 'website-optimization', 'local-seo', 'maintenance' ];
}

function kotlinskidev_offer_variant_defaults(): array {
	return [
		'key'          => '',
		'label'        => '',
		'price_from'   => null,
		'price_to'     => null,
		'price_period' => 'once',
		'price_note'   => '',
		'duration_min' => null,
		'duration_max' => null,
		'duration_unit' => 'days',
		'included'     => '',
	];
}

function kotlinskidev_offer_nullable_number( mixed $value ): int|float|null {
	if ( null === $value || '' === $value || ! is_numeric( $value ) ) {
		return null;
	}
	return max( 0, $value + 0 );
}

function kotlinskidev_offer_nullable_int( mixed $value ): ?int {
	$number = kotlinskidev_offer_nullable_number( $value );
	return null === $number ? null : (int) $number;
}

function kotlinskidev_offer_sanitize_variants( mixed $variants ): array {
	if ( ! is_array( $variants ) ) {
		return [];
	}
	$clean = [];
	foreach ( $variants as $variant ) {
		if ( ! is_array( $variant ) ) {
			continue;
		}
		$variant = array_merge( kotlinskidev_offer_variant_defaults(), $variant );
		$key     = sanitize_key( (string) $variant['key'] );
		if ( '' === $key ) {
			continue;
		}
		$clean[] = [
			'key'           => $key,
			'label'         => sanitize_text_field( (string) $variant['label'] ),
			'price_from'    => kotlinskidev_offer_nullable_number( $variant['price_from'] ),
			'price_to'      => kotlinskidev_offer_nullable_number( $variant['price_to'] ),
			'price_period'  => 'month' === $variant['price_period'] ? 'month' : 'once',
			'price_note'    => sanitize_text_field( (string) $variant['price_note'] ),
			'duration_min'  => kotlinskidev_offer_nullable_int( $variant['duration_min'] ),
			'duration_max'  => kotlinskidev_offer_nullable_int( $variant['duration_max'] ),
			'duration_unit' => in_array( $variant['duration_unit'], [ 'hours', 'days', 'weeks' ], true ) ? $variant['duration_unit'] : 'days',
			'included'      => sanitize_text_field( (string) $variant['included'] ),
		];
	}
	return $clean;
}

function kotlinskidev_offer_sanitize_currency( mixed $currency ): string {
	return 'PLN' === $currency ? 'PLN' : 'EUR';
}

function kotlinskidev_offer_variants_schema(): array {
	return [
		'type'  => 'array',
		'items' => [
			'type'                 => 'object',
			'additionalProperties' => false,
			'properties'           => [
				'key'           => [ 'type' => 'string' ],
				'label'         => [ 'type' => 'string' ],
				'price_from'    => [ 'type' => [ 'number', 'null' ] ],
				'price_to'      => [ 'type' => [ 'number', 'null' ] ],
				'price_period'  => [ 'type' => 'string', 'enum' => [ 'once', 'month' ] ],
				'price_note'    => [ 'type' => 'string' ],
				'duration_min'  => [ 'type' => [ 'integer', 'null' ] ],
				'duration_max'  => [ 'type' => [ 'integer', 'null' ] ],
				'duration_unit' => [ 'type' => 'string', 'enum' => [ 'hours', 'days', 'weeks' ] ],
				'included'      => [ 'type' => 'string' ],
			],
		],
	];
}
