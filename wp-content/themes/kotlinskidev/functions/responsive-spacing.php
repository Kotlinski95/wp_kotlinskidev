<?php
function kotlinskidev_sanitize_spacing_length( string $value, bool $allow_negative ): string
{
    $value = trim( $value );

    if ( '' === $value || '0px' === $value ) {
        return '';
    }

    $pattern = $allow_negative ? '/^-?\d*\.?\d+(px|%|rem|em|vw|vh)$/' : '/^\d*\.?\d+(px|%|rem|em|vw|vh)$/';
    if ( 1 !== preg_match( $pattern, $value ) ) {
        return '';
    }

    return $value;
}

function kotlinskidev_collect_responsive_spacing_values( array $block_attrs ): array
{
    $values = [];

    foreach ( [ 'desktop', 'tablet', 'mobile' ] as $device ) {
        foreach ( [ 'Padding' => 'padding', 'Margin' => 'margin' ] as $type => $property ) {
            $side_values = $block_attrs[ "{$device}{$type}" ] ?? null;
            if ( ! is_array( $side_values ) ) {
                continue;
            }

            foreach ( [ 'top', 'right', 'bottom', 'left' ] as $side ) {
                $raw = (string) ( $side_values[ $side ] ?? '' );
                $sanitized = kotlinskidev_sanitize_spacing_length( $raw, 'margin' === $property );
                if ( '' !== $sanitized ) {
                    $values[ $device ][ $property ][ $side ] = $sanitized;
                }
            }
        }
    }

    return $values;
}

function kotlinskidev_responsive_spacing_class( array $values ): string
{
    return 'kt-rspc-' . substr( md5( wp_json_encode( $values ) ), 0, 10 );
}

function kotlinskidev_build_responsive_spacing_css( string $class, array $values ): string
{
    $media_queries = kotlinskidev_get_css_breakpoints();
    $css = '';

    foreach ( [ 'desktop', 'tablet', 'mobile' ] as $device ) {
        if ( empty( $values[ $device ] ) ) {
            continue;
        }

        $declarations = '';
        foreach ( [ 'padding', 'margin' ] as $property ) {
            if ( empty( $values[ $device ][ $property ] ) ) {
                continue;
            }
            foreach ( $values[ $device ][ $property ] as $side => $value ) {
                $declarations .= "{$property}-{$side}:{$value} !important;";
            }
        }

        if ( '' === $declarations ) {
            continue;
        }

        $css .= "{$media_queries[ $device ]}{." . $class . "{" . $declarations . '}}';
    }

    return $css;
}

function kotlinskidev_apply_responsive_spacing_style( string $block_content, array $block ): string
{
    $attrs = $block['attrs'] ?? [];

    if ( empty( $block_content ) || empty( $attrs ) ) {
        return $block_content;
    }

    $values = kotlinskidev_collect_responsive_spacing_values( $attrs );
    if ( empty( $values ) ) {
        return $block_content;
    }

    $class = kotlinskidev_responsive_spacing_class( $values );
    $css   = kotlinskidev_build_responsive_spacing_css( $class, $values );
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
add_filter( 'render_block', 'kotlinskidev_apply_responsive_spacing_style', 10, 2 );
