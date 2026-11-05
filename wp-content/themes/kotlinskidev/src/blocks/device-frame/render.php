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

$fetch_priority = sanitize_key( $attributes['fetchPriority'] ?? 'auto' );
if ( ! in_array( $fetch_priority, [ 'auto', 'high', 'low' ], true ) ) {
	$fetch_priority = 'auto';
}

$loading = sanitize_key( $attributes['loading'] ?? 'lazy' );
if ( ! in_array( $loading, [ 'lazy', 'eager' ], true ) ) {
	$loading = 'lazy';
}
if ( 'high' === $fetch_priority ) {
	$loading = 'eager';
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
				?>
				<video
					class="kt-device-frame__image"
					src="<?php echo esc_url( wp_get_attachment_url( $image_id ) ); ?>"
					<?php if ( $poster_url ) : ?>poster="<?php echo esc_url( $poster_url ); ?>"<?php endif; ?>
					<?php if ( '' !== $image_style ) : ?>style="<?php echo esc_attr( $image_style ); ?>"<?php endif; ?>
					fetchpriority="<?php echo esc_attr( $fetch_priority ); ?>"
					muted
					loop
					autoplay
					playsinline
					preload="<?php echo esc_attr( 'eager' === $loading ? 'auto' : 'metadata' ); ?>"
				></video>
				<?php
			} else {
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
