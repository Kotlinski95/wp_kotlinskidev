<?php
function kotlinskidev_faq_layout_class( array $faq_layout ): string {
	if ( ( $faq_layout['layout'] ?? '' ) !== 'independent' ) {
		return '';
	}

	$columns = absint( $faq_layout['columns'] ?? 2 );
	$columns = in_array( $columns, [ 2, 3, 4 ], true ) ? $columns : 2;

	return 'kt-faq-independent-columns-' . $columns;
}

function kotlinskidev_apply_faq_layout( string $block_content, array $block ): string {
	if ( ( $block['blockName'] ?? '' ) !== 'core/group' || $block_content === '' ) {
		return $block_content;
	}

	$class = kotlinskidev_faq_layout_class( $block['attrs']['faqLayout'] ?? [] );
	if ( $class === '' ) {
		return $block_content;
	}

	$processor = new WP_HTML_Tag_Processor( $block_content );
	if ( ! $processor->next_tag() ) {
		return $block_content;
	}

	$existing_class = $processor->get_attribute( 'class' ) ?? '';
	$processor->set_attribute( 'class', trim( $existing_class . ' ' . $class ) );

	return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_faq_layout', 10, 2 );
