<?php
require_once __DIR__ . '/responsive-block-markup.php';

const KOTLINSKIDEV_RESPONSIVE_DISPLAY_PROPERTIES = array(
    'display',
    'flexDirection',
    'justifyContent',
    'alignItems',
    'justifySelf',
    'alignSelf',
);

function kotlinskidev_responsive_display_device_classes( string $device, $device_settings ): array
{
    if ( ! is_array( $device_settings ) ) {
        return [];
    }

    $classes = [];

    foreach ( KOTLINSKIDEV_RESPONSIVE_DISPLAY_PROPERTIES as $property ) {
        if ( ! empty( $device_settings[ $property ] ) ) {
            $classes[] = $device . ':' . sanitize_html_class( $device_settings[ $property ] );
        }
    }

    return $classes;
}

function kotlinskidev_responsive_display_classes( $responsive_display ): array
{
    $classes = [];

    foreach ( KOTLINSKIDEV_DEVICES_DESKTOP_FIRST as $device ) {
        $device_classes = kotlinskidev_responsive_display_device_classes( $device, $responsive_display[ $device ] ?? null );
        $classes        = array_merge( $classes, $device_classes );
    }

    return $classes;
}

function kotlinskidev_add_responsive_display_attributes( $block_content, $block )
{
    if ( ! isset( $block['attrs']['responsiveDisplay'] ) ) {
        return $block_content;
    }

    $classes = kotlinskidev_responsive_display_classes( $block['attrs']['responsiveDisplay'] );
    if ( empty( $classes ) ) {
        return $block_content;
    }

    $processor = kotlinskidev_responsive_open_block_tag( $block_content );
    if ( null === $processor ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    $processor->set_attribute( 'class', trim( $existing_class . ' ' . implode( ' ', $classes ) ) );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_add_responsive_display_attributes', 10, 2 );

function kotlinskidev_apply_block_visibility( string $block_content, array $block ): string
{
    $visibility = $block['attrs']['visibility'] ?? 'both';

    if ( 'both' === $visibility || empty( $block_content ) ) {
        return $block_content;
    }

    $processor = kotlinskidev_responsive_open_block_tag( $block_content );
    if ( null === $processor ) {
        return $block_content;
    }

    kotlinskidev_responsive_add_class_once( $processor, 'is-visible-' . sanitize_html_class( $visibility ) );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_block_visibility', 10, 2 );
