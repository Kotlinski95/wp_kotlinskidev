<?php
require_once __DIR__ . '/responsive-block-markup.php';

function kotlinskidev_sanitize_font_size_length( string $value ): string
{
    $value = trim( $value );

    if ( '' === $value ) {
        return '';
    }

    if ( 1 !== preg_match( '/^\d*\.?\d+(px|%|rem|em|vw|vh)$/', $value ) ) {
        return '';
    }

    return $value;
}

function kotlinskidev_collect_responsive_font_sizes( array $font_sizes ): array
{
    $values = [];

    foreach ( KOTLINSKIDEV_DEVICES_MOBILE_FIRST as $device ) {
        $sanitized = kotlinskidev_sanitize_font_size_length( (string) ( $font_sizes[ $device ] ?? '' ) );
        if ( '' !== $sanitized ) {
            $values[ $device ] = $sanitized;
        }
    }

    return $values;
}

function kotlinskidev_responsive_font_size_class( array $values ): string
{
    return kotlinskidev_responsive_style_class( 'kt-rfs-', $values );
}

function kotlinskidev_build_responsive_font_size_css( string $class, array $values ): string
{
    $media_queries = kotlinskidev_get_css_breakpoints();
    $css = '';

    foreach ( KOTLINSKIDEV_DEVICES_MOBILE_FIRST as $device ) {
        if ( empty( $values[ $device ] ) ) {
            continue;
        }

        $css .= "{$media_queries[ $device ]}{." . $class . "{font-size:{$values[ $device ]} !important}}";
    }

    return $css;
}

function kotlinskidev_apply_responsive_font_size_style( string $block_content, array $block ): string
{
    $font_sizes = $block['attrs']['responsiveFontSize'] ?? null;

    if ( empty( $block_content ) || ! is_array( $font_sizes ) ) {
        return $block_content;
    }

    $values = kotlinskidev_collect_responsive_font_sizes( $font_sizes );
    if ( empty( $values ) ) {
        return $block_content;
    }

    $class = kotlinskidev_responsive_font_size_class( $values );
    $css   = kotlinskidev_build_responsive_font_size_css( $class, $values );
    if ( '' === $css ) {
        return $block_content;
    }

    $processor = kotlinskidev_responsive_open_block_tag( $block_content );
    if ( null === $processor ) {
        return $block_content;
    }

    kotlinskidev_responsive_add_class_once( $processor, $class );

    return kotlinskidev_append_responsive_style( $processor->get_updated_html(), $class, $css );
}
add_filter( 'render_block', 'kotlinskidev_apply_responsive_font_size_style', 10, 2 );
