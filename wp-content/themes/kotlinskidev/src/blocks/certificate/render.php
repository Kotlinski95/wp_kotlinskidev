<?php
$layout = in_array( $attributes['layout'] ?? '', [ 'badge-grid', 'feature-cards', 'compact-strip' ], true ) ? $attributes['layout'] : 'badge-grid';

$layout_classes = [
    'badge-grid'    => 'kt-certificate-badge-card kt-link-card kt-link-card--lift',
    'feature-cards' => 'kt-certificate-feature-card kt-link-card',
    'compact-strip' => 'kt-certificate-compact-pill kt-pill-link',
];

$wrapper_attrs = get_block_wrapper_attributes( [ 'class' => $layout_classes[ $layout ] ] );

echo kotlinskidev_render_certificate_embed( absint( $attributes['certificateId'] ?? 0 ), $layout, $wrapper_attrs ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_certificate_embed() renders trusted, already-escaped output; $wrapper_attrs comes from get_block_wrapper_attributes(), already esc_attr()'d internally
