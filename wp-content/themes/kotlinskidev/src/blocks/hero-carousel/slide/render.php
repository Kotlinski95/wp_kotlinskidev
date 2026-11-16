<?php
$bg_image_id  = absint( $attributes['bgImageId'] ?? 0 );
$bg_image_url = esc_url( $attributes['bgImageUrl'] ?? '' );
$bg_video_url = esc_url( $attributes['bgVideoUrl'] ?? '' );
$bg_video_alpha_url = esc_url( $attributes['bgVideoAlphaUrl'] ?? '' );
$bg_overlay   = min( 1.0, max( 0.0, (float) ( $attributes['bgOverlay'] ?? 0.4 ) ) );
$slide_index  = absint( $attributes['slideIndex'] ?? 0 );
$poster_url   = $bg_image_id ? wp_get_attachment_url( $bg_image_id ) : $bg_image_url;

$is_above_fold = (bool) ( $block->context['kotlinskidev/aboveFold'] ?? false );
$is_eager      = 0 === $slide_index && $is_above_fold;
$poster_sizes  = 'max(100vw, 800px)';
$responsive_slots = is_array( $attributes['responsiveMedia'] ?? null ) ? $attributes['responsiveMedia'] : [];
if ( $bg_video_alpha_url ) {
	$responsive_slots = kotlinskidev_responsive_media_alpha_slots( $responsive_slots );
}
$breakpoints      = kotlinskidev_get_breakpoints();
$has_video        = $bg_image_id && $bg_video_url;
$assets           = kotlinskidev_resolve_responsive_media_assets(
	[
		'src'       => $bg_video_url,
		'poster'    => (string) $poster_url,
		'poster_id' => $bg_image_id,
	],
	$responsive_slots,
	$has_video && ! $is_eager
);
$alpha_sources    = $bg_video_alpha_url ? kotlinskidev_responsive_media_alpha_sources( $bg_video_alpha_url, $responsive_slots ) : [];
$video_sources    = array_map( static fn ( array $asset ): string => $asset['src'], $assets );
$video_posters    = array_map( static fn ( array $asset ): string => $asset['poster'], $assets );
$has_src_variant  = $bg_video_url && kotlinskidev_responsive_media_has_overrides( $video_sources );
$has_poster_variant = $has_video && kotlinskidev_responsive_media_has_overrides( $video_posters ) && '' !== $video_posters['desktop'];
$use_poster_image = $is_eager && $has_video;
$use_picture      = $use_poster_image && $has_poster_variant;
$poster_srcset    = $use_poster_image ? (string) wp_get_attachment_image_srcset( $bg_image_id, 'full' ) : '';
$lcp_entries      = [];

if ( ! $bg_video_url && $bg_image_id ) {
	$image_posters = kotlinskidev_resolve_responsive_media( (string) $poster_url, $responsive_slots );
	$image_picture = kotlinskidev_responsive_media_has_overrides( $image_posters );
} else {
	$image_posters = [];
	$image_picture = false;
}

if ( $use_picture ) {
	$poster_srcsets            = kotlinskidev_responsive_media_poster_srcsets( $responsive_slots, $video_posters );
	$poster_srcsets['desktop'] = $poster_srcset;
	$poster_sizes              = '100vw';
	$lcp_entries               = kotlinskidev_responsive_media_preload_entries( $video_posters, $poster_srcsets, $poster_sizes, $breakpoints );
} elseif ( $image_picture ) {
	$poster_sizes              = '100vw';
	$poster_srcsets            = kotlinskidev_responsive_media_srcsets( $responsive_slots, $image_posters );
	$poster_srcsets['desktop'] = (string) wp_get_attachment_image_srcset( $bg_image_id, 'full' );
	$lcp_entries               = kotlinskidev_responsive_media_preload_entries( $image_posters, $poster_srcsets, $poster_sizes, $breakpoints );
	$image_attributes_sizes    = [ 'sizes' => $poster_sizes ];
} else {
	$lcp_entries = [
		[
			'href'   => (string) $poster_url,
			'srcset' => $poster_srcset,
			'sizes'  => '' !== $poster_srcset ? $poster_sizes : '',
		],
	];
}

$is_high = $is_eager && kotlinskidev_claim_lcp_slot( $lcp_entries, 'hero-carousel-slide-' . $slide_index );
$eager_video_src   = $is_eager && ! $has_src_variant;

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'swiper-slide hero-carousel__slide',
] );

