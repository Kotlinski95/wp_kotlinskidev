<?php
function kotlinskidev_service_location_editor_panel_script(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    $screen = get_current_screen();

    if ( ! $screen || 'service_location' !== $screen->post_type ) {
        return;
    }

    $path = kotlinskidev_build_path( 'js', 'service-location-panel.js' );

    if ( ! file_exists( $path ) ) {
        return;
    }

    wp_enqueue_script(
        'kotlinskidev-service-location-panel',
        kotlinskidev_build_url( 'js', 'service-location-panel.js' ),
        [ 'wp-plugins', 'wp-edit-post', 'wp-editor', 'wp-element', 'wp-components', 'wp-data', 'wp-core-data', 'wp-i18n' ],
        (string) filemtime( $path ),
        true
    );
}
add_action( 'enqueue_block_editor_assets', 'kotlinskidev_service_location_editor_panel_script' );

function kotlinskidev_pre_determine_locale_for_block_renderer( ?string $locale ): ?string {
    if ( empty( $_GET['lang'] ) || empty( $_SERVER['REQUEST_URI'] ) || false === strpos( $_SERVER['REQUEST_URI'], '/wp/v2/block-renderer/' ) ) {
        return $locale;
    }

    if ( ! function_exists( 'PLL' ) || ! PLL()->model ) {
        return $locale;
    }

    $lang_slug = sanitize_key( wp_unslash( $_GET['lang'] ) );
    $language  = PLL()->model->get_language( $lang_slug );

    return $language ? $language->locale : $locale;
}
add_filter( 'pre_determine_locale', 'kotlinskidev_pre_determine_locale_for_block_renderer' );

function kotlinskidev_service_location_editor_preview_blocks(): array {
    $blocks = [];

    if ( kotlinskidev_feature_enabled( 'service_locations' ) ) {
        $blocks[] = [ 'name' => 'kotlinskidev/city-map', 'title' => __( 'City Map', 'kotlinskidev' ), 'icon' => 'location' ];
    }

    $blocks[] = [ 'name' => 'kotlinskidev/contact-card', 'title' => __( 'Contact Card', 'kotlinskidev' ), 'icon' => 'phone' ];

    return $blocks;
}

function kotlinskidev_get_post_language_rest_value( array $post ) {
    return function_exists( 'pll_get_post_language' ) ? pll_get_post_language( $post['id'] ) : '';
}

function kotlinskidev_register_post_language_rest_field(): void {
    foreach ( [ 'page', 'service_location' ] as $post_type ) {
        register_rest_field( $post_type, 'kotlinskidevLang', [
            'get_callback' => 'kotlinskidev_get_post_language_rest_value',
            'schema'       => [
                'type'    => 'string',
                'context' => [ 'edit' ],
            ],
        ] );
    }
}
add_action( 'init', 'kotlinskidev_register_post_language_rest_field' );

function kotlinskidev_service_location_editor_preview_block_script( array $block ): string {
    return 'wp.blocks.registerBlockType( ' . wp_json_encode( $block['name'] ) . ', {' .
        'title: ' . wp_json_encode( $block['title'] ) . ',' .
        'category: "kotlinskidev",' .
        'icon: ' . wp_json_encode( $block['icon'] ) . ',' .
        'edit: function () {' .
            'var post = wp.data.useSelect( function ( select ) { return select( "core/editor" ).getCurrentPost(); }, [] );' .
            'var lang = post && post.kotlinskidevLang ? post.kotlinskidevLang : undefined;' .
            'return wp.element.createElement( wp.serverSideRender, { block: ' . wp_json_encode( $block['name'] ) . ', urlQueryArgs: lang ? { lang: lang } : {} } );' .
        '},' .
        'save: function () { return null; },' .
    '} );';
}

function kotlinskidev_enqueue_service_location_editor_previews(): void {
    wp_enqueue_script( 'wp-blocks' );
    wp_enqueue_script( 'wp-element' );
    wp_enqueue_script( 'wp-server-side-render' );
    wp_enqueue_script( 'wp-dom-ready' );
    wp_enqueue_script( 'wp-data' );

    $script = 'wp.domReady( function () {';
    foreach ( kotlinskidev_service_location_editor_preview_blocks() as $block ) {
        $script .= kotlinskidev_service_location_editor_preview_block_script( $block );
    }
    $script .= '} );';

    wp_add_inline_script( 'wp-server-side-render', $script );
}
add_action( 'enqueue_block_editor_assets', 'kotlinskidev_enqueue_service_location_editor_previews' );
