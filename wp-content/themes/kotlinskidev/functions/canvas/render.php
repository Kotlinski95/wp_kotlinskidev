<?php
function kotlinskidev_render_canvas_scrim_markup( array $attrs ): string {
	if ( empty( $attrs['canvasScrim'] ) ) {
		return '';
	}

	$color   = kotlinskidev_sanitize_canvas_color( $attrs['canvasScrimColor'] ?? null, '#000000' );
	$opacity = kotlinskidev_sanitize_canvas_number( $attrs['canvasScrimOpacity'] ?? null, 0, 1, 0.5 );

	$style = sprintf( 'background-color:%s;opacity:%s;', $color, number_format( $opacity, 3, '.', '' ) );

	return '<div class="kt-canvas-scrim" style="' . esc_attr( $style ) . '" aria-hidden="true"></div>';
}

function kotlinskidev_apply_canvas_background( string $block_content, array $block ): string {
	if ( '' === trim( $block_content ) ) {
		return $block_content;
	}

	$scene_id = absint( $block['attrs']['canvasSceneId'] ?? 0 );
	if ( ! $scene_id ) {
		return $block_content;
	}

	$markup = kotlinskidev_render_canvas_background_markup( $scene_id );
	if ( '' === $markup ) {
		return $block_content;
	}

	$markup .= kotlinskidev_render_canvas_scrim_markup( is_array( $block['attrs'] ?? null ) ? $block['attrs'] : [] );

	$processor = new WP_HTML_Tag_Processor( $block_content );
	if ( ! $processor->next_tag() ) {
		return $block_content;
	}
	$processor->add_class( 'kt-has-canvas-bg' );
	$content_with_class = $processor->get_updated_html();

	$injected = preg_replace_callback(
		'/^\s*<[a-zA-Z][^>]*>/',
		function ( array $matches ) use ( $markup ) {
			return $matches[0] . $markup;
		},
		$content_with_class,
		1
	);

	return $injected ?? $content_with_class;
}
add_filter( 'render_block', 'kotlinskidev_apply_canvas_background', 10, 2 );
