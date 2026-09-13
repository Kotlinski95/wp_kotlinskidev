<?php
if ( '' === trim( (string) $content ) ) {
	return;
}

$modal_id = absint( $attributes['modalId'] ?? 0 );
$modal    = $modal_id ? kotlinskidev_resolve_modal_by_id( $modal_id ) : null;

if ( $modal instanceof WP_Post ) {
	kotlinskidev_register_modal_for_footer( $modal->ID );

	$wrapper_attributes = get_block_wrapper_attributes( [
		'class'                => 'kt-marquee__item swiper-slide',
		'data-kt-modal-target' => 'kt-modal-' . $modal->ID,
		'role'                 => 'button',
		'tabindex'             => '0',
		'aria-label'           => sprintf(
			/* translators: %s: modal title */
			__( 'Open %s', 'kotlinskidev' ),
			$modal->post_title
		),
	] );
} else {
	$wrapper_attributes = get_block_wrapper_attributes( [ 'class' => 'kt-marquee__item swiper-slide' ] );
}
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $content is this block's already-rendered InnerBlocks HTML from WP core's own self-escaping block render pipeline ?>
</div>
