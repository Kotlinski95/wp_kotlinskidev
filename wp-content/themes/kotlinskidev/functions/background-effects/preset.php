<?php
function kotlinskidev_register_bg_effect_preset_post_type(): void {
    register_post_type( 'kt_bg_effect_preset', [
        'labels' => [
            'name'          => __( 'Background Effect Presets', 'kotlinskidev' ),
            'singular_name' => __( 'Background Effect Preset', 'kotlinskidev' ),
            'add_new_item'  => __( 'Add New Background Effect Preset', 'kotlinskidev' ),
            'edit_item'     => __( 'Edit Background Effect Preset', 'kotlinskidev' ),
            'search_items'  => __( 'Search Background Effect Presets', 'kotlinskidev' ),
            'not_found'     => __( 'No background effect presets found', 'kotlinskidev' ),
        ],
        'public'             => false,
        'publicly_queryable' => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_rest'       => true,
        'menu_icon'          => 'dashicons-art',
        'menu_position'      => 27,
        'supports'           => [ 'title', 'editor' ],
    ] );
}
add_action( 'init', 'kotlinskidev_register_bg_effect_preset_post_type' );

function kotlinskidev_bg_effect_types(): array {
    return [ 'gradient-shift', 'aurora', 'wave', 'shimmer-text', 'glow-border' ];
}

function kotlinskidev_bg_effect_preset_settings_block(): string {
    return 'kotlinskidev/bg-effect-preset-settings';
}

function kotlinskidev_bg_effect_default_duration( string $effect_type ): float {
    switch ( $effect_type ) {
        case 'aurora':
            return 12.0;
        case 'wave':
            return 8.0;
        case 'shimmer-text':
        case 'glow-border':
            return 6.0;
        default:
            return 15.0;
    }
}

function kotlinskidev_sanitize_bg_effect_color( $value, string $default ): string {
    if ( ! is_string( $value ) || '' === trim( $value ) ) {
        return $default;
    }

    $value = trim( $value );

    $hex = sanitize_hex_color( $value );
    if ( $hex ) {
        return $hex;
    }

    if ( 1 === preg_match( '/^#[0-9a-fA-F]{8}$/', $value ) ) {
        return strtolower( $value );
    }

    if ( 1 === preg_match( '/^var\(--wp--preset--color--[a-z0-9-]+\)$/', $value ) ) {
        return $value;
    }

    return $default;
}

function kotlinskidev_sanitize_bg_effect_number( $value, float $min, float $max, float $default ): float {
    if ( ! is_numeric( $value ) ) {
        return $default;
    }

    $number = (float) $value;

    if ( ! is_finite( $number ) ) {
        return $default;
    }

    return max( $min, min( $max, $number ) );
}

function kotlinskidev_restrict_bg_effect_preset_settings_block_to_preset_editor( $allowed_block_types, $editor_context ) {
    $post = $editor_context->post ?? null;

    if ( $post instanceof WP_Post && 'kt_bg_effect_preset' === $post->post_type ) {
        return $allowed_block_types;
    }

    $registered = array_keys( WP_Block_Type_Registry::get_instance()->get_all_registered() );
    $allowed    = true === $allowed_block_types ? $registered : $allowed_block_types;

    return array_values( array_diff( $allowed, [ kotlinskidev_bg_effect_preset_settings_block() ] ) );
}
add_filter( 'allowed_block_types_all', 'kotlinskidev_restrict_bg_effect_preset_settings_block_to_preset_editor', 10, 2 );

function kotlinskidev_build_bg_effect_preset( int $preset_id ): array {
    $preset_id = $preset_id ? kotlinskidev_resolve_translatable_post_id( $preset_id ) : $preset_id;

    if ( ! $preset_id || 'publish' !== get_post_status( $preset_id ) || 'kt_bg_effect_preset' !== get_post_type( $preset_id ) ) {
        return [];
    }

    $cache_key = 'kotlinskidev_bg_effect_preset_' . $preset_id;
    $cached    = get_transient( $cache_key );
    if ( is_array( $cached ) ) {
        return $cached;
    }

    $blocks = parse_blocks( (string) get_post_field( 'post_content', $preset_id ) );
    $result = [];

    foreach ( $blocks as $block ) {
        if ( kotlinskidev_bg_effect_preset_settings_block() !== ( $block['blockName'] ?? '' ) ) {
            continue;
        }

        $attrs       = is_array( $block['attrs'] ?? null ) ? $block['attrs'] : [];
        $effect_type = in_array( $attrs['effectType'] ?? '', kotlinskidev_bg_effect_types(), true )
            ? $attrs['effectType']
            : 'gradient-shift';

        $result = [
            'effectType' => $effect_type,
            'color1'     => kotlinskidev_sanitize_bg_effect_color( $attrs['color1'] ?? null, '' ),
            'color2'     => kotlinskidev_sanitize_bg_effect_color( $attrs['color2'] ?? null, '' ),
            'color3'     => kotlinskidev_sanitize_bg_effect_color( $attrs['color3'] ?? null, '' ),
            'duration'   => kotlinskidev_sanitize_bg_effect_number(
                $attrs['duration'] ?? null,
                1,
                30,
                kotlinskidev_bg_effect_default_duration( $effect_type )
            ),
        ];

        break;
    }

    set_transient( $cache_key, $result, WEEK_IN_SECONDS );

    return $result;
}

function kotlinskidev_clear_bg_effect_preset_cache( int $post_id ): void {
    if ( 'kt_bg_effect_preset' !== get_post_type( $post_id ) ) {
        return;
    }

    delete_transient( 'kotlinskidev_bg_effect_preset_' . $post_id );
}
add_action( 'save_post_kt_bg_effect_preset', 'kotlinskidev_clear_bg_effect_preset_cache' );
add_action( 'delete_post', 'kotlinskidev_clear_bg_effect_preset_cache' );
