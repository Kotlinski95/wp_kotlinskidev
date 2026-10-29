<?php
function kotlinskidev_apply_scroll_animation_classes( string $block_content, array $block ): string {
	$animation = $block['attrs']['scrollAnimation'] ?? '';
	if ( '' === $animation || '' === $block_content ) {
		return $block_content;
	}

	$processor = new WP_HTML_Tag_Processor( $block_content );
	if ( ! $processor->next_tag() ) {
		return $block_content;
	}

	$existing_class = (string) ( $processor->get_attribute( 'class' ) ?? '' );
	if ( str_contains( $existing_class, $animation ) ) {
		return $block_content;
	}

	$classes = [ sanitize_html_class( $animation ) ];

	$delay = $block['attrs']['scrollAnimationDelay'] ?? '';
	if ( '' !== $delay ) {
		$classes[] = sanitize_html_class( $delay );
	}

	$translate = $block['attrs']['scrollAnimationTranslate'] ?? '';
	if ( '' !== $translate ) {
		$classes[] = sanitize_html_class( $translate );
	}

	$processor->set_attribute( 'class', trim( $existing_class . ' ' . implode( ' ', $classes ) ) );

	return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_scroll_animation_classes', 10, 2 );
