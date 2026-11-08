<?php
$wrapper_attrs = get_block_wrapper_attributes( [
    'class' => 'kt-city-grid',
    'style' => kotlinskidev_build_city_grid_style_vars( $attributes ),
] );

echo '<div ' . $wrapper_attrs . '>' . kotlinskidev_render_city_grid_cards() . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_city_grid_cards() escapes every dynamic value at the point of output; get_block_wrapper_attributes() self-escapes
