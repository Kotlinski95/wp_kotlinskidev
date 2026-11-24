<?php
$device_aspect_ratios = [
	'desktop' => '16/10',
	'tablet'  => '4/3',
	'phone'   => '9/19',
];

$device = sanitize_key( $attributes['device'] ?? 'desktop' );
if ( ! isset( $device_aspect_ratios[ $device ] ) ) {
	$device = 'desktop';
}

$image_id = absint( $attributes['imageId'] ?? 0 );
if ( ! $image_id ) {
	return;
}

$aspect_ratio = sanitize_text_field( $attributes['aspectRatio'] ?? '' );
if ( '' === $aspect_ratio ) {
	$aspect_ratio = $device_aspect_ratios[ $device ];
}

$alt = sanitize_text_field( $attributes['alt'] ?? '' );

$allowed_position_styles = [ 'angled', 'overlap', 'faded', 'peek-top' ];
$position_style          = sanitize_key( $attributes['positionStyle'] ?? '' );
if ( ! in_array( $position_style, $allowed_position_styles, true ) ) {
	$position_style = '';
}

$keep_effect_on_mobile = (bool) ( $attributes['keepEffectOnMobile'] ?? false );

$object_position = sanitize_text_field( $attributes['objectPosition'] ?? '' );
if ( 1 !== preg_match( '/^-?\d{1,3}% -?\d{1,3}%$/', $object_position ) ) {
	$object_position = '';
}
$image_style = '' !== $object_position ? 'object-position:' . esc_attr( $object_position ) . ';' : '';

$is_eager = kotlinskidev_is_above_fold( [
	'blockName' => 'kotlinskidev/device-frame',
	'attrs'     => $attributes,
] );
$loading  = $is_eager ? 'eager' : 'lazy';

$fetch_priority = 'auto';
if ( ! $is_eager && 'low' === sanitize_key( $attributes['fetchPriority'] ?? 'auto' ) ) {
	$fetch_priority = 'low';
}

$responsive_slots = is_array( $attributes['responsiveMedia'] ?? null ) ? $attributes['responsiveMedia'] : [];
$breakpoints      = kotlinskidev_get_breakpoints();

$enable_lightbox = (bool) ( $attributes['enableLightbox'] ?? false );

