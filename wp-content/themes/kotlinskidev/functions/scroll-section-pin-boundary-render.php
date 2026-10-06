<?php
function kotlinskidev_apply_scroll_section_pin_boundary_class( string $block_content, array $block ): string {
	$enabled = $block['attrs']['scrollSectionPinBoundary'] ?? false;
	if ( ! $enabled || '' === $block_content ) {
		return $block_content;
	}

	$processor = new WP_HTML_Tag_Processor( $block_content );
	if ( ! $processor->next_tag() ) {
		return $block_content;
	}

	$existing_class = (string) ( $processor->get_attribute( 'class' ) ?? '' );
	if ( str_contains( $existing_class, 'scroll-section-pin-boundary' ) ) {
		return $block_content;
	}

	$processor->set_attribute( 'class', trim( $existing_class . ' scroll-section-pin-boundary' ) );

	return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_scroll_section_pin_boundary_class', 10, 2 );
