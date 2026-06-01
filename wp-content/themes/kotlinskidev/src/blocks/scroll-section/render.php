<?php
$extra_attrs = [ 'class' => 'scroll-section' ];
if ( ! empty( $attributes['backgroundColor'] ) ) {
	$extra_attrs['style'] = 'background: ' . esc_attr( $attributes['backgroundColor'] ) . ';';
}
$wrapper_attributes = get_block_wrapper_attributes( $extra_attrs );
?>
<div <?php echo $wrapper_attributes; ?> data-scroll-section>
	<div class="scroll-section__track scrollx-section">
		<?php echo $content; ?>
	</div>
</div>
