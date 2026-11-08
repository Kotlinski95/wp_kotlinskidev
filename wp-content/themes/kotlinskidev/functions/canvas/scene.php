<?php
function kotlinskidev_register_canvas_scene_post_type(): void {
    if ( ! kotlinskidev_feature_enabled( 'canvas_backgrounds' ) ) {
        return;
    }

    register_post_type( 'kt_canvas_scene', [
        'labels' => [
            'name'          => __( 'Canvas Scenes', 'kotlinskidev' ),
            'singular_name' => __( 'Canvas Scene', 'kotlinskidev' ),
            'add_new_item'  => __( 'Add New Canvas Scene', 'kotlinskidev' ),
            'edit_item'     => __( 'Edit Canvas Scene', 'kotlinskidev' ),
            'search_items'  => __( 'Search Canvas Scenes', 'kotlinskidev' ),
            'not_found'     => __( 'No canvas scenes found', 'kotlinskidev' ),
        ],
        'public'             => false,
        'publicly_queryable' => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_rest'       => true,
        'menu_icon'          => 'dashicons-art',
        'menu_position'      => 26,
        'supports'           => [ 'title', 'editor' ],
    ] );
}
add_action( 'init', 'kotlinskidev_register_canvas_scene_post_type' );

function kotlinskidev_register_canvas_scene_recipe_rest_field(): void {
    if ( ! kotlinskidev_feature_enabled( 'canvas_backgrounds' ) ) {
        return;
    }

    register_rest_field( 'kt_canvas_scene', 'canvas_recipe', [
        'get_callback' => function ( array $post ): array {
            return kotlinskidev_build_canvas_recipe( (int) $post['id'] );
        },
        'schema'       => [
            'type'    => 'object',
            'context' => [ 'view', 'edit' ],
        ],
    ] );
}
add_action( 'rest_api_init', 'kotlinskidev_register_canvas_scene_recipe_rest_field' );

function kotlinskidev_canvas_scene_layer_allowlist(): array {
    return [
        'kotlinskidev/canvas-layer-gradient',
        'kotlinskidev/canvas-layer-noise',
        'kotlinskidev/canvas-layer-grid-lines',
        'kotlinskidev/canvas-layer-blob',
        'kotlinskidev/canvas-layer-sweep',
        'kotlinskidev/canvas-layer-light-rays',
        'kotlinskidev/canvas-layer-curved-rays',
        'kotlinskidev/canvas-layer-star-field',
        'kotlinskidev/canvas-layer-orbit-trails',
        'kotlinskidev/canvas-layer-warp-field',
        'kotlinskidev/canvas-layer-nebula',
        'kotlinskidev/canvas-layer-aurora',
        'kotlinskidev/canvas-layer-neon-waves',
        'kotlinskidev/canvas-layer-hex-tiles',
        'kotlinskidev/canvas-layer-deep-field',
        'kotlinskidev/canvas-layer-floating-panels',
        'kotlinskidev/canvas-layer-pleiades',
    ];
}

function kotlinskidev_canvas_scene_layer_type( string $block_name ): string {
    return str_replace( 'kotlinskidev/canvas-layer-', '', $block_name );
}

