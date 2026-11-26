<?php
const KOTLINSKIDEV_SVG_SPRITE_HASH_LENGTH = 6;

add_action( 'wp_body_open', 'kotlinskidev_print_svg_sprite', 5 );

function kotlinskidev_svg_sprite_symbols( string $symbol_id = '', string $view_box = '', string $inner = '' ): array {
	static $symbols = array();

	if ( '' !== $symbol_id && ! isset( $symbols[ $symbol_id ] ) ) {
		$symbols[ $symbol_id ] = array(
			'view_box' => $view_box,
			'inner'    => $inner,
		);
	}

	return $symbols;
}

function kotlinskidev_svg_sprite_enabled(): bool {
	if ( ! kotlinskidev_is_front_end_render() || did_action( 'wp_body_open' ) ) {
		return false;
	}

	return (bool) apply_filters( 'kotlinskidev_use_svg_sprite', true );
}

function kotlinskidev_svg_sprite_reference( int $attachment_id, string $inline_svg ): ?string {
	if ( ! kotlinskidev_svg_sprite_enabled() ) {
		return null;
	}

	if ( 1 !== preg_match( '/^<svg\b([^>]*[^>\/])>(.*)<\/svg>$/s', trim( $inline_svg ), $parts ) ) {
		return null;
	}

	$root_attrs = $parts[1];
	$inner      = $parts[2];

	if ( 1 !== preg_match( '/\sviewBox="([^"]*)"/i', $root_attrs, $view_box ) || '' === trim( $inner ) ) {
		return null;
	}

	$outer_attrs = (string) preg_replace( '/\sxmlns(?::[\w-]+)?="[^"]*"/i', '', $root_attrs );
	$outer_attrs = (string) preg_replace( '/\sviewBox="[^"]*"/i', '', $outer_attrs );
	$symbol_id   = sprintf( 'kt-svg-%d-%s', $attachment_id, substr( md5( $inner ), 0, KOTLINSKIDEV_SVG_SPRITE_HASH_LENGTH ) );

	kotlinskidev_svg_sprite_symbols( $symbol_id, $view_box[1], $inner );

	return sprintf( '<svg%s><use href="#%s"/></svg>', $outer_attrs, $symbol_id );
}

function kotlinskidev_render_svg_sprite_markup( array $symbols ): string {
	if ( empty( $symbols ) ) {
		return '';
	}

	$markup = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">';

	foreach ( $symbols as $symbol_id => $symbol ) {
		$markup .= sprintf( '<symbol id="%s" viewBox="%s">%s</symbol>', esc_attr( $symbol_id ), esc_attr( $symbol['view_box'] ), $symbol['inner'] );
	}

	return $markup . '</svg>';
}

function kotlinskidev_print_svg_sprite(): void {
	echo kotlinskidev_render_svg_sprite_markup( kotlinskidev_svg_sprite_symbols() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- symbol ids and viewBox escaped, inner markup produced by kotlinskidev_sanitize_svg()
}
