<?php
function kotlinskidev_offer_format_number( int|float $number ): string {
	$decimals = ( (float) $number === floor( (float) $number ) ) ? 0 : 2;
	return number_format_i18n( (float) $number, $decimals );
}

function kotlinskidev_offer_format_money( int|float $number, string $currency ): string {
	$formatted = kotlinskidev_offer_format_number( $number );
	if ( 'PLN' === $currency ) {
		return $formatted . ( str_starts_with( get_locale(), 'pl' ) ? ' zł' : ' PLN' );
	}
	return '€' . $formatted;
}

function kotlinskidev_offer_format_price( array $variant, string $currency ): string {
	$from = kotlinskidev_offer_nullable_number( $variant['price_from'] ?? null );
	$to   = kotlinskidev_offer_nullable_number( $variant['price_to'] ?? null );
	if ( null === $from && null === $to ) {
		return __( 'Price on request', 'kotlinskidev' );
	}

	if ( null !== $from && null !== $to && $from !== $to ) {
		if ( 'PLN' === $currency ) {
			$text = kotlinskidev_offer_format_number( $from ) . '–' . kotlinskidev_offer_format_money( $to, $currency );
		} else {
			$text = kotlinskidev_offer_format_money( $from, $currency ) . '–' . kotlinskidev_offer_format_money( $to, $currency );
		}
	} elseif ( null !== $from && null === $to ) {
		$text = __( 'from', 'kotlinskidev' ) . ' ' . kotlinskidev_offer_format_money( $from, $currency );
	} else {
		$text = kotlinskidev_offer_format_money( $to ?? $from, $currency );
	}

	if ( 'month' === ( $variant['price_period'] ?? 'once' ) ) {
		$text .= ' ' . __( '/ month', 'kotlinskidev' );
	}
	return $text;
}

function kotlinskidev_offer_format_duration( array $variant ): string {
	$min  = kotlinskidev_offer_nullable_int( $variant['duration_min'] ?? null );
	$max  = kotlinskidev_offer_nullable_int( $variant['duration_max'] ?? null );
	$unit = $variant['duration_unit'] ?? 'days';
	if ( null === $min && null === $max ) {
		return __( 'Timeline agreed individually', 'kotlinskidev' );
	}

	$low    = $min ?? $max;
	$high   = $max ?? $min;
	$amount = $low === $high ? (string) $high : $low . '–' . $high;

	switch ( $unit ) {
		case 'hours':
			/* translators: %s: number of hours */
			return sprintf( _n( '%s hour', '%s hours', $high, 'kotlinskidev' ), $amount );
		case 'weeks':
			return sprintf( _n( '%s week', '%s weeks', $high, 'kotlinskidev' ), $amount );
		default:
			return sprintf( _n( '%s day', '%s days', $high, 'kotlinskidev' ), $amount );
	}
}

function kotlinskidev_offer_format( array $variant, string $field, string $currency ): string {
	switch ( $field ) {
		case 'price':
			return kotlinskidev_offer_format_price( $variant, $currency );
		case 'price_from':
			$from = kotlinskidev_offer_nullable_number( $variant['price_from'] ?? null );
			return null === $from ? __( 'Price on request', 'kotlinskidev' ) : kotlinskidev_offer_format_money( $from, $currency );
		case 'price_to':
			$to = kotlinskidev_offer_nullable_number( $variant['price_to'] ?? null );
			return null === $to ? __( 'Price on request', 'kotlinskidev' ) : kotlinskidev_offer_format_money( $to, $currency );
		case 'duration':
			return kotlinskidev_offer_format_duration( $variant );
		case 'label':
			return (string) ( $variant['label'] ?? '' );
		case 'included':
			return (string) ( $variant['included'] ?? '' );
	}
	return '';
}

function kotlinskidev_offer_fallback( string $field ): string {
	if ( 'duration' === $field ) {
		return __( 'Timeline agreed individually', 'kotlinskidev' );
	}
	if ( in_array( $field, [ 'price', 'price_from', 'price_to' ], true ) ) {
		return __( 'Price on request', 'kotlinskidev' );
	}
	return '';
}

function kotlinskidev_offer_is_money_field( string $field ): bool {
	return in_array( $field, [ 'price', 'price_from', 'price_to', 'duration' ], true );
}
