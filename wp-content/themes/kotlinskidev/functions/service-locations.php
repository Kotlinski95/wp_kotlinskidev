<?php
function kotlinskidev_register_service_location_post_type(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    register_post_type( 'service_location', [
        'labels' => [
            'name'          => __( 'Service Locations', 'kotlinskidev' ),
            'singular_name' => __( 'Service Location', 'kotlinskidev' ),
            'add_new_item'  => __( 'Add New City Page', 'kotlinskidev' ),
            'edit_item'     => __( 'Edit City Page', 'kotlinskidev' ),
            'search_items'  => __( 'Search City Pages', 'kotlinskidev' ),
            'not_found'     => __( 'No city pages found', 'kotlinskidev' ),
        ],
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_rest'       => true,
        'menu_icon'          => 'dashicons-location-alt',
        'menu_position'      => 22,
        'supports'           => [ 'title', 'editor', 'thumbnail', 'custom-fields' ],
        'has_archive'        => false,
        'rewrite'            => [ 'slug' => 'tworzenie-stron-www', 'with_front' => false ],
    ] );
}
add_action( 'init', 'kotlinskidev_register_service_location_post_type' );

function kotlinskidev_register_service_location_meta(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    register_post_meta( 'service_location', 'city', [
        'type'              => 'string',
        'single'            => true,
        'show_in_rest'      => true,
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback'     => function () {
            return current_user_can( 'edit_posts' );
        },
    ] );
}
add_action( 'init', 'kotlinskidev_register_service_location_meta' );

function kotlinskidev_service_location_faq_summary_strings(): array {
    return [
        'Ile trwa realizacja strony internetowej?',
        'Czy spotkamy się w %CITY%?',
        'Co obejmuje opieka po wdrożeniu?',
        'Czy strona będzie widoczna w Google?',
        'Kto tworzy treści na stronę?',
    ];
}

function kotlinskidev_register_service_location_faq_summary_strings(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    if ( ! function_exists( 'pll_register_string' ) ) {
        return;
    }
    foreach ( kotlinskidev_service_location_faq_summary_strings() as $string ) {
        pll_register_string( $string, $string, 'kotlinskidev' );
    }
}
add_action( 'init', 'kotlinskidev_register_service_location_faq_summary_strings' );

function kotlinskidev_apply_service_location_faq_summaries( string $block_content, array $block ): string {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return $block_content;
    }

    if ( 'core/details' !== ( $block['blockName'] ?? '' ) ) {
        return $block_content;
    }

    foreach ( kotlinskidev_service_location_faq_summary_strings() as $string ) {
        if ( false === strpos( $block_content, $string ) ) {
            continue;
        }

        $translated = function_exists( 'pll__' ) ? pll__( $string ) : $string;

        if ( false !== strpos( $string, '%CITY%' ) ) {
            $city = (string) get_post_meta( get_the_ID(), 'city', true );
            if ( '' === $city ) {
                continue;
            }
            $translated = str_replace( '%CITY%', esc_html( $city ), $translated );
        }

        $block_content = str_replace( $string, $translated, $block_content );
    }

    return $block_content;
}
add_filter( 'render_block', 'kotlinskidev_apply_service_location_faq_summaries', 10, 2 );

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

function kotlinskidev_service_location_slug_translations(): array {
    return [
        'en' => 'creating-websites',
    ];
}

function kotlinskidev_register_service_location_translated_rewrite_rules(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    foreach ( kotlinskidev_service_location_slug_translations() as $lang => $slug ) {
        $lang = sanitize_key( $lang );
        $slug = sanitize_title( $slug );
        add_rewrite_rule( '^' . $lang . '/' . $slug . '/([^/]+)/?$', 'index.php?service_location=$matches[1]&lang=' . $lang, 'top' );
    }

    $default_lang = function_exists( 'pll_default_language' ) ? sanitize_key( (string) pll_default_language() ) : '';
    $post_type    = get_post_type_object( 'service_location' );
    $default_base = $post_type && is_array( $post_type->rewrite ) ? sanitize_title( (string) ( $post_type->rewrite['slug'] ?? '' ) ) : '';

    if ( '' !== $default_lang && '' !== $default_base && ! isset( kotlinskidev_service_location_slug_translations()[ $default_lang ] ) ) {
        add_rewrite_rule( '^' . $default_base . '/([^/]+)/?$', 'index.php?service_location=$matches[1]&lang=' . $default_lang, 'top' );
    }
}
add_action( 'init', 'kotlinskidev_register_service_location_translated_rewrite_rules', 20 );

function kotlinskidev_find_service_location_id_by_slug_and_language( string $slug, string $lang ): int {
    global $wpdb;

    $post_id = $wpdb->get_var( $wpdb->prepare(
        "SELECT p.ID FROM {$wpdb->posts} p
        INNER JOIN {$wpdb->term_relationships} tr ON tr.object_id = p.ID
        INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id AND tt.taxonomy = 'language'
        INNER JOIN {$wpdb->terms} t ON t.term_id = tt.term_id
        WHERE p.post_type = 'service_location' AND p.post_name = %s AND t.slug = %s
        LIMIT 1",
        $slug,
        $lang
    ) );

    return (int) $post_id;
}

