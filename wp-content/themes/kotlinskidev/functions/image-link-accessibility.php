<?php
function kotlinskidev_icon_link_aria_labels(): array {
	return [
		home_url( '/en/services/' ) => __( 'View services', 'kotlinskidev' ),
		home_url( '/en/projects/' ) => __( 'View projects', 'kotlinskidev' ),
		home_url( '/en/contact/' )  => __( 'Contact me', 'kotlinskidev' ),
		home_url( '/uslugi/' )      => __( 'Zobacz usługi', 'kotlinskidev' ),
		home_url( '/projekty/' )    => __( 'Zobacz projekty', 'kotlinskidev' ),
		home_url( '/kontakt/' )     => __( 'Kontakt', 'kotlinskidev' ),
	];
}

function kotlinskidev_add_image_link_aria_label( string $block_content ): string {
	if ( strpos( $block_content, 'wp-block-image' ) === false || strpos( $block_content, '<a ' ) === false || strpos( $block_content, 'aria-label' ) !== false ) {
		return $block_content;
	}

	foreach ( kotlinskidev_icon_link_aria_labels() as $href => $label ) {
		$needle = 'href="' . $href . '"';
		if ( strpos( $block_content, $needle ) !== false ) {
			return str_replace( $needle, $needle . ' aria-label="' . esc_attr( $label ) . '"', $block_content );
		}
	}

	return kotlinskidev_add_media_file_link_aria_label( $block_content );
}

function kotlinskidev_add_media_file_link_aria_label( string $block_content ): string {
	if ( ! preg_match( '/<a\s[^>]*href="[^"]*\/wp-content\/uploads\/[^"]*"[^>]*>/', $block_content, $anchor_match ) ) {
		return $block_content;
	}

	$label = __( 'View full-size image', 'kotlinskidev' );
	if ( preg_match( '/<img[^>]*\salt="([^"]*)"/', $block_content, $alt_match ) ) {
		$alt = html_entity_decode( $alt_match[1], ENT_QUOTES );
		if ( '' !== trim( $alt ) ) {
			$label = sprintf( __( 'View full-size image: %s', 'kotlinskidev' ), $alt );
		}
	}

	$anchor      = $anchor_match[0];
	$new_anchor  = substr( $anchor, 0, -1 ) . ' aria-label="' . esc_attr( $label ) . '">';

	return str_replace( $anchor, $new_anchor, $block_content );
}
add_filter( 'render_block_core/image', 'kotlinskidev_add_image_link_aria_label' );
