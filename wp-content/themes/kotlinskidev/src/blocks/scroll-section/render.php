<?php
$extra_attrs = [ 'class' => 'scroll-section' ];
if ( ! empty( $attributes['backgroundColor'] ) ) {
	$extra_attrs['style'] = 'background: ' . esc_attr( $attributes['backgroundColor'] ) . ';';
}
$wrapper_attributes = get_block_wrapper_attributes( $extra_attrs );
$markers    = ! empty( $attributes['markers'] ) ? 'true' : 'false';
$slide_width = esc_attr( $attributes['slideWidth'] ?? 'auto' );
?>
<div <?php echo $wrapper_attributes; ?> data-scroll-section data-markers="<?php echo $markers; ?>" data-slide-width="<?php echo $slide_width; ?>" data-trigger="<?php echo esc_attr( $attributes['trigger'] ?? 'center' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $wrapper_attributes is get_block_wrapper_attributes() output; $markers is a fixed 'true'/'false' literal; $slide_width is esc_attr() wrapped at construction above ?>">
	<div class="scroll-section__track scrollx-section">
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $content is the block's already-rendered InnerBlocks HTML from WP core's own self-escaping block render pipeline ?>
	</div>
</div>