function kotlinskidev_sanitize_canvas_color( $value, string $default ): string {
    if ( ! is_string( $value ) ) {
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

function kotlinskidev_sanitize_canvas_number( $value, float $min, float $max, float $default ): float {
    if ( ! is_numeric( $value ) ) {
        return $default;
    }

    $number = (float) $value;

    if ( ! is_finite( $number ) ) {
        return $default;
    }

    return max( $min, min( $max, $number ) );
}

function kotlinskidev_sanitize_canvas_layer_params( string $layer_type, array $attrs ): array {
    switch ( $layer_type ) {
        case 'gradient':
            return [
                'colorStart' => kotlinskidev_sanitize_canvas_color( $attrs['colorStart'] ?? null, 'var(--wp--preset--color--primary)' ),
                'colorEnd'   => kotlinskidev_sanitize_canvas_color( $attrs['colorEnd'] ?? null, 'var(--wp--preset--color--surface)' ),
                'angleDeg'   => kotlinskidev_sanitize_canvas_number( $attrs['angleDeg'] ?? null, 0, 360, 135 ),
                'speed'      => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 0.2 ),
            ];
        case 'noise':
            return [
                'opacity'      => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 0.3, 0.06 ),
                'jitterAmount' => kotlinskidev_sanitize_canvas_number( $attrs['jitterAmount'] ?? null, 0, 4, 1.0 ),
                'grainSize'    => (int) kotlinskidev_sanitize_canvas_number( $attrs['grainSize'] ?? null, 1, 4, 1 ),
            ];
        case 'grid-lines':
            return [
                'opacity'   => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 0.4, 0.08 ),
                'lineCount' => (int) kotlinskidev_sanitize_canvas_number( $attrs['lineCount'] ?? null, 2, 40, 12 ),
                'color'     => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, 'var(--wp--preset--color--surface)' ),
            ];
        case 'blob':
            return [
                'count'     => (int) kotlinskidev_sanitize_canvas_number( $attrs['count'] ?? null, 1, 8, 3 ),
                'speed'     => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 1.5, 0.3 ),
                'color'     => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, 'var(--wp--preset--color--primary-10)' ),
                'radiusPct' => kotlinskidev_sanitize_canvas_number( $attrs['radiusPct'] ?? null, 5, 60, 25 ),
            ];
        case 'sweep':
            return [
                'speed'    => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 1, 0.15 ),
                'angleDeg' => kotlinskidev_sanitize_canvas_number( $attrs['angleDeg'] ?? null, 0, 360, 25 ),
                'width'    => kotlinskidev_sanitize_canvas_number( $attrs['width'] ?? null, 0.02, 0.5, 0.15 ),
                'color'    => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, '#ffffff' ),
            ];
        case 'light-rays':
            return [
                'rayCount' => (int) kotlinskidev_sanitize_canvas_number( $attrs['rayCount'] ?? null, 1, 24, 8 ),
                'speed'    => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 0.3 ),
                'color'    => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, '#ffffff' ),
                'opacity'  => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 1, 0.5 ),
            ];
        case 'curved-rays':
            return [
                'rayCount' => (int) kotlinskidev_sanitize_canvas_number( $attrs['rayCount'] ?? null, 1, 32, 16 ),
                'speed'    => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 0.4 ),
                'color'    => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, '#cccccc' ),
                'opacity'  => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 1, 1 ),
            ];
        case 'star-field':
            return [
                'layerCount' => (int) kotlinskidev_sanitize_canvas_number( $attrs['layerCount'] ?? null, 3, 12, 7 ),
                'speed'      => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 1 ),
                'color'      => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, '#ffffff' ),
                'opacity'    => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 1, 1 ),
            ];
        case 'orbit-trails':
            return [
                'speed'   => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 1 ),
                'decay'   => kotlinskidev_sanitize_canvas_number( $attrs['decay'] ?? null, 0.9, 0.999, 0.986 ),
                'color'   => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, 'var(--wp--preset--color--foreground)' ),
                'opacity' => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 1, 1 ),
            ];
        case 'warp-field':
            return [
                'speed'   => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 1 ),
                'density' => kotlinskidev_sanitize_canvas_number( $attrs['density'] ?? null, 0.3, 2.5, 1 ),
                'color'   => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, 'var(--wp--preset--color--foreground)' ),
                'opacity' => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 1, 1 ),
            ];
        case 'nebula':
            return [
                'speed'   => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 1 ),
                'zoom'    => kotlinskidev_sanitize_canvas_number( $attrs['zoom'] ?? null, 0.5, 2, 1 ),
                'color'   => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, '#ffffff' ),
                'opacity' => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 1, 1 ),
            ];
        case 'aurora':
            return [
                'speed'      => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 1 ),
                'colorStart' => kotlinskidev_sanitize_canvas_color( $attrs['colorStart'] ?? null, '#8066ff' ),
                'colorEnd'   => kotlinskidev_sanitize_canvas_color( $attrs['colorEnd'] ?? null, '#99e6ff' ),
                'opacity'    => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 1, 1 ),
            ];
        case 'neon-waves':
            return [
                'speed'     => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 0.6 ),
                'intensity' => kotlinskidev_sanitize_canvas_number( $attrs['intensity'] ?? null, 1, 6, 3 ),
                'color'     => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, '#ffffff' ),
                'opacity'   => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 1, 1 ),
            ];
        case 'hex-tiles':
            return [
                'speed'   => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 1 ),
                'zoom'    => kotlinskidev_sanitize_canvas_number( $attrs['zoom'] ?? null, 0.5, 2, 1 ),
                'color'   => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, '#2b3a66' ),
                'opacity' => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 1, 1 ),
            ];
        case 'deep-field':
            return [
                'speed'     => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 1 ),
                'intensity' => kotlinskidev_sanitize_canvas_number( $attrs['intensity'] ?? null, 1, 6, 3 ),
                'color'     => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, '#ffffff' ),
                'opacity'   => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 1, 1 ),
            ];
        case 'floating-panels':
            return [
                'speed'      => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 1 ),
                'colorStart' => kotlinskidev_sanitize_canvas_color( $attrs['colorStart'] ?? null, '#03296b' ),
                'colorEnd'   => kotlinskidev_sanitize_canvas_color( $attrs['colorEnd'] ?? null, '#034291' ),
                'opacity'    => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 1, 1 ),
            ];
        case 'pleiades':
            return [
                'speed'     => kotlinskidev_sanitize_canvas_number( $attrs['speed'] ?? null, 0, 2, 1 ),
                'intensity' => kotlinskidev_sanitize_canvas_number( $attrs['intensity'] ?? null, 1, 4, 2.2 ),
                'color'     => kotlinskidev_sanitize_canvas_color( $attrs['color'] ?? null, '#ffffff' ),
                'opacity'   => kotlinskidev_sanitize_canvas_number( $attrs['opacity'] ?? null, 0, 1, 1 ),
            ];
        default:
            return [];
    }
}

