<?php
function kotlinskidev_build_responsive_height_declarations( array $responsive_height ): array
{
    $declarations = [];

    foreach ( [ 'desktop', 'tablet', 'mobile' ] as $device ) {
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

    foreach ( [ 'desktop', 'tablet', 'mobile' ] as $device ) {
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

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    $missing_classes = array_diff( $classes, explode( ' ', $existing_class ) );
    if ( ! empty( $missing_classes ) ) {
        $processor->set_attribute( 'class', trim( $existing_class . ' ' . implode( ' ', $missing_classes ) ) );
    }

    $existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
    $existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . ';' : '';
    $processor->set_attribute( 'style', $existing_style . implode( ';', $declarations ) . ';' );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_responsive_height_style', 10, 2 );
