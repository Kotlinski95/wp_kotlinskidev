<?php
$layout       = in_array( $attributes['layout'] ?? '', [ 'badge-grid', 'feature-cards', 'compact-strip' ], true ) ? $attributes['layout'] : 'badge-grid';
$view_all_url = esc_url_raw( $attributes['viewAllUrl'] ?? '' );

echo '<div ' . get_block_wrapper_attributes() . '>' . kotlinskidev_render_certificates_grid( $layout, $view_all_url ) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_certificates_grid() escapes every dynamic value at the point of output; get_block_wrapper_attributes() self-escapes
