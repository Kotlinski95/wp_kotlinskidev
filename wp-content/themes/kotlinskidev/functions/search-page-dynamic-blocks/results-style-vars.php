<?php
function kotlinskidev_search_results_color_variables( array $attributes ): array {
    $vars = [];

    $color_attribute_map = [
        'cardTextColor'              => '--kt-search-results-grid-card-text-color',
        'cardBorderColor'            => '--kt-search-results-grid-card-border-color',
        'cardBackgroundColor'        => '--kt-search-results-grid-card-bg',
        'buttonBackgroundColor'      => '--kt-search-results-grid-button-bg',
        'buttonTextColor'            => '--kt-search-results-grid-button-text-color',
        'buttonHoverBackgroundColor' => '--kt-search-results-grid-button-hover-bg',
        'buttonHoverTextColor'       => '--kt-search-results-grid-button-hover-text-color',
        'cardHoverBackgroundColor'   => '--kt-search-results-grid-card-hover-bg',
    ];

    foreach ( $color_attribute_map as $attribute_key => $css_var ) {
        $color_value = trim( (string) ( $attributes[ $attribute_key ] ?? '' ) );
        if ( '' !== $color_value ) {
            $vars[ $css_var ] = $color_value;
        }
    }

    return $vars;
}

function kotlinskidev_search_results_blur_variables( array $attributes ): array {
    if ( empty( $attributes['blurOtherCards'] ) ) {
        return [];
    }

    $blur_amount = trim( (string) ( $attributes['blurAmount'] ?? '' ) );
    return '' !== $blur_amount ? [ '--kt-blur-amount' => $blur_amount ] : [];
}

function kotlinskidev_build_search_results_style_vars( array $attributes = [] ): string {
    $vars = array_merge(
        kotlinskidev_search_results_color_variables( $attributes ),
        kotlinskidev_search_results_blur_variables( $attributes )
    );

    if ( empty( $vars ) ) {
        return '';
    }

    $declarations = [];
    foreach ( $vars as $property => $value ) {
        $declarations[] = $property . ':' . $value;
    }

    return implode( ';', $declarations ) . ';';
}
