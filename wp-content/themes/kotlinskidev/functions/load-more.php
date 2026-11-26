<?php
const KOTLINSKIDEV_LOAD_MORE_DEFAULT_RADIUS = 6;

const KOTLINSKIDEV_LOAD_MORE_FONT_WEIGHTS = array( '400', '500', '600', '700', '800' );
const KOTLINSKIDEV_LOAD_MORE_LETTER_SPACINGS = array( 'none', 'wide', 'wider' );
const KOTLINSKIDEV_LOAD_MORE_TEXT_TRANSFORMS = array( 'none', 'uppercase', 'capitalize' );
const KOTLINSKIDEV_LOAD_MORE_ALIGNMENTS = array( 'center', 'right' );

const KOTLINSKIDEV_LOAD_MORE_PADDING_Y_MIN = 0.25;
const KOTLINSKIDEV_LOAD_MORE_PADDING_Y_MAX = 2.0;
const KOTLINSKIDEV_LOAD_MORE_PADDING_X_MIN = 0.5;
const KOTLINSKIDEV_LOAD_MORE_PADDING_X_MAX = 4.0;

function kotlinskidev_clamp_load_more_padding( mixed $value, float $min, float $max ): ?string
{
    if ( ! is_numeric( $value ) ) {
        return null;
    }

    return (string) round( min( $max, max( $min, (float) $value ) ), 2 );
}

function kotlinskidev_sanitize_load_more_color( string $color ): string
{
    return sanitize_hex_color( $color ) ?: sanitize_text_field( $color );
}

function kotlinskidev_load_more_button_label( array $load_more ): string
{
    $button_label = sanitize_text_field( (string) ( $load_more['buttonLabel'] ?? '' ) );
    if ( '' !== $button_label && function_exists( 'pll__' ) ) {
        $button_label = pll__( $button_label );
    }

    return $button_label;
}

function kotlinskidev_load_more_button_alignment( array $load_more ): string
{
    $button_align = sanitize_key( (string) ( $load_more['buttonAlign'] ?? 'left' ) );

    return in_array( $button_align, KOTLINSKIDEV_LOAD_MORE_ALIGNMENTS, true ) ? $button_align : '';
}

function kotlinskidev_load_more_font_size( array $load_more ): string
{
    $font_size = (string) ( $load_more['fontSize'] ?? '' );

    return 1 === preg_match( '/^[a-z0-9-]{1,32}$/', $font_size ) ? $font_size : '';
}

function kotlinskidev_load_more_allowed_choice( array $load_more, string $key, array $allowed_values ): string
{
    $value = (string) ( $load_more[ $key ] ?? '' );

    return in_array( $value, $allowed_values, true ) ? $value : '';
}

function kotlinskidev_load_more_color( array $load_more, string $key ): string
{
    return kotlinskidev_sanitize_load_more_color( (string) ( $load_more[ $key ] ?? '' ) );
}

function kotlinskidev_load_more_positive_integer( array $load_more, string $key ): string
{
    $number = absint( $load_more[ $key ] ?? 0 );

    return $number > 0 ? (string) $number : '';
}

function kotlinskidev_load_more_border_radius( array $load_more ): string
{
    $border_radius = absint( $load_more['borderRadius'] ?? 0 );

    return $border_radius > 0 && KOTLINSKIDEV_LOAD_MORE_DEFAULT_RADIUS !== $border_radius ? (string) $border_radius : '';
}

function kotlinskidev_load_more_data_attributes( array $load_more, int $initial_count ): array
{
    return array(
        'data-kt-load-more-initial'            => (string) $initial_count,
        'data-kt-load-more-label'              => kotlinskidev_load_more_button_label( $load_more ),
        'data-kt-load-more-align'              => kotlinskidev_load_more_button_alignment( $load_more ),
        'data-kt-load-more-font-size'          => kotlinskidev_load_more_font_size( $load_more ),
        'data-kt-load-more-font-weight'        => kotlinskidev_load_more_allowed_choice( $load_more, 'fontWeight', KOTLINSKIDEV_LOAD_MORE_FONT_WEIGHTS ),
        'data-kt-load-more-letter-spacing'     => kotlinskidev_load_more_allowed_choice( $load_more, 'letterSpacing', KOTLINSKIDEV_LOAD_MORE_LETTER_SPACINGS ),
        'data-kt-load-more-text-transform'     => kotlinskidev_load_more_allowed_choice( $load_more, 'textTransform', KOTLINSKIDEV_LOAD_MORE_TEXT_TRANSFORMS ),
        'data-kt-load-more-padding-y'          => kotlinskidev_clamp_load_more_padding( $load_more['paddingY'] ?? null, KOTLINSKIDEV_LOAD_MORE_PADDING_Y_MIN, KOTLINSKIDEV_LOAD_MORE_PADDING_Y_MAX ),
        'data-kt-load-more-padding-x'          => kotlinskidev_clamp_load_more_padding( $load_more['paddingX'] ?? null, KOTLINSKIDEV_LOAD_MORE_PADDING_X_MIN, KOTLINSKIDEV_LOAD_MORE_PADDING_X_MAX ),
        'data-kt-load-more-text-color'         => kotlinskidev_load_more_color( $load_more, 'textColor' ),
        'data-kt-load-more-bg-color'           => kotlinskidev_load_more_color( $load_more, 'backgroundColor' ),
        'data-kt-load-more-border-color'       => kotlinskidev_load_more_color( $load_more, 'borderColor' ),
        'data-kt-load-more-border-width'       => kotlinskidev_load_more_positive_integer( $load_more, 'borderWidth' ),
        'data-kt-load-more-border-radius'      => kotlinskidev_load_more_border_radius( $load_more ),
        'data-kt-load-more-hover-text-color'   => kotlinskidev_load_more_color( $load_more, 'hoverTextColor' ),
        'data-kt-load-more-hover-bg-color'     => kotlinskidev_load_more_color( $load_more, 'hoverBackgroundColor' ),
        'data-kt-load-more-hover-border-color' => kotlinskidev_load_more_color( $load_more, 'hoverBorderColor' ),
        'data-kt-load-more-underline'          => empty( $load_more['underline'] ) ? '' : '1',
    );
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

    foreach ( kotlinskidev_load_more_data_attributes( $load_more, $initial_count ) as $name => $value ) {
        if ( null !== $value && '' !== $value ) {
            $processor->set_attribute( $name, $value );
        }
    }

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_load_more_attributes', 10, 2 );
