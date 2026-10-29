<?php
$variant = $attributes['variant'] ?? 'fixed';

echo '<div ' . get_block_wrapper_attributes( [ 'class' => 'kt-scroll-to-top--' . esc_attr( $variant ) ] ) . '>'
    . kotlinskidev_scroll_to_top_markup( $variant, $attributes ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built entirely from esc_attr()/esc_html()/kotlinskidev_inline_nav_icon()'s own escaping, no raw user input
    . '</div>';
