<?php
const KOTLINSKIDEV_SPEED_DIAL_DEFAULT_Z_INDEX = 999;
const KOTLINSKIDEV_SPEED_DIAL_MAX_Z_INDEX     = 2147482999;
const KOTLINSKIDEV_SPEED_DIAL_MIN_SIZE         = 2.0;
const KOTLINSKIDEV_SPEED_DIAL_MAX_SIZE         = 5.0;
const KOTLINSKIDEV_SPEED_DIAL_DEFAULT_TOGGLE_SIZE = 3.5;
const KOTLINSKIDEV_SPEED_DIAL_DEFAULT_ITEM_SIZE   = 3.0;
const KOTLINSKIDEV_SPEED_DIAL_ICON_PATH_REGEX = '/^[MmZzLlHhVvCcSsQqTtAa0-9eE.,+\s-]{1,1500}$/D';
const KOTLINSKIDEV_SPEED_DIAL_TRIGGER_REGEX   = '/^[a-z][a-zA-Z0-9]*(?::[a-zA-Z0-9_-]+){0,2}$/D';
const KOTLINSKIDEV_SPEED_DIAL_CORNERS         = [ 'bottom-right', 'bottom-left', 'top-right', 'top-left' ];
const KOTLINSKIDEV_SPEED_DIAL_DIRECTIONS      = [ 'up', 'down', 'left', 'right' ];
const KOTLINSKIDEV_SPEED_DIAL_DEVICES         = [ 'desktop', 'tablet', 'mobile' ];
const KOTLINSKIDEV_SPEED_DIAL_UNFILTERED_BLOCKS = [ 'core/html', 'wpcode/snippet' ];
const KOTLINSKIDEV_SPEED_DIAL_FORBIDDEN_TAGS    = [ 'script', 'iframe', 'form', 'object', 'embed' ];
const KOTLINSKIDEV_SPEED_DIAL_PROTOCOLS         = [ 'http', 'https', 'mailto', 'tel' ];

function kotlinskidev_speed_dial_tel_href( string $number ): string {
    $normalized = preg_replace( '/[^0-9+]/', '', $number ) ?? '';
    $has_plus   = str_starts_with( $normalized, '+' );
    $digits     = str_replace( '+', '', $normalized );

    if ( '' === $digits ) {
        return '';
    }

    return 'tel:' . ( $has_plus ? '+' : '' ) . $digits;
}

function kotlinskidev_speed_dial_z_index( mixed $value ): int {
    if ( ! is_int( $value ) ) {
        return KOTLINSKIDEV_SPEED_DIAL_DEFAULT_Z_INDEX;
    }

    return max( 1, min( KOTLINSKIDEV_SPEED_DIAL_MAX_Z_INDEX, $value ) );
}

function kotlinskidev_speed_dial_offset( mixed $value ): float {
    if ( ! is_int( $value ) && ! is_float( $value ) && ! ( is_string( $value ) && is_numeric( $value ) ) ) {
        return 1.0;
    }

    return max( 0.0, min( 10.0, (float) $value ) );
}

function kotlinskidev_speed_dial_offset_css( mixed $value ): string {
    return rtrim( rtrim( number_format( kotlinskidev_speed_dial_offset( $value ), 3, '.', '' ), '0' ), '.' ) . 'rem';
}

function kotlinskidev_speed_dial_size( mixed $value, float $default ): float {
    if ( ! is_int( $value ) && ! is_float( $value ) && ! ( is_string( $value ) && is_numeric( $value ) ) ) {
        return $default;
    }

    return max( KOTLINSKIDEV_SPEED_DIAL_MIN_SIZE, min( KOTLINSKIDEV_SPEED_DIAL_MAX_SIZE, (float) $value ) );
}

function kotlinskidev_speed_dial_size_css( mixed $value, float $default ): string {
    return rtrim( rtrim( number_format( kotlinskidev_speed_dial_size( $value, $default ), 3, '.', '' ), '0' ), '.' ) . 'rem';
}

function kotlinskidev_speed_dial_corner( mixed $value ): string {
    return is_string( $value ) && in_array( $value, KOTLINSKIDEV_SPEED_DIAL_CORNERS, true ) ? $value : 'bottom-right';
}

function kotlinskidev_speed_dial_layout_classes( array $position, string $direction ): array {
    $classes = [];

    foreach ( KOTLINSKIDEV_SPEED_DIAL_DEVICES as $device ) {
        $corner = kotlinskidev_speed_dial_corner( $position[ $device ] ?? null );

        if ( in_array( $direction, KOTLINSKIDEV_SPEED_DIAL_DIRECTIONS, true ) ) {
            $resolved = $direction;
        } else {
            $resolved = str_starts_with( $corner, 'top' ) ? 'down' : 'up';
        }

        $classes[] = 'kt-speed-dial--' . $device . '-' . $corner;
        $classes[] = 'kt-speed-dial--' . $device . '-' . $resolved;
    }

    return $classes;
}

function kotlinskidev_speed_dial_is_valid_trigger_action( string $action ): bool {
    return 1 === preg_match( KOTLINSKIDEV_SPEED_DIAL_TRIGGER_REGEX, $action );
}

function kotlinskidev_speed_dial_a11y_detected(): bool {
    return defined( 'KOTLINSKIDEV_A11Y_API' );
}

