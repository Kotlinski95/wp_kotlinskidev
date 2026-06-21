<?php
if ( empty( $attributes['content'] ) ) {
	return;
}
?>
<p <?php echo get_block_wrapper_attributes(); ?>><?php echo nl2br( esc_html( $attributes['content'] ) ); ?></p>