$content_spacing_styles = wp_style_engine_get_styles( [
	'spacing' => $attributes['style']['spacing'] ?? [],
] );
$content_css = $content_spacing_styles['css'] ?? '';

$block_gap = $attributes['style']['spacing']['blockGap'] ?? null;
if ( is_string( $block_gap ) && '' !== $block_gap ) {
	$gap_value = preg_match( '/^var:preset\|spacing\|(.+)$/', $block_gap, $preset_match )
		? 'var(--wp--preset--spacing--' . $preset_match[1] . ')'
		: $block_gap;
	$content_css .= 'gap:' . $gap_value . ';';
}

$content_style = '' !== $content_css ? ' style="' . esc_attr( $content_css ) . '"' : '';
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>>
	<div class="hero-carousel__bg<?php echo $bg_video_alpha_url ? ' hero-carousel__bg--alpha' : ''; ?>">
		<?php if ( $bg_video_url ) : ?>
			<?php
			if ( $use_poster_image ) {
				$poster_markup = wp_get_attachment_image(
					$bg_image_id,
					'full',
					false,
					[
						'class'         => 'hero-carousel__poster',
						'loading'       => 'eager',
						'decoding'      => 'async',
						'fetchpriority' => $is_high ? 'high' : 'auto',
						'sizes'         => $poster_sizes,
						'alt'           => '',
						'role'          => 'presentation',
					]
				);
				echo $use_picture // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image() self-escapes; picture sources built from esc_attr()/esc_url()'d values
					? kotlinskidev_responsive_media_picture( $poster_markup, $video_posters, $breakpoints, $poster_srcsets, $poster_sizes )
					: $poster_markup;
			}
			?>
			<video
				<?php if ( $eager_video_src ) : ?>
					src="<?php echo esc_url( $bg_video_url ); ?>"
					preload="none"
					<?php if ( $poster_url && ! $use_poster_image ) : ?>poster="<?php echo esc_url( $poster_url ); ?>"<?php endif; ?>
				<?php else : ?>
					data-src="<?php echo esc_url( $bg_video_url ); ?>"
					<?php if ( $is_eager ) : ?>preload="none"<?php endif; ?>
					<?php if ( $poster_url && ! $use_poster_image ) : ?>data-poster="<?php echo esc_url( $poster_url ); ?>"<?php endif; ?>
					<?php echo kotlinskidev_responsive_media_data_attributes( $video_sources, 'src' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- each value passed through esc_url() ?>
					<?php if ( ! $use_poster_image ) : ?><?php echo kotlinskidev_responsive_media_data_attributes( $video_posters, 'poster' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- each value passed through esc_url() ?><?php endif; ?>
				<?php endif; ?>
				<?php if ( $bg_video_alpha_url ) : ?>data-src-alpha="<?php echo esc_url( $bg_video_alpha_url ); ?>"<?php echo kotlinskidev_responsive_media_data_attributes( $alpha_sources, 'src-alpha' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- each value passed through esc_url() ?><?php endif; ?>
				muted
				loop
				playsinline
			></video>
		<?php elseif ( $bg_image_id ) : ?>
			<?php
			$image_markup = wp_get_attachment_image(
				$bg_image_id,
				'full',
				false,
				[
					'loading'       => $is_eager ? 'eager' : 'lazy',
					'decoding'      => 'async',
					'role'          => 'presentation',
					'alt'           => '',
					'fetchpriority' => $is_high ? 'high' : 'auto',
				] + ( $image_attributes_sizes ?? [] )
			);
			echo $image_picture // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image() self-escapes; picture sources built from esc_attr()/esc_url()'d values
				? kotlinskidev_responsive_media_picture( $image_markup, $image_posters, $breakpoints, kotlinskidev_responsive_media_srcsets( $responsive_slots, $image_posters ), '100vw' )
				: $image_markup;
			?>
		<?php elseif ( $bg_image_url ) : ?>
			<img
				src="<?php echo esc_url( $bg_image_url ); ?>"
				alt=""
				role="presentation"
				loading="<?php echo $is_eager ? 'eager' : 'lazy'; ?>"
				decoding="async"
				<?php if ( $is_high ) : ?>fetchpriority="high"<?php endif; ?>
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