function kotlinskidev_build_canvas_recipe( int $scene_id ): array {
    if ( ! kotlinskidev_feature_enabled( 'canvas_backgrounds' ) ) {
        return [];
    }

    $scene_id = $scene_id ? kotlinskidev_resolve_translatable_post_id( $scene_id ) : $scene_id;

    if ( ! $scene_id || 'publish' !== get_post_status( $scene_id ) || 'kt_canvas_scene' !== get_post_type( $scene_id ) ) {
        return [];
    }

    $cache_key = 'kotlinskidev_canvas_recipe_' . $scene_id;
    $cached    = get_transient( $cache_key );
    if ( is_array( $cached ) ) {
        return $cached;
    }

    $allowlist = kotlinskidev_canvas_scene_layer_allowlist();
    $blocks    = parse_blocks( (string) get_post_field( 'post_content', $scene_id ) );
    $layers    = [];

    foreach ( $blocks as $block ) {
        $block_name = $block['blockName'] ?? '';

        if ( ! in_array( $block_name, $allowlist, true ) ) {
            continue;
        }

        $layer_type = kotlinskidev_canvas_scene_layer_type( $block_name );
        $layers[]   = [
            'type'   => $layer_type,
            'params' => kotlinskidev_sanitize_canvas_layer_params( $layer_type, is_array( $block['attrs'] ?? null ) ? $block['attrs'] : [] ),
        ];
    }

    $recipe = [ 'layers' => $layers ];

    set_transient( $cache_key, $recipe, WEEK_IN_SECONDS );

    return $recipe;
}

function kotlinskidev_render_canvas_background_markup( int $scene_id ): string {
    $recipe = kotlinskidev_build_canvas_recipe( $scene_id );

    if ( empty( $recipe['layers'] ) ) {
        return '';
    }

    $json = wp_json_encode( $recipe );
    if ( ! $json ) {
        return '';
    }

    return '<div class="kt-canvas-bg" data-canvas-recipe="' . esc_attr( $json ) . '" aria-hidden="true"></div>';
}

function kotlinskidev_clear_canvas_recipe_cache( int $post_id ): void {
    if ( 'kt_canvas_scene' !== get_post_type( $post_id ) ) {
        return;
    }

    delete_transient( 'kotlinskidev_canvas_recipe_' . $post_id );
}
add_action( 'save_post_kt_canvas_scene', 'kotlinskidev_clear_canvas_recipe_cache' );
add_action( 'delete_post', 'kotlinskidev_clear_canvas_recipe_cache' );
