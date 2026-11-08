<?php
$wrapper_attrs = get_block_wrapper_attributes( [
    'style' => kotlinskidev_build_card_hover_style_vars( $attributes, '--kt-post-card-grid-card-hover-bg' ),
] );

echo '<div ' . $wrapper_attrs . '>' . kotlinskidev_render_category_posts_grid_fresh_per_language( ! empty( $attributes['blurOtherCards'] ) ) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_category_posts_grid_fresh_per_language() escapes every dynamic value at the point of output; get_block_wrapper_attributes() self-escapes
