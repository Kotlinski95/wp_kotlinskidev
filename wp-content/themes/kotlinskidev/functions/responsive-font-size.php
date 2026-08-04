<?php
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

    foreach ( [ 'mobile', 'tablet', 'desktop' ] as $device ) {
        $sanitized = kotlinskidev_sanitize_font_size_length( (string) ( $font_sizes[ $device ] ?? '' ) );
        if ( '' !== $sanitized ) {
            $values[ $device ] = $sanitized;
        }
    }

    return $values;
}

function kotlinskidev_responsive_font_size_class( array $values ): string
{
    return 'kt-rfs-' . substr( md5( wp_json_encode( $values ) ), 0, 10 );
}

function kotlinskidev_build_responsive_font_size_css( string $class, array $values ): string
{
    $media_queries = kotlinskidev_get_css_breakpoints();
    $css = '';

    foreach ( [ 'mobile', 'tablet', 'desktop' ] as $device ) {
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

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    if ( ! str_contains( $existing_class, $class ) ) {
        $processor->set_attribute( 'class', trim( $existing_class . ' ' . $class ) );
    }

    return $processor->get_updated_html() . '<style>' . $css . '</style>';
}
add_filter( 'render_block', 'kotlinskidev_apply_responsive_font_size_style', 10, 2 );