function kotlinskidev_speed_dial_a11y_available(): bool {
    return (bool) apply_filters( 'kotlinskidev_speed_dial_a11y_available', kotlinskidev_speed_dial_a11y_detected() );
}

function kotlinskidev_speed_dial_custom_allowed_blocks(): array {
    $blocks = [ 'core/html', 'core/shortcode' ];

    if ( class_exists( 'WP_Block_Type_Registry' ) && WP_Block_Type_Registry::get_instance()->is_registered( 'wpcode/snippet' ) ) {
        $blocks[] = 'wpcode/snippet';
    }

    $filtered = apply_filters( 'kotlinskidev_speed_dial_custom_allowed_blocks', $blocks );

    return is_array( $filtered ) ? array_values( array_filter( $filtered, 'is_string' ) ) : $blocks;
}

function kotlinskidev_speed_dial_strip_unsafe_html_rules( array $allowed ): array {
    $safe = [];

    foreach ( $allowed as $tag => $attributes ) {
        if ( ! is_string( $tag ) || in_array( strtolower( $tag ), KOTLINSKIDEV_SPEED_DIAL_FORBIDDEN_TAGS, true ) ) {
            continue;
        }

        $safe[ $tag ] = [];

        foreach ( is_array( $attributes ) ? $attributes : [] as $name => $rule ) {
            if ( is_string( $name ) && ! str_starts_with( strtolower( $name ), 'on' ) ) {
                $safe[ $tag ][ $name ] = $rule;
            }
        }
    }

    return $safe;
}

function kotlinskidev_speed_dial_custom_allowed_html(): array {
    $allowed = wp_kses_allowed_html( 'post' );
    $allowed = is_array( $allowed ) ? $allowed : [];

    $filtered = apply_filters( 'kotlinskidev_speed_dial_custom_allowed_html', $allowed );

    return kotlinskidev_speed_dial_strip_unsafe_html_rules( is_array( $filtered ) ? $filtered : $allowed );
}

function kotlinskidev_speed_dial_sanitize_custom_html( string $html ): string {
    return wp_kses( $html, kotlinskidev_speed_dial_custom_allowed_html(), KOTLINSKIDEV_SPEED_DIAL_PROTOCOLS );
}

function kotlinskidev_speed_dial_context_can_unfiltered_html( int $post_id ): bool {
    $post = $post_id > 0 ? get_post( $post_id ) : null;

    if ( is_object( $post ) && isset( $post->post_author ) ) {
        return user_can( (int) $post->post_author, 'unfiltered_html' );
    }

    return current_user_can( 'unfiltered_html' );
}

function kotlinskidev_speed_dial_block_permitted( string $block_name, int $post_id ): bool {
    return ! in_array( $block_name, KOTLINSKIDEV_SPEED_DIAL_UNFILTERED_BLOCKS, true ) || kotlinskidev_speed_dial_context_can_unfiltered_html( $post_id );
}

function kotlinskidev_speed_dial_icons(): array {
    static $icons = null;

    if ( null === $icons ) {
        $json  = file_get_contents( dirname( __DIR__ ) . '/src/blocks/speed-dial/icons.json' );
        $data  = false === $json ? null : json_decode( $json, true );
        $icons = is_array( $data ) ? $data : [];
    }

    return $icons;
}

function kotlinskidev_speed_dial_icon_svg( string $slug ): string {
    $paths = kotlinskidev_speed_dial_icons()[ $slug ] ?? null;

    if ( ! is_array( $paths ) || [] === $paths ) {
        return '';
    }

    $markup = '';
    foreach ( $paths as $path ) {
        if ( ! is_string( $path ) || 1 !== preg_match( KOTLINSKIDEV_SPEED_DIAL_ICON_PATH_REGEX, $path ) ) {
            return '';
        }
        $markup .= '<path d="' . esc_attr( $path ) . '"/>';
    }

    return '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' . $markup . '</svg>';
}

function kotlinskidev_speed_dial_safe_color( mixed $value ): string {
    if ( ! is_string( $value ) ) {
        return '';
    }

    $value = trim( $value );

    $patterns = [
        '/^var\(--wp--preset--(?:color|gradient)--[a-z0-9-]{1,60}\)$/',
        '/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/',
        '/^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s\/-]{1,60}\)$/',
        '/^(?:linear|radial)-gradient\([#0-9a-zA-Z%.,\s()\/-]{1,300}\)$/',
    ];

    foreach ( $patterns as $pattern ) {
        if ( 1 === preg_match( $pattern, $value ) ) {
            return $value;
        }
    }

    return '';
}

function kotlinskidev_speed_dial_translate( string $text ): string {
    return ( '' !== $text && function_exists( 'pll__' ) ) ? (string) pll__( $text ) : $text;
}

function kotlinskidev_speed_dial_localize_editor_data(): void {
    $handle = generate_block_asset_handle( 'kotlinskidev/speed-dial', 'editorScript' );

    if ( ! wp_script_is( $handle, 'registered' ) ) {
        return;
    }

    $data = [ 'customAllowedBlocks' => kotlinskidev_speed_dial_custom_allowed_blocks() ];

    wp_add_inline_script(
        $handle,
        'window.kotlinskidevSpeedDial = ' . wp_json_encode( $data ) . ';',
        'before'
    );
}
add_action( 'enqueue_block_editor_assets', 'kotlinskidev_speed_dial_localize_editor_data' );
