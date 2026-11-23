<?php
if ( ! function_exists( 'kotlinskidev_nav_link_styles' ) ) {
	function kotlinskidev_nav_link_styles( array $attrs ): array {
		$parts = [];
		$class = '';
		$typo  = $attrs['style']['typography'] ?? [];
		$color = $attrs['style']['color'] ?? [];

		if ( ! empty( $typo['fontSize'] ) ) {
			$parts[] = 'font-size:' . $typo['fontSize'];
		} elseif ( ! empty( $attrs['fontSize'] ) ) {
			$class .= ' has-' . sanitize_html_class( $attrs['fontSize'] ) . '-font-size';
		}
		foreach ( [ 'lineHeight' => 'line-height', 'fontStyle' => 'font-style', 'fontWeight' => 'font-weight', 'letterSpacing' => 'letter-spacing', 'textDecoration' => 'text-decoration', 'textTransform' => 'text-transform' ] as $attr => $prop ) {
			if ( ! empty( $typo[ $attr ] ) ) {
				$parts[] = $prop . ':' . $typo[ $attr ];
			}
		}
		if ( ! empty( $color['text'] ) ) {
			$parts[] = 'color:' . $color['text'];
		} elseif ( ! empty( $attrs['textColor'] ) ) {
			$class .= ' has-text-color has-' . sanitize_html_class( $attrs['textColor'] ) . '-color';
		}

		return [ 'style' => $parts ? implode( ';', $parts ) . ';' : '', 'class' => $class ];
	}
}

if ( ! function_exists( 'kotlinskidev_nav_reveal_attrs' ) ) {
	function kotlinskidev_nav_reveal_attrs( array $attrs ): array {
		$animation = $attrs['navRevealAnimation'] ?? '';
		if ( $animation === '' ) {
			return [ 'class' => '', 'style' => '' ];
		}

		$classes = [ sanitize_html_class( $animation ) ];
		$translate = $attrs['navRevealTranslate'] ?? '';
		if ( $translate !== '' ) {
			$classes[] = sanitize_html_class( $translate );
		}

		$delay = (int) ( $attrs['navRevealDelay'] ?? 0 );
		$style = $delay > 0 ? '--reveal-delay:' . $delay . 'ms;' : '';

		return [ 'class' => implode( ' ', $classes ), 'style' => $style ];
	}
}
