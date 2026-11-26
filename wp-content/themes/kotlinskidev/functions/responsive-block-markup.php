<?php
const KOTLINSKIDEV_DEVICES_DESKTOP_FIRST = array( 'desktop', 'tablet', 'mobile' );
const KOTLINSKIDEV_DEVICES_MOBILE_FIRST  = array( 'mobile', 'tablet', 'desktop' );
const KOTLINSKIDEV_RESPONSIVE_CLASS_HASH_LENGTH = 10;

function kotlinskidev_responsive_open_block_tag( string $block_content ): ?WP_HTML_Tag_Processor
{
    $processor = new WP_HTML_Tag_Processor( $block_content );

    return $processor->next_tag() ? $processor : null;
}

function kotlinskidev_responsive_add_class_once( WP_HTML_Tag_Processor $processor, string $class ): void
{
    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    if ( ! str_contains( $existing_class, $class ) ) {
        $processor->set_attribute( 'class', trim( $existing_class . ' ' . $class ) );
    }
}

function kotlinskidev_responsive_append_inline_declarations( WP_HTML_Tag_Processor $processor, array $declarations ): void
{
    $existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
    $existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . ';' : '';
    $processor->set_attribute( 'style', $existing_style . implode( ';', $declarations ) . ';' );
}

function kotlinskidev_responsive_style_class( string $prefix, array $values ): string
{
    return $prefix . substr( md5( wp_json_encode( $values ) ), 0, KOTLINSKIDEV_RESPONSIVE_CLASS_HASH_LENGTH );
}
