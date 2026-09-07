<?php
$label = $attributes['label'] ?? '';
$label = ( '' !== $label && function_exists( 'pll__' ) ) ? pll__( $label ) : $label;

echo '<span ' . get_block_wrapper_attributes() . '>' . wp_kses_post( $label ) . '</span>';
