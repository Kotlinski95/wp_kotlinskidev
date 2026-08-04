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

	return $block_content;
}
add_filter( 'render_block_core/image', 'kotlinskidev_add_image_link_aria_label' );
