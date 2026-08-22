<?php
$bg_image_id  = absint( $attributes['bgImageId'] ?? 0 );
$bg_image_url = esc_url( $attributes['bgImageUrl'] ?? '' );
$bg_video_url = esc_url( $attributes['bgVideoUrl'] ?? '' );
$bg_overlay   = min( 1.0, max( 0.0, (float) ( $attributes['bgOverlay'] ?? 0.4 ) ) );
$slide_index  = absint( $attributes['slideIndex'] ?? 0 );
$lazy_load    = (bool) ( $block->context['kotlinskidev/lazyLoad'] ?? false );
$poster_url   = $bg_image_id ? wp_get_attachment_url( $bg_image_id ) : $bg_image_url;

$is_eager = $slide_index === 0 && ! $lazy_load;

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'swiper-slide hero-carousel__slide',
] );

$content_spacing_styles = wp_style_engine_get_styles( [
	'spacing' => $attributes['style']['spacing'] ?? [],
] );
$content_style = ! empty( $content_spacing_styles['css'] ) ? ' style="' . esc_attr( $content_spacing_styles['css'] ) . '"' : '';
?>
<?php if ( $is_eager && $poster_url ) : ?>
<link rel="preload" as="image" fetchpriority="high" href="<?php echo esc_url( $poster_url ); ?>">
<?php endif; ?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>>
	<div class="hero-carousel__bg">
		<?php if ( $bg_video_url ) : ?>
			<video
				<?php if ( $is_eager ) : ?>
					src="<?php echo esc_url( $bg_video_url ); ?>"
					autoplay
					preload="auto"
					fetchpriority="high"
					<?php if ( $poster_url ) : ?>poster="<?php echo esc_url( $poster_url ); ?>"<?php endif; ?>
				<?php else : ?>
					data-src="<?php echo esc_url( $bg_video_url ); ?>"
					<?php if ( $poster_url ) : ?>data-poster="<?php echo esc_url( $poster_url ); ?>"<?php endif; ?>
				<?php endif; ?>
				muted
				loop
				playsinline
			></video>
		<?php elseif ( $bg_image_id ) : ?>
			<?php
			echo wp_get_attachment_image(
				$bg_image_id,
				'full',
				false,
				[
					'loading'       => $is_eager ? 'eager' : 'lazy',
					'decoding'      => 'async',
					'role'          => 'presentation',
					'alt'           => '',
					'fetchpriority' => $is_eager ? 'high' : 'auto',
				]
			);
			?>
		<?php elseif ( $bg_image_url ) : ?>
			<img
				src="<?php echo esc_url( $bg_image_url ); ?>"
				alt=""
				role="presentation"
				loading="<?php echo $is_eager ? 'eager' : 'lazy'; ?>"
				decoding="async"
				<?php if ( $is_eager ) : ?>fetchpriority="high"<?php endif; ?>
			/>
		<?php endif; ?>
		<div
			class="hero-carousel__overlay"
			style="--overlay-opacity: <?php echo esc_attr( (string) $bg_overlay ); ?>"
		></div>
	</div>
	<div class="hero-carousel__content"<?php echo $content_style; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on wp_style_engine_get_styles()'s own generated CSS ?>>
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $content is the block's already-rendered InnerBlocks HTML from WP core's own self-escaping block render pipeline ?>
	</div>
</div>
