<?php
function kotlinskidev_is_slider_slide_block( array $block ): bool {
	if ( 'core/cover' !== ( $block['blockName'] ?? '' ) ) {
		return false;
	}

	$class_name = (string) ( $block['attrs']['className'] ?? '' );

	return in_array( 'swiper-slide', preg_split( '/\s+/', $class_name, -1, PREG_SPLIT_NO_EMPTY ), true );
}

function kotlinskidev_apply_slider_slide_modal_trigger( string $block_content, array $block ): string {
	if ( ! kotlinskidev_is_slider_slide_block( $block ) ) {
		return $block_content;
	}

	$modal_id = absint( $block['attrs']['modalId'] ?? 0 );
	if ( ! $modal_id ) {
		return $block_content;
	}

	$modal = kotlinskidev_resolve_modal_by_id( $modal_id );
	if ( ! $modal instanceof WP_Post ) {
		return $block_content;
	}

	kotlinskidev_register_modal_for_footer( $modal->ID );

	$processor = new WP_HTML_Tag_Processor( $block_content );
	if ( ! $processor->next_tag() ) {
		return $block_content;
	}

	$processor->set_attribute( 'data-kt-modal-target', 'kt-modal-' . $modal->ID );
	$processor->set_attribute( 'role', 'button' );
	$processor->set_attribute( 'tabindex', '0' );
	$processor->set_attribute(
		'aria-label',
		sprintf(
			/* translators: %s: modal title */
			__( 'Open %s', 'kotlinskidev' ),
			$modal->post_title
		)
	);

	return $processor->get_updated_html();
}
add_filter( 'render_block_core/cover', 'kotlinskidev_apply_slider_slide_modal_trigger', 10, 2 );
