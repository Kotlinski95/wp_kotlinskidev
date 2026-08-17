<?php
$model_url  = esc_url( $attributes['modelUrl'] ?? '' );
$poster_url = esc_url( $attributes['posterUrl'] ?? '' );

if ( '' === $model_url || '' === $poster_url ) {
	return;
}

$aria_label = sanitize_text_field(
	$attributes['ariaLabel'] ?? __( 'Interactive 3D model — click to open or close', 'kotlinskidev' )
);
if ( '' === $aria_label ) {
	$aria_label = __( 'Interactive 3D model — click to open or close', 'kotlinskidev' );
}

$clip_name        = sanitize_text_field( $attributes['clipName'] ?? '' );
if ( '' === $clip_name ) {
	$clip_name = 'open';
}
$background_color = sanitize_text_field( $attributes['backgroundColor'] ?? '' );
$aspect_ratio      = sanitize_text_field( $attributes['aspectRatio'] ?? '' );
if ( '' === $aspect_ratio ) {
	$aspect_ratio = '16/9';
}

$enable_orbit_controls = ! empty( $attributes['enableOrbitControls'] );
$screen_text           = sanitize_textarea_field( $attributes['screenText'] ?? '' );

$inline_style = '--model-viewer-aspect-ratio: ' . esc_attr( $aspect_ratio );
if ( $background_color ) {
	$inline_style .= '; --model-viewer-bg: ' . esc_attr( $background_color );
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'model-viewer',
	'style' => $inline_style,
] );
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>>
	<button
		type="button"
		class="model-viewer__trigger"
		aria-label="<?php echo esc_attr( $aria_label ); ?>"
		aria-pressed="false"
		data-model-url="<?php echo esc_url( $model_url ); ?>"
		data-clip-name="<?php echo esc_attr( $clip_name ); ?>"
		<?php if ( $enable_orbit_controls ) : ?>
			data-enable-orbit="true"
		<?php endif; ?>
		<?php if ( '' !== $screen_text ) : ?>
			data-screen-text="<?php echo esc_attr( $screen_text ); ?>"
		<?php endif; ?>
	>
		<canvas class="model-viewer__canvas" aria-hidden="true"></canvas>
		<img
			class="model-viewer__fallback"
			src="<?php echo esc_url( $poster_url ); ?>"
			alt=""
			loading="lazy"
			decoding="async"
		/>
	</button>
</div>
