<?php

function kotlinskidev_get_theme_gradient( string $slug ): string {
	$settings = wp_get_global_settings( [ 'color', 'gradients' ] );
	if ( ! is_array( $settings ) ) {
		return '';
	}

	$origins = array_merge( $settings['custom'] ?? [], $settings['theme'] ?? [] );

	foreach ( $origins as $gradient ) {
		if ( ( $gradient['slug'] ?? '' ) === $slug ) {
			return (string) ( $gradient['gradient'] ?? '' );
		}
	}

	return '';
}

function kotlinskidev_split_top_level_commas( string $value ): array {
	$parts = [];
	$depth = 0;
	$start = 0;
	$length = strlen( $value );

	for ( $i = 0; $i < $length; $i++ ) {
		$char = $value[ $i ];
		if ( '(' === $char ) {
			$depth++;
		} elseif ( ')' === $char ) {
			$depth--;
		} elseif ( ',' === $char && 0 === $depth ) {
			$parts[] = trim( substr( $value, $start, $i - $start ) );
			$start   = $i + 1;
		}
	}

	$parts[] = trim( substr( $value, $start ) );

	return $parts;
}

function kotlinskidev_parse_gradient_stops( string $css_gradient ): array {
	$open  = strpos( $css_gradient, '(' );
	$close = strrpos( $css_gradient, ')' );

	if ( false === $open || false === $close || $close <= $open ) {
		return [];
	}

	$stops = [];
	$args  = kotlinskidev_split_top_level_commas( substr( $css_gradient, $open + 1, $close - $open - 1 ) );

	foreach ( $args as $arg ) {
		if ( preg_match( '/^(.+\S)\s+(\d+(?:\.\d+)?%)$/', $arg, $match ) ) {
			$stops[] = [
				'color'  => $match[1],
				'offset' => $match[2],
			];
		}
	}

	return $stops;
}

function kotlinskidev_render_gradient_stops( array $stops ): void {
	foreach ( $stops as $stop ) {
		printf(
			'<stop offset="%s" stop-color="%s" style="stop-color:%s"/>',
			esc_attr( $stop['offset'] ),
			esc_attr( $stop['color'] ),
			esc_attr( $stop['color'] )
		);
	}
}

function kotlinskidev_render_svg_gradient_defs(): void {
	$dark_stops  = kotlinskidev_parse_gradient_stops( kotlinskidev_get_theme_gradient( 'fancy-text-dark' ) );
	$light_stops = kotlinskidev_parse_gradient_stops( kotlinskidev_get_theme_gradient( 'fancy-text-light' ) );

	if ( empty( $dark_stops ) || empty( $light_stops ) ) {
		return;
	}
	?>
	<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;overflow:hidden" aria-hidden="true" focusable="false">
		<defs>
			<linearGradient id="kt-icon-gradient-dark" x1="100%" y1="0%" x2="0%" y2="0%">
				<?php kotlinskidev_render_gradient_stops( $dark_stops ); ?>
			</linearGradient>
			<linearGradient id="kt-icon-gradient-light" x1="100%" y1="0%" x2="0%" y2="0%">
				<?php kotlinskidev_render_gradient_stops( $light_stops ); ?>
			</linearGradient>
		</defs>
	</svg>
	<?php
}

add_action( 'wp_body_open', 'kotlinskidev_render_svg_gradient_defs' );
