<?php
$media_id = absint( $attributes['mediaId'] ?? 0 );
if ( ! $media_id ) {
	return;
}

$svg = kotlinskidev_inline_nav_icon( $media_id );
if ( '' === $svg ) {
	return;
}

$aria_label = sanitize_text_field( $attributes['ariaLabel'] ?? '' );
if ( '' !== $aria_label ) {
	$processor = new WP_HTML_Tag_Processor( $svg );
	if ( $processor->next_tag( 'svg' ) ) {
		$processor->remove_attribute( 'aria-hidden' );
		$processor->set_attribute( 'role', 'img' );
		$processor->set_attribute( 'aria-label', $aria_label );
	}
	$svg = $processor->get_updated_html();
}

$size         = sanitize_text_field( $attributes['size'] ?? '' );
$color        = sanitize_text_field( $attributes['color'] ?? '' );
$use_gradient = (bool) ( $attributes['useGradient'] ?? false );

$inline_style = '';
if ( $size ) {
	$inline_style .= '--kt-icon-size: ' . esc_attr( $size ) . ';';
}
if ( $color && ! $use_gradient ) {
	$inline_style .= 'color: ' . esc_attr( $color ) . ';';
}

$show_tooltip = (bool) ( $attributes['showTooltip'] ?? false ) && '' !== $aria_label;

$wrapper_class = 'kt-icon';
if ( $use_gradient ) {
	$wrapper_class .= ' kt-icon--gradient';
}
if ( $show_tooltip ) {
	$wrapper_class .= ' kt-tooltip';
}

$wrapper_args = [
	'class' => $wrapper_class,
	'style' => $inline_style,
];
if ( $show_tooltip ) {
	$wrapper_args['data-tooltip'] = $aria_label;
}

$wrapper_attributes = get_block_wrapper_attributes( $wrapper_args );
?>
<span <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>><?php echo $svg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $svg comes from kotlinskidev_inline_nav_icon(), which sanitizes via kotlinskidev_sanitize_svg() before caching ?></span>
