<?php
if ( empty( $attributes['mediaUrl'] ) ) {
	return;
}

$img    = '<img src="' . esc_url( $attributes['mediaUrl'] ) . '" alt="' . esc_attr( $attributes['altText'] ?? '' ) . '" loading="lazy" style="width:100%;height:auto;display:block;">';
$output = ! empty( $attributes['linkUrl'] )
	? '<a href="' . esc_url( $attributes['linkUrl'] ) . '">' . $img . '</a>'
	: $img;
?>
<figure <?php echo get_block_wrapper_attributes(); ?>><?php echo $output; ?></figure>
