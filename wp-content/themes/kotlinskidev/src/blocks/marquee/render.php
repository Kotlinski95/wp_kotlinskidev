<?php
$speed = (int) ( $attributes['speed'] ?? 30 );
if ( $speed < 5 ) {
	$speed = 5;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'kt-marquee swiper',
] );
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?> data-marquee-speed="<?php echo esc_attr( $speed ); ?>">
	<div class="swiper-wrapper">
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $content is the block's already-rendered InnerBlocks HTML from WP core's own self-escaping block render pipeline ?>
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- second copy of the same trusted $content, guaranteeing real overflow so Swiper always has something to loop-scroll regardless of item count or viewport width; init.ts marks it non-tabbable/aria-hidden but still clickable ?>
	</div>
</div>
