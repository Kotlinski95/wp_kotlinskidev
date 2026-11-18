<?php
$layout       = in_array( $attributes['layout'] ?? '', [ 'badge-grid', 'feature-cards', 'compact-strip' ], true ) ? $attributes['layout'] : 'badge-grid';
$view_all_url = esc_url_raw( $attributes['viewAllUrl'] ?? '' );

$blur_other_cards = ! empty( $attributes['blurOtherCards'] );
$blur_amount      = $blur_other_cards ? trim( (string) ( $attributes['blurAmount'] ?? '' ) ) : '';

$wrapper_attrs = get_block_wrapper_attributes( '' !== $blur_amount ? [ 'style' => '--kt-blur-amount:' . $blur_amount . ';' ] : [] );

echo '<div ' . $wrapper_attrs . '>' . kotlinskidev_render_certificates_grid( $layout, $view_all_url, $blur_other_cards ) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_certificates_grid() escapes every dynamic value at the point of output; get_block_wrapper_attributes() self-escapes