$wrapper_class = 'kt-device-frame kt-device-frame--' . $device;
if ( '' !== $position_style ) {
	$wrapper_class .= ' kt-device-frame--' . $position_style;
}
if ( $keep_effect_on_mobile ) {
	$wrapper_class .= ' kt-device-frame--mobile-preserve';
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => $wrapper_class,
	'style' => '--kt-device-frame-aspect-ratio: ' . esc_attr( $aspect_ratio ) . ';',
] );
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>>
	<div class="kt-device-frame__bezel">
		<div class="kt-device-frame__screen">
			<?php
			$mime_type = get_post_mime_type( $image_id );
			$is_video  = $mime_type && str_starts_with( $mime_type, 'video/' );

			$lightbox_modal_id = $enable_lightbox
				? kotlinskidev_register_device_frame_lightbox_media( $image_id, $is_video )
				: '';

			if ( $enable_lightbox ) :
				?>
				<button
					type="button"
					class="kt-device-frame__lightbox-trigger"
					data-kt-modal-target="<?php echo esc_attr( $lightbox_modal_id ); ?>"
					aria-label="<?php echo esc_attr( $is_video ? __( 'Expand video', 'kotlinskidev' ) : __( 'Expand image', 'kotlinskidev' ) ); ?>"
				>
				<?php
			endif;

			if ( $is_video ) {
				$poster_id  = get_post_thumbnail_id( $image_id );
				$poster_url = $poster_id ? wp_get_attachment_image_url( $poster_id, 'full' ) : '';
				$assets     = kotlinskidev_resolve_responsive_media_assets(
					[
						'src'       => (string) wp_get_attachment_url( $image_id ),
						'poster'    => (string) $poster_url,
						'poster_id' => (int) $poster_id,
					],
					$responsive_slots,
					'eager' !== $loading
				);
				$video_sources = array_map( static fn ( array $asset ): string => $asset['src'], $assets );
				$video_posters = array_map( static fn ( array $asset ): string => $asset['poster'], $assets );
				$has_src_variant    = kotlinskidev_responsive_media_has_overrides( $video_sources );
				$has_poster_variant = '' !== $video_posters['desktop'] && kotlinskidev_responsive_media_has_overrides( $video_posters );
				$lazy_attributes    = 'eager' !== $loading || $has_src_variant || $has_poster_variant;
				$video_meta   = wp_get_attachment_metadata( $image_id );
				$video_width  = is_array( $video_meta ) ? absint( $video_meta['width'] ?? 0 ) : 0;
				$video_height = is_array( $video_meta ) ? absint( $video_meta['height'] ?? 0 ) : 0;
				$use_poster_image = $is_eager && $lazy_attributes && $poster_id && '' !== $video_posters['desktop'];
				$poster_sizes     = '(max-width: ' . (int) $breakpoints['mobile_max'] . 'px) 100vw, 50vw';
				$poster_srcsets   = [];
				if ( $use_poster_image ) {
					$poster_srcsets            = kotlinskidev_responsive_media_poster_srcsets( $responsive_slots, $video_posters );
					$poster_srcsets['desktop'] = (string) wp_get_attachment_image_srcset( $poster_id, 'full' );
				}
				$lcp_entries = kotlinskidev_responsive_media_preload_entries( $video_posters, $poster_srcsets, $use_poster_image ? $poster_sizes : '', $breakpoints );
				if ( $is_eager && kotlinskidev_claim_lcp_slot( $lcp_entries ) ) {
					$fetch_priority = 'high';
				}
				if ( $use_poster_image ) {
					$poster_markup = wp_get_attachment_image(
						$poster_id,
						'full',
						false,
						[
							'class'         => 'kt-device-frame__poster',
							'loading'       => 'eager',
							'decoding'      => 'async',
							'fetchpriority' => $fetch_priority,
							'sizes'         => $poster_sizes,
							'alt'           => '',
							'role'          => 'presentation',
							'style'         => $image_style,
						]
					);
					echo $has_poster_variant // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image() self-escapes; picture sources built from esc_attr()/esc_url()'d values
						? kotlinskidev_responsive_media_picture( $poster_markup, $video_posters, $breakpoints, $poster_srcsets, $poster_sizes, kotlinskidev_responsive_media_source_dimensions( $responsive_slots, 'posterId' ) )
						: $poster_markup;
					$fetch_priority = 'auto';
				}
				?>
				<video
					class="kt-device-frame__image"
					<?php if ( $video_width && $video_height ) : ?>width="<?php echo (int) $video_width; ?>" height="<?php echo (int) $video_height; ?>"<?php endif; ?>
					<?php if ( ! $lazy_attributes ) : ?>
					src="<?php echo esc_url( $video_sources['desktop'] ); ?>"
					autoplay
					preload="auto"
					<?php else : ?>
					data-src="<?php echo esc_url( $video_sources['desktop'] ); ?>"
					preload="none"
					<?php endif; ?>
					<?php if ( $poster_url && ! $use_poster_image ) : ?><?php echo $lazy_attributes ? 'data-poster' : 'poster'; ?>="<?php echo esc_url( $poster_url ); ?>"<?php endif; ?>
					<?php echo kotlinskidev_responsive_media_data_attributes( $video_sources, 'src' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- each value passed through esc_url() ?>
					<?php if ( ! $use_poster_image ) : ?><?php echo kotlinskidev_responsive_media_data_attributes( $video_posters, 'poster' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- each value passed through esc_url() ?><?php endif; ?>
					<?php if ( '' !== $image_style ) : ?>style="<?php echo esc_attr( $image_style ); ?>"<?php endif; ?>
					fetchpriority="<?php echo esc_attr( $fetch_priority ); ?>"
					muted
					loop
					playsinline
				></video>
				<?php
			} else {
				$desktop_image_url = (string) wp_get_attachment_image_url( $image_id, 'full' );
				$image_resolved    = kotlinskidev_resolve_responsive_media( $desktop_image_url, $responsive_slots );
				$image_has_variant = kotlinskidev_responsive_media_has_overrides( $image_resolved );
				$image_sizes       = '';
				$image_srcsets     = [];
				$image_preloads    = [ [ 'href' => $desktop_image_url ] ];
				if ( $image_has_variant ) {
					$image_sizes              = (string) wp_get_attachment_image_sizes( $image_id, 'full' );
					$image_srcsets            = kotlinskidev_responsive_media_srcsets( $responsive_slots, $image_resolved );
					$image_srcsets['desktop'] = (string) wp_get_attachment_image_srcset( $image_id, 'full' );
					$image_preloads           = kotlinskidev_responsive_media_preload_entries( $image_resolved, $image_srcsets, $image_sizes, $breakpoints );
				}
				if ( $is_eager && kotlinskidev_claim_lcp_slot( $image_preloads ) ) {
					$fetch_priority = 'high';
				}
				$image_markup = wp_get_attachment_image(
					$image_id,
					'full',
					false,
					[
						'class'         => 'kt-device-frame__image',
						'loading'       => $loading,
						'fetchpriority' => $fetch_priority,
						'decoding'      => 'async',
						'alt'           => $alt,
						'style'         => $image_style,
					]
				);
				echo $image_has_variant // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image() self-escapes; picture sources built from esc_attr()/esc_url()'d values
					? kotlinskidev_responsive_media_picture( $image_markup, $image_resolved, $breakpoints, $image_srcsets, $image_sizes, kotlinskidev_responsive_media_source_dimensions( $responsive_slots ) )
					: $image_markup;
			}

			if ( $enable_lightbox ) :
				?>
				</button>
				<?php
			endif;
			?>
		</div>
		<?php if ( 'phone' === $device ) : ?>
			<div class="kt-device-frame__notch"></div>
		<?php endif; ?>
	</div>
</div>
