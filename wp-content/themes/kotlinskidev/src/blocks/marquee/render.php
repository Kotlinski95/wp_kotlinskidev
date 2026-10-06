<?php
$speed = (int) ( $attributes['speed'] ?? 30 );
if ( $speed < 5 ) {
	$speed = 5;
}

$direction = $attributes['direction'] ?? 'normal';
if ( ! in_array( $direction, [ 'normal', 'reverse' ], true ) ) {
	$direction = 'normal';
}

$gap = (int) ( $attributes['gap'] ?? 40 );
if ( $gap < 0 ) {
	$gap = 0;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'kt-marquee',
	'style' => '--kt-marquee-duration: ' . $speed . 's; --kt-marquee-gap: ' . $gap . 'px;',
] );
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?> data-marquee-direction="<?php echo esc_attr( $direction ); ?>">
	<div class="kt-marquee__track">
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $content is the block's already-rendered InnerBlocks HTML from WP core's own self-escaping block render pipeline ?>
	</div>
</div>
