<?php
$wrapper_attrs = get_block_wrapper_attributes( [
    'style' => kotlinskidev_build_search_results_style_vars( $attributes ),
] );

echo '<div ' . $wrapper_attrs . '>' . kotlinskidev_render_search_results_fresh_per_language(
    ! empty( $attributes['blurOtherCards'] ),
    trim( (string) ( $attributes['cardHoverBackgroundColor'] ?? '' ) ),
    trim( (string) ( $attributes['blurAmount'] ?? '' ) )
) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_search_results_fresh_per_language() escapes every dynamic value at the point of output; get_block_wrapper_attributes() self-escapes
