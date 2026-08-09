<?php
function kotlinskidev_add_main_wrapper_tabindex( string $block_content, array $block ): string {
	if ( $block_content === '' || ( $block['attrs']['tagName'] ?? '' ) !== 'main' ) {
		return $block_content;
	}

	$processor = new WP_HTML_Tag_Processor( $block_content );
	if ( ! $processor->next_tag( 'main' ) || ! $processor->has_class( 'main-wrapper' ) ) {
		return $block_content;
	}

	$processor->set_attribute( 'tabindex', '-1' );

	return $processor->get_updated_html();
}
add_filter( 'render_block_core/group', 'kotlinskidev_add_main_wrapper_tabindex', 10, 2 );
