<?php
$extra_attrs = [ 'class' => 'scroll-section' ];
if ( ! empty( $attributes['backgroundColor'] ) ) {
	$extra_attrs['style'] = 'background: ' . esc_attr( $attributes['backgroundColor'] ) . ';';
}
$wrapper_attributes = get_block_wrapper_attributes( $extra_attrs );
$markers    = ! empty( $attributes['markers'] ) ? 'true' : 'false';
$slide_width = esc_attr( $attributes['slideWidth'] ?? 'auto' );
?>
<div <?php echo $wrapper_attributes; ?> data-scroll-section data-markers="<?php echo $markers; ?>" data-slide-width="<?php echo $slide_width; ?>" data-trigger="<?php echo esc_attr( $attributes['trigger'] ?? 'center' ); ?>">
	<div class="scroll-section__track scrollx-section">
		<?php echo $content; ?>
	</div>
</div>
