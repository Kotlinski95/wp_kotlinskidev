<?php
$section = kotlinskidev_sanitize_city_local_section( $attributes['section'] ?? 'intro' );
$markup  = kotlinskidev_render_city_local_content( (int) get_the_ID(), $section );

if ( '' === $markup ) {
    return;
}

if ( 'faq' === $section ) {
    echo $markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- do_blocks() output of core/details blocks built from esc_html()'d values
    return;
}

echo '<div ' . get_block_wrapper_attributes( [ 'class' => 'kt-city-local kt-city-local--' . $section ] ) . '>' . $markup . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- markup is built from esc_html()/esc_url()'d values; get_block_wrapper_attributes() self-escapes
