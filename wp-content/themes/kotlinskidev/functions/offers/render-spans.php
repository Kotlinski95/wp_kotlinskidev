<?php
function kotlinskidev_offer_leaf_blocks(): array {
	return (array) apply_filters( 'kotlinskidev_offer_leaf_blocks', [
		'core/paragraph',
		'core/heading',
		'core/button',
		'core/list-item',
		'core/table',
		'core/quote',
		'core/pullquote',
		'core/verse',
		'core/preformatted',
		'core/details',
	] );
}

function kotlinskidev_offer_span_classes( string $class_attribute ): array {
	return preg_split( '/\s+/', trim( $class_attribute ) );
}

function kotlinskidev_offer_span_attribute( string $attrs, string $name ): string {
	preg_match( '/\b' . $name . '="([^"]*)"/', $attrs, $match );
	return sanitize_key( $match[1] ?? '' );
}

function kotlinskidev_offer_span_display( array $resolved, string $field, bool $is_editor ): array {
	if ( $resolved['missing'] ) {
		return [ 'class' => $is_editor ? 'kt-offer--missing' : null, 'value' => $resolved['value'] ];
	}
	if ( ! $resolved['placeholder'] ) {
		return [ 'class' => null, 'value' => $resolved['value'] ];
	}
	if ( $is_editor ) {
		return [ 'class' => 'kt-offer--placeholder', 'value' => $resolved['value'] ];
	}
	return [ 'class' => null, 'value' => kotlinskidev_offer_fallback( $field ) ];
}

function kotlinskidev_offer_replace_span( array $matches, string $lang, bool $is_editor ): string {
	$attrs = $matches[1];
	if ( ! preg_match( '/\bclass="([^"]*)"/', $attrs, $class_match ) || ! in_array( 'kt-offer', kotlinskidev_offer_span_classes( $class_match[1] ), true ) ) {
		return $matches[0];
	}
	$field    = kotlinskidev_offer_span_attribute( $attrs, 'data-kt-field' );
	$resolved = kotlinskidev_offer_resolve(
		kotlinskidev_offer_span_attribute( $attrs, 'data-kt-offer' ),
		kotlinskidev_offer_span_attribute( $attrs, 'data-kt-variant' ),
		$field,
		$lang
	);
	$display  = kotlinskidev_offer_span_display( $resolved, $field, $is_editor );
	$classes  = array_diff( kotlinskidev_offer_span_classes( $class_match[1] ), [ 'kt-offer--placeholder', 'kt-offer--missing' ] );
	if ( null !== $display['class'] ) {
		$classes[] = $display['class'];
	}

	$attrs = str_replace( $class_match[0], 'class="' . esc_attr( implode( ' ', $classes ) ) . '"', $attrs );
	return '<span' . $attrs . '>' . esc_html( $display['value'] ) . '</span>';
}

function kotlinskidev_offer_replace_spans( string $content, string $lang, bool $is_editor ): string {
	$pattern = '#<span\b([^>]*\bdata-kt-offer="[^"]*"[^>]*)>(.*?)</span>#s';
	return (string) preg_replace_callback(
		$pattern,
		static function ( array $matches ) use ( $lang, $is_editor ): string {
			return kotlinskidev_offer_replace_span( $matches, $lang, $is_editor );
		},
		$content
	);
}

function kotlinskidev_offer_render_block( string $block_content, array $block ): string {
	if ( false === strpos( $block_content, 'data-kt-offer' ) ) {
		return $block_content;
	}
	if ( ! in_array( $block['blockName'] ?? '', kotlinskidev_offer_leaf_blocks(), true ) ) {
		return $block_content;
	}
	return kotlinskidev_offer_replace_spans( $block_content, kotlinskidev_offer_current_lang(), current_user_can( 'edit_posts' ) );
}
add_filter( 'render_block', 'kotlinskidev_offer_render_block', 20, 2 );
