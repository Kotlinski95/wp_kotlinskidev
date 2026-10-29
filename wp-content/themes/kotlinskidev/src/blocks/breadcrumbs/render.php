<?php
if ( is_front_page() && empty( $attributes['showOnHomepage'] ) ) {
    return;
}

$trail = kotlinskidev_get_breadcrumb_trail();
$html  = kotlinskidev_render_breadcrumb_trail( $trail );

if ( '' === $html ) {
    return;
}

echo '<div ' . get_block_wrapper_attributes( [ 'class' => 'kt-breadcrumbs' ] ) . '>' . $html . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $html escaped in kotlinskidev_render_breadcrumb_trail(); get_block_wrapper_attributes() self-escapes
