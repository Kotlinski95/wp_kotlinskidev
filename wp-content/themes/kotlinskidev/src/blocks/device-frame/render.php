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
				if ( $is_eager && kotlinskidev_claim_lcp_slot( (string) $poster_url ) ) {
					$fetch_priority = 'high';
				}
				?>
				<video
					class="kt-device-frame__image"
					<?php if ( 'eager' === $loading ) : ?>
					src="<?php echo esc_url( wp_get_attachment_url( $image_id ) ); ?>"
					autoplay
					preload="auto"
					<?php else : ?>
					data-src="<?php echo esc_url( wp_get_attachment_url( $image_id ) ); ?>"
					preload="none"
					<?php endif; ?>
					<?php if ( $poster_url ) : ?><?php echo 'eager' === $loading ? 'poster' : 'data-poster'; ?>="<?php echo esc_url( $poster_url ); ?>"<?php endif; ?>
					<?php if ( '' !== $image_style ) : ?>style="<?php echo esc_attr( $image_style ); ?>"<?php endif; ?>
					fetchpriority="<?php echo esc_attr( $fetch_priority ); ?>"
					muted
					loop
					playsinline
				></video>
				<?php
			} else {
				if ( $is_eager && kotlinskidev_claim_lcp_slot( (string) wp_get_attachment_image_url( $image_id, 'full' ) ) ) {
					$fetch_priority = 'high';
				}
				echo wp_get_attachment_image(
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
