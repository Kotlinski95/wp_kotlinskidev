<?php
$bg_image_id  = absint( $attributes['bgImageId'] ?? 0 );
$bg_image_url = esc_url( $attributes['bgImageUrl'] ?? '' );
$bg_video_url = esc_url( $attributes['bgVideoUrl'] ?? '' );
$bg_overlay   = min( 1.0, max( 0.0, (float) ( $attributes['bgOverlay'] ?? 0.4 ) ) );
$lazy_load     = (bool) ( $block->context['kotlinskidev/lazyLoad'] ?? false );
$loading       = $lazy_load ? 'lazy' : 'eager';
static $high_priority_set = false;
$fetchpriority = ( ! $lazy_load && ! $high_priority_set ) ? 'high' : null;
if ( null !== $fetchpriority ) {
	$high_priority_set = true;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'swiper-slide hero-carousel__slide',
] );
?>
<div <?php echo $wrapper_attributes; ?>>
	<div class="hero-carousel__bg">
		<?php if ( $bg_video_url ) : ?>
			<video
				src="<?php echo esc_url( $bg_video_url ); ?>"
				autoplay
				muted
				loop
				playsinline
				preload="metadata"
				<?php if ( $bg_image_id ) : ?>
					poster="<?php echo esc_url( wp_get_attachment_url( $bg_image_id ) ); ?>"
				<?php elseif ( $bg_image_url ) : ?>
					poster="<?php echo $bg_image_url; ?>"
				<?php endif; ?>
			></video>
		<?php elseif ( $bg_image_id ) : ?>
			<?php
			echo wp_get_attachment_image(
				$bg_image_id,
				'full',
				false,
				array_filter( [
					'loading'       => $loading,
					'decoding'      => 'async',
					'role'          => 'presentation',
					'alt'           => '',
					'fetchpriority' => $fetchpriority,
				] )
			);
			?>
		<?php elseif ( $bg_image_url ) : ?>
			<img
				src="<?php echo $bg_image_url; ?>"
				alt=""
				role="presentation"
				loading="<?php echo esc_attr( $loading ); ?>"
				decoding="async"
				<?php if ( $fetchpriority ) : ?>fetchpriority="high"<?php endif; ?>
			/>
		<?php endif; ?>
		<div
			class="hero-carousel__overlay"
			style="--overlay-opacity: <?php echo esc_attr( (string) $bg_overlay ); ?>"
		></div>
	</div>
	<div class="hero-carousel__content">
		<?php echo $content; ?>
	</div>
</div>
