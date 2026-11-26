<?php
$canvas = kotlinskidev_feature_canvas_render_data( is_array( $attributes ?? null ) ? $attributes : [] );

$a11y_attributes = '' !== $canvas['description']
	? [
		'role'       => 'img',
		'aria-label' => $canvas['description'],
	]
	: [ 'aria-hidden' => 'true' ];

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'        => 'kt-feature-canvas kt-feature-canvas--' . $canvas['variant'],
	'style'        => 'aspect-ratio:' . $canvas['aspect_ratio'],
	'data-variant' => $canvas['variant'],
	'data-labels'  => (string) wp_json_encode( $canvas['labels'] ),
	'data-accent'  => $canvas['accent'],
	'data-touch-autoplay' => $canvas['touch_autoplay'] ? 'true' : 'false',
	'data-trigger' => $canvas['trigger'],
] + $a11y_attributes );
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>><canvas class="kt-feature-canvas__canvas" aria-hidden="true"></canvas></div>
