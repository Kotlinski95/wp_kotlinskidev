<?php
$label = $attributes['label'] ?? '';

echo '<span ' . get_block_wrapper_attributes() . '>' . wp_kses_post( $label ) . '</span>';
