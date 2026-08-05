<?php
$kotlinskidev_nav_paragraph_content = $attributes['content'] ?? '';
if ( $kotlinskidev_nav_paragraph_content === '' ) {
	return;
}

$kotlinskidev_nav_paragraph_color    = $attributes['textColor'] ?? '';
$kotlinskidev_nav_paragraph_gradient = $attributes['textGradient'] ?? '';
$kotlinskidev_nav_paragraph_style    = '';

if ( $kotlinskidev_nav_paragraph_gradient !== '' ) {
	$kotlinskidev_nav_paragraph_style = 'background-image:' . $kotlinskidev_nav_paragraph_gradient . ';background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:transparent';
} elseif ( $kotlinskidev_nav_paragraph_color !== '' ) {
	$kotlinskidev_nav_paragraph_style = 'color:' . $kotlinskidev_nav_paragraph_color;
}

$kotlinskidev_nav_paragraph_content_html = nl2br( esc_html( $kotlinskidev_nav_paragraph_content ) );
$kotlinskidev_nav_paragraph_content_html = $kotlinskidev_nav_paragraph_style !== ''
	? '<span style="' . esc_attr( $kotlinskidev_nav_paragraph_style ) . '">' . $kotlinskidev_nav_paragraph_content_html . '</span>'
	: $kotlinskidev_nav_paragraph_content_html;
?>
<p <?php echo get_block_wrapper_attributes(); ?>><?php echo $kotlinskidev_nav_paragraph_content_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built via nl2br(esc_html()) plus an esc_attr()-wrapped inline style, no raw input reaches output ?></p>
