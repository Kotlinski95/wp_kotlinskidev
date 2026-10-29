<?php
$label = $attributes['label'] ?? '';
$label = ( '' !== $label && function_exists( 'pll__' ) ) ? pll__( $label ) : $label;

echo '<span ' . get_block_wrapper_attributes() . '><span class="kt-content-tabs-nav-link__label">' . wp_kses_post( $label ) . '</span></span>';
