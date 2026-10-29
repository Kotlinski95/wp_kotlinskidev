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
			if ( $mime_type && str_starts_with( $mime_type, 'video/' ) ) {
				$poster_id  = get_post_thumbnail_id( $image_id );
				$poster_url = $poster_id ? wp_get_attachment_image_url( $poster_id, 'full' ) : '';
				?>
				<video
					class="kt-device-frame__image"
					src="<?php echo esc_url( wp_get_attachment_url( $image_id ) ); ?>"
					<?php if ( $poster_url ) : ?>poster="<?php echo esc_url( $poster_url ); ?>"<?php endif; ?>
					muted
					loop
					autoplay
					playsinline
					preload="metadata"
				></video>
				<?php
			} else {
				echo wp_get_attachment_image(
					$image_id,
					'full',
					false,
					[
						'class'    => 'kt-device-frame__image',
						'loading'  => 'lazy',
						'decoding' => 'async',
						'alt'      => $alt,
					]
				);
			}
			?>
		</div>
		<?php if ( 'phone' === $device ) : ?>
			<div class="kt-device-frame__notch"></div>
		<?php endif; ?>
	</div>
</div>