function kotlinskidev_scope_service_location_query_to_language( WP_Query $query ): void {
    if ( is_admin() || ! $query->is_main_query() ) {
        return;
    }

    $slug = (string) $query->get( 'service_location' );
    $lang = sanitize_key( (string) $query->get( 'lang' ) );
    if ( '' === $slug || '' === $lang ) {
        return;
    }

    $post_id = kotlinskidev_find_service_location_id_by_slug_and_language( $slug, $lang );
    if ( $post_id <= 0 ) {
        return;
    }

    $query->set( 'p', $post_id );
    $query->set( 'service_location', '' );
    $query->set( 'name', '' );
}
add_action( 'pre_get_posts', 'kotlinskidev_scope_service_location_query_to_language', 5 );

function kotlinskidev_keep_service_location_slug_unique_per_language( string $slug, int $post_id, string $post_status, string $post_type, int $post_parent, string $original_slug ): string {
    if ( 'service_location' !== $post_type || $slug === $original_slug || ! function_exists( 'pll_get_post_language' ) ) {
        return $slug;
    }

    $lang = (string) pll_get_post_language( $post_id, 'slug' );
    if ( '' === $lang ) {
        return $slug;
    }

    $existing_id = kotlinskidev_find_service_location_id_by_slug_and_language( $original_slug, $lang );

    return ( 0 === $existing_id || $existing_id === $post_id ) ? $original_slug : $slug;
}
add_filter( 'wp_unique_post_slug', 'kotlinskidev_keep_service_location_slug_unique_per_language', 10, 6 );

function kotlinskidev_service_location_translated_post_link( string $link, WP_Post $post ): string {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return $link;
    }

    if ( 'service_location' !== $post->post_type || ! function_exists( 'pll_get_post_language' ) ) {
        return $link;
    }

    $translations = kotlinskidev_service_location_slug_translations();
    $lang         = pll_get_post_language( $post->ID );

    if ( isset( $translations[ $lang ] ) ) {
        $link = str_replace( 'tworzenie-stron-www', $translations[ $lang ], $link );
    }

    return $link;
}
add_filter( 'post_type_link', 'kotlinskidev_service_location_translated_post_link', 10, 2 );

function kotlinskidev_clamp_city_grid_columns( $value ): int {
    return max( 1, min( 6, absint( $value ) ) );
}

function kotlinskidev_sanitize_city_grid_dimension( $value, string $default ): string {
    $value = trim( (string) $value );

    return preg_match( '/^-?[0-9.]+(px|rem|em)$/', $value ) ? $value : $default;
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

    $link_text_color = trim( (string) ( $attributes['linkTextColor'] ?? '' ) );
    if ( '' !== $link_text_color ) {
        $vars['--kt-city-grid-link-color'] = $link_text_color;
    }

    $card_background_color = trim( (string) ( $attributes['cardBackgroundColor'] ?? '' ) );
    if ( '' !== $card_background_color ) {
        $vars['--kt-city-grid-card-bg'] = $card_background_color;
    }

    $card_border_color = trim( (string) ( $attributes['cardBorderColor'] ?? '' ) );
    if ( '' !== $card_border_color ) {
        $vars['--kt-city-grid-card-border-color'] = $card_border_color;
    }

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

function kotlinskidev_render_city_map_block(): string {
    $city = get_post_meta( get_the_ID(), 'city', true );

    if ( ! $city ) {
        return '';
    }

    $embed_url = 'https://www.google.com/maps?q=' . rawurlencode( $city . ', Poland' ) . '&output=embed';
    $title     = sprintf( /* translators: %s: city name */ __( 'Map of %s', 'kotlinskidev' ), $city );

    return sprintf(
        '<div class="kt-city-map"><iframe class="kt-city-map__frame" src="%1$s" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="%2$s"></iframe><button type="button" class="kt-city-map__expand" data-city-map-expand data-city-map-src="%1$s" data-city-map-title="%2$s" aria-label="%3$s"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm16 0h2v6h-6v-2h4v-4z"/></svg></button></div>',
        esc_url( $embed_url ),
        esc_attr( $title ),
        esc_attr__( 'View larger map', 'kotlinskidev' )
    );
}

function kotlinskidev_register_city_map_block(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    register_block_type( 'kotlinskidev/city-map', [
        'title'            => __( 'City Map', 'kotlinskidev' ),
        'category'         => 'kotlinskidev',
        'icon'             => 'location',
        'render_callback'  => 'kotlinskidev_render_city_map_block',
    ] );
}
add_action( 'init', 'kotlinskidev_register_city_map_block' );

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

function kotlinskidev_register_post_language_rest_field(): void {
    foreach ( [ 'page', 'service_location' ] as $post_type ) {
        register_rest_field( $post_type, 'kotlinskidevLang', [
            'get_callback' => function ( array $post ) {
                return function_exists( 'pll_get_post_language' ) ? pll_get_post_language( $post['id'] ) : '';
            },
            'schema'       => [
                'type'    => 'string',
                'context' => [ 'edit' ],
            ],
        ] );
    }
}
add_action( 'init', 'kotlinskidev_register_post_language_rest_field' );

function kotlinskidev_enqueue_service_location_editor_previews(): void {
    wp_enqueue_script( 'wp-blocks' );
    wp_enqueue_script( 'wp-element' );
    wp_enqueue_script( 'wp-server-side-render' );
    wp_enqueue_script( 'wp-dom-ready' );
    wp_enqueue_script( 'wp-data' );

    $script = 'wp.domReady( function () {';
    foreach ( kotlinskidev_service_location_editor_preview_blocks() as $block ) {
        $script .= 'wp.blocks.registerBlockType( ' . wp_json_encode( $block['name'] ) . ', {' .
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
    $script .= '} );';

    wp_add_inline_script( 'wp-server-side-render', $script );
}
add_action( 'enqueue_block_editor_assets', 'kotlinskidev_enqueue_service_location_editor_previews' );
