<?php
const KOTLINSKIDEV_LOAD_MORE_DEFAULT_RADIUS = 6;

function kotlinskidev_sanitize_load_more_color( string $color ): string
{
    return sanitize_hex_color( $color ) ?: sanitize_text_field( $color );
}

function kotlinskidev_apply_load_more_attributes( string $block_content, array $block ): string
{
    if ( 'core/group' !== ( $block['blockName'] ?? '' ) ) {
        return $block_content;
    }

    $load_more = $block['attrs']['loadMore'] ?? null;
    if ( empty( $block_content ) || ! is_array( $load_more ) || empty( $load_more['enabled'] ) ) {
        return $block_content;
    }

    $initial_count = absint( $load_more['initialCount'] ?? 0 );
    if ( $initial_count < 1 ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' ) ?? '';
    if ( ! str_contains( $existing_class, 'kt-has-load-more' ) ) {
        $processor->set_attribute( 'class', trim( $existing_class . ' kt-has-load-more' ) );
    }

    $processor->set_attribute( 'data-kt-load-more-initial', (string) $initial_count );

    $button_label = sanitize_text_field( (string) ( $load_more['buttonLabel'] ?? '' ) );
    if ( '' !== $button_label ) {
        if ( function_exists( 'pll__' ) ) {
            $button_label = pll__( $button_label );
        }
        $processor->set_attribute( 'data-kt-load-more-label', $button_label );
    }

    $button_align = sanitize_key( (string) ( $load_more['buttonAlign'] ?? 'left' ) );
    if ( in_array( $button_align, array( 'center', 'right' ), true ) ) {
        $processor->set_attribute( 'data-kt-load-more-align', $button_align );
    }

    $text_color = kotlinskidev_sanitize_load_more_color( (string) ( $load_more['textColor'] ?? '' ) );
    if ( '' !== $text_color ) {
        $processor->set_attribute( 'data-kt-load-more-text-color', $text_color );
    }

    $background_color = kotlinskidev_sanitize_load_more_color( (string) ( $load_more['backgroundColor'] ?? '' ) );
    if ( '' !== $background_color ) {
        $processor->set_attribute( 'data-kt-load-more-bg-color', $background_color );
    }

    $border_color = kotlinskidev_sanitize_load_more_color( (string) ( $load_more['borderColor'] ?? '' ) );
    if ( '' !== $border_color ) {
        $processor->set_attribute( 'data-kt-load-more-border-color', $border_color );
    }

    $border_width = absint( $load_more['borderWidth'] ?? 0 );
    if ( $border_width > 0 ) {
        $processor->set_attribute( 'data-kt-load-more-border-width', (string) $border_width );
    }

    $border_radius = absint( $load_more['borderRadius'] ?? 0 );
    if ( $border_radius > 0 && KOTLINSKIDEV_LOAD_MORE_DEFAULT_RADIUS !== $border_radius ) {
        $processor->set_attribute( 'data-kt-load-more-border-radius', (string) $border_radius );
    }

    $hover_text_color = kotlinskidev_sanitize_load_more_color( (string) ( $load_more['hoverTextColor'] ?? '' ) );
    if ( '' !== $hover_text_color ) {
        $processor->set_attribute( 'data-kt-load-more-hover-text-color', $hover_text_color );
    }

    $hover_background_color = kotlinskidev_sanitize_load_more_color( (string) ( $load_more['hoverBackgroundColor'] ?? '' ) );
    if ( '' !== $hover_background_color ) {
        $processor->set_attribute( 'data-kt-load-more-hover-bg-color', $hover_background_color );
    }

    $hover_border_color = kotlinskidev_sanitize_load_more_color( (string) ( $load_more['hoverBorderColor'] ?? '' ) );
    if ( '' !== $hover_border_color ) {
        $processor->set_attribute( 'data-kt-load-more-hover-border-color', $hover_border_color );
    }

    if ( ! empty( $load_more['underline'] ) ) {
        $processor->set_attribute( 'data-kt-load-more-underline', '1' );
    }

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_load_more_attributes', 10, 2 );
