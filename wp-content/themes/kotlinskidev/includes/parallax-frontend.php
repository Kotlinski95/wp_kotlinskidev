<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'render_block', 'kotlinskidev_render_parallax_cover_block', 10, 2 );

function kotlinskidev_render_parallax_cover_block( string $block_content, array $block ): string {
	if ( 'core/cover' !== $block['blockName'] || empty( $block['attrs']['enableParallax'] ) ) {
		return $block_content;
	}

	$image_url = esc_url( $block['attrs']['url'] ?? '' );
	if ( ! $image_url ) {
		return $block_content;
	}

	$above_fold = function_exists( 'kotlinskidev_is_above_fold' ) && kotlinskidev_is_above_fold( $block );

	if ( ! $above_fold ) {
		$attachment_id = (int) ( $block['attrs']['id'] ?? 0 );
		if ( $attachment_id > 0 ) {
			$large_url = wp_get_attachment_image_url( $attachment_id, 'large' );
			if ( $large_url ) {
				$image_url = esc_url( $large_url );
			}
		}
	}

	return preg_replace_callback(
		'/<(div|section)([^>]*class="[^"]*wp-block-cover[^"]*"[^>]*)>/i',
		static function ( array $matches ) use ( $image_url, $above_fold ): string {
			$attrs = $matches[2];

			$attrs = preg_replace( '/(class="[^"]*wp-block-cover)/', '$1 enable-parallax', $attrs, 1 );

			if ( ! $above_fold ) {
				return '<' . $matches[1] . $attrs . ' data-kt-parallax-bg="' . esc_attr( $image_url ) . '">';
			}

			$bg = 'background-image:url(\'' . $image_url . '\');';
			if ( preg_match( '/\bstyle="/', $attrs ) ) {
				$attrs = preg_replace( '/\bstyle="/', 'style="' . $bg, $attrs, 1 );
			} else {
				$attrs .= ' style="' . $bg . '"';
			}

			return '<' . $matches[1] . $attrs . '>';
		},
		$block_content,
		1
	);
}
