<?php
function kotlinskidev_build_card_hover_style_vars( array $attributes, string $hover_bg_css_var ): string {
    $vars = [];

    $hover_bg = trim( (string) ( $attributes['cardHoverBackgroundColor'] ?? '' ) );
    if ( '' !== $hover_bg ) {
        $vars[ $hover_bg_css_var ] = $hover_bg;
    }

    if ( ! empty( $attributes['blurOtherCards'] ) ) {
        $blur_amount = trim( (string) ( $attributes['blurAmount'] ?? '' ) );
        if ( '' !== $blur_amount ) {
            $vars['--kt-blur-amount'] = $blur_amount;
        }
    }

    if ( empty( $vars ) ) {
        return '';
    }

    $declarations = [];
    foreach ( $vars as $property => $value ) {
        $declarations[] = $property . ':' . $value;
    }

    return implode( ';', $declarations ) . ';';
}
