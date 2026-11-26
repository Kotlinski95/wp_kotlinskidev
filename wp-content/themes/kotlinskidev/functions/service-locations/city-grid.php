<?php
const KOTLINSKIDEV_CITY_GRID_MIN_COLUMNS = 1;
const KOTLINSKIDEV_CITY_GRID_MAX_COLUMNS = 6;

function kotlinskidev_clamp_city_grid_columns( $value ): int {
    return max( KOTLINSKIDEV_CITY_GRID_MIN_COLUMNS, min( KOTLINSKIDEV_CITY_GRID_MAX_COLUMNS, absint( $value ) ) );
}

function kotlinskidev_sanitize_city_grid_dimension( $value, string $default ): string {
    $value = trim( (string) $value );

    return preg_match( '/^-?[0-9.]+(px|rem|em)$/', $value ) ? $value : $default;
}

function kotlinskidev_city_grid_optional_color_vars( array $attributes ): array {
    $color_attributes = [
        'linkTextColor'       => '--kt-city-grid-link-color',
        'cardBackgroundColor' => '--kt-city-grid-card-bg',
        'cardBorderColor'     => '--kt-city-grid-card-border-color',
    ];

    $vars = [];
    foreach ( $color_attributes as $attribute => $variable ) {
        $color = trim( (string) ( $attributes[ $attribute ] ?? '' ) );
        if ( '' !== $color ) {
            $vars[ $variable ] = $color;
        }
    }

    return $vars;
}

function kotlinskidev_build_city_grid_style_vars( array $attributes = [] ): string {
    $vars = [
        '--kt-city-grid-columns-desktop' => (string) kotlinskidev_clamp_city_grid_columns( $attributes['columnsDesktop'] ?? 3 ),
        '--kt-city-grid-columns-tablet'  => (string) kotlinskidev_clamp_city_grid_columns( $attributes['columnsTablet'] ?? 2 ),
        '--kt-city-grid-columns-mobile'  => (string) kotlinskidev_clamp_city_grid_columns( $attributes['columnsMobile'] ?? 1 ),
        '--kt-city-grid-gap'             => kotlinskidev_sanitize_city_grid_dimension( $attributes['gridGap'] ?? '', '0.9375rem' ),
        '--kt-city-grid-card-border-width' => kotlinskidev_sanitize_city_grid_dimension( $attributes['cardBorderWidth'] ?? '', '0.125rem' ),
        '--kt-city-grid-card-radius'      => kotlinskidev_sanitize_city_grid_dimension( $attributes['cardBorderRadius'] ?? '', '1.125rem' ),
        '--kt-city-grid-card-padding'     => kotlinskidev_sanitize_city_grid_dimension( $attributes['cardPadding'] ?? '', '1.25rem' ),
    ];

    $vars = array_merge( $vars, kotlinskidev_city_grid_optional_color_vars( $attributes ) );

    $style = '';
    foreach ( $vars as $name => $value ) {
        $style .= $name . ':' . $value . ';';
    }

    return rtrim( $style, ';' );
}

function kotlinskidev_render_city_grid_cards( array $args = [] ): string {
    $exclude_id = (int) ( $args['exclude_id'] ?? 0 );
    $show_empty = (bool) ( $args['show_empty'] ?? true );

    $lang = function_exists( 'pll_current_language' ) ? pll_current_language() : false;

    $cards = '';
    foreach ( kotlinskidev_service_location_ready_ids( is_string( $lang ) ? $lang : '' ) as $post_id ) {
        if ( $post_id === $exclude_id ) {
            continue;
        }
        $cards .= sprintf(
            '<a href="%1$s" class="kt-city-grid__link"><span class="kt-city-grid__link-label">%2$s</span><span class="link-dark-variant-support kt-gradient-text kt-city-grid__link-arrow">&rarr;</span></a>',
            esc_url( get_permalink( $post_id ) ),
            esc_html( get_post_meta( $post_id, 'city', true ) )
        );
    }

    if ( '' === $cards && $show_empty ) {
        return '<div style="text-align:center;padding:3.75rem 0"><p style="color:var(--wp--preset--color--foreground-alt)">' . esc_html__( 'City pages will appear here soon.', 'kotlinskidev' ) . '</p></div>';
    }

    return $cards; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from esc_url()/esc_html()'d values above
}

function kotlinskidev_register_city_grid_block(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    register_block_type( get_template_directory() . '/src/blocks/city-grid' );
}
add_action( 'init', 'kotlinskidev_register_city_grid_block' );
