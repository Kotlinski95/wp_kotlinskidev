<?php
$wrapper_background_color = sanitize_text_field( $attributes['wrapperBackgroundColor'] ?? '' );
$input_border_color       = sanitize_text_field( $attributes['inputBorderColor'] ?? '' );
$label_color              = sanitize_text_field( $attributes['labelColor'] ?? '' );

echo '<div ' . get_block_wrapper_attributes() . '>' . kotlinskidev_render_search_form_fresh_per_language( $wrapper_background_color, $input_border_color, $label_color ) . '</div>';
