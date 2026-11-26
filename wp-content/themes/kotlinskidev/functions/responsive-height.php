<?php
require_once __DIR__ . '/responsive-block-markup.php';

function kotlinskidev_build_responsive_height_declarations( array $responsive_height ): array
{
    $declarations = [];

    foreach ( KOTLINSKIDEV_DEVICES_DESKTOP_FIRST as $device ) {
        $device_settings = $responsive_height[ $device ] ?? [];
        if ( ! is_array( $device_settings ) ) {
            continue;
        }

        $min_height = kotlinskidev_sanitize_css_length( (string) ( $device_settings['minHeight'] ?? '' ) );
        if ( '' !== $min_height ) {
            $declarations[] = "--kt-min-height-{$device}:{$min_height}";
        }
    }

    return $declarations;
}

function kotlinskidev_build_responsive_height_classes( array $responsive_height ): array
{
    $classes = [];
    $inherited = '';

    foreach ( KOTLINSKIDEV_DEVICES_DESKTOP_FIRST as $device ) {
        $device_settings = $responsive_height[ $device ] ?? [];
        $min_height = is_array( $device_settings )
            ? kotlinskidev_sanitize_css_length( (string) ( $device_settings['minHeight'] ?? '' ) )
            : '';

        $inherited = '' !== $min_height ? $min_height : $inherited;

        if ( '' !== $inherited ) {
            $classes[] = "kt-has-responsive-height-{$device}";
        }
    }

    return $classes;
}

function kotlinskidev_apply_responsive_height_style( string $block_content, array $block ): string
{
    $responsive_height = $block['attrs']['responsiveHeight'] ?? null;

    if ( empty( $block_content ) || ! is_array( $responsive_height ) ) {
        return $block_content;
    }

    $declarations = kotlinskidev_build_responsive_height_declarations( $responsive_height );
    $classes = kotlinskidev_build_responsive_height_classes( $responsive_height );
    if ( empty( $declarations ) || empty( $classes ) ) {
        return $block_content;
    }

    $processor = kotlinskidev_responsive_open_block_tag( $block_content );
    if ( null === $processor ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    $missing_classes = array_diff( $classes, explode( ' ', $existing_class ) );
    if ( ! empty( $missing_classes ) ) {
        $processor->set_attribute( 'class', trim( $existing_class . ' ' . implode( ' ', $missing_classes ) ) );
    }

    kotlinskidev_responsive_append_inline_declarations( $processor, $declarations );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_responsive_height_style', 10, 2 );
