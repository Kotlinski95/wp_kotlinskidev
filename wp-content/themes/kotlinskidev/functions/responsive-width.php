<?php
function kotlinskidev_css_length_keywords(): array
{
    return [ 'auto', 'none', 'max-content', 'min-content', 'fit-content', 'stretch' ];
}

function kotlinskidev_sanitize_css_length( string $value ): string
{
    $value = trim( $value );

    if ( '' === $value || in_array( $value, kotlinskidev_css_length_keywords(), true ) ) {
        return $value;
    }

    if ( 1 !== preg_match( '/^-?\d*\.?\d+(px|%|rem|em|vw|vh)$/', $value ) ) {
        return '';
    }

    return $value;
}

function kotlinskidev_build_responsive_width_declarations( array $responsive_width ): array
{
    $declarations = [];

    foreach ( [ 'desktop', 'tablet', 'mobile' ] as $device ) {
        $device_settings = $responsive_width[ $device ] ?? [];
        if ( ! is_array( $device_settings ) ) {
            continue;
        }

        $width = kotlinskidev_sanitize_css_length( (string) ( $device_settings['width'] ?? '' ) );
        if ( '' !== $width ) {
            $declarations[] = "--kt-width-{$device}:{$width}";
        }

        $max_width = kotlinskidev_sanitize_css_length( (string) ( $device_settings['maxWidth'] ?? '' ) );
        if ( '' !== $max_width ) {
            $declarations[] = "--kt-max-width-{$device}:{$max_width}";
        }
    }

    return $declarations;
}

function kotlinskidev_apply_responsive_width_style( string $block_content, array $block ): string
{
    $responsive_width = $block['attrs']['responsiveWidth'] ?? null;

    if ( empty( $block_content ) || ! is_array( $responsive_width ) ) {
        return $block_content;
    }

    $declarations = kotlinskidev_build_responsive_width_declarations( $responsive_width );
    if ( empty( $declarations ) ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    if ( ! str_contains( $existing_class, 'kt-has-responsive-width' ) ) {
        $processor->set_attribute( 'class', trim( $existing_class . ' kt-has-responsive-width' ) );
    }

    $existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
    $existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . ';' : '';
    $processor->set_attribute( 'style', $existing_style . implode( ';', $declarations ) . ';' );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_responsive_width_style', 10, 2 );
