<?php
add_filter( 'render_block_core/social-link', 'kotlinskidev_add_social_link_tooltip', 10, 2 );

function kotlinskidev_add_social_link_tooltip( string $block_content, array $block ): string {
	if ( false === strpos( $block_content, 'wp-block-social-link-label screen-reader-text' ) ) {
		return $block_content;
	}

	if ( ! preg_match( '/wp-block-social-link-label screen-reader-text">(.*?)<\/span>/s', $block_content, $matches ) ) {
		return $block_content;
	}

	$label = sanitize_text_field( wp_strip_all_tags( $matches[1] ) );
	if ( '' === $label ) {
		return $block_content;
	}

	$processor = new WP_HTML_Tag_Processor( $block_content );
	if ( ! $processor->next_tag( [
		'tag_name'   => 'a',
		'class_name' => 'wp-block-social-link-anchor',
	] ) ) {
		return $block_content;
	}

	$processor->add_class( 'kt-tooltip' );
	$processor->set_attribute( 'data-tooltip', $label );

	return $processor->get_updated_html();
}
