<?php
function kotlinskidev_register_service_location_post_type(): void {
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
    if ( ! function_exists( 'pll_register_string' ) ) {
        return;
    }
    foreach ( kotlinskidev_service_location_faq_summary_strings() as $string ) {
        pll_register_string( $string, $string, 'kotlinskidev' );
    }
}
add_action( 'init', 'kotlinskidev_register_service_location_faq_summary_strings' );

function kotlinskidev_apply_service_location_faq_summaries( string $block_content, array $block ): string {
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
    foreach ( kotlinskidev_service_location_slug_translations() as $lang => $slug ) {
        $lang = sanitize_key( $lang );
        $slug = sanitize_title( $slug );
        add_rewrite_rule( '^' . $lang . '/' . $slug . '/([^/]+)/?$', 'index.php?service_location=$matches[1]&lang=' . $lang, 'top' );
    }
}
add_action( 'init', 'kotlinskidev_register_service_location_translated_rewrite_rules', 20 );

function kotlinskidev_service_location_translated_post_link( string $link, WP_Post $post ): string {
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

function kotlinskidev_render_city_grid_block( array $attributes = [] ): string {
    $query = new WP_Query( [
        'post_type'      => 'service_location',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'meta_key'       => 'city',
        'orderby'        => 'meta_value',
        'order'          => 'ASC',
    ] );

    if ( ! $query->have_posts() ) {
        return '<div style="text-align:center;padding:3.75rem 0"><p style="color:var(--wp--preset--color--foreground-alt)">' . esc_html__( 'City pages will appear here soon.', 'kotlinskidev' ) . '</p></div>';
    }

    $cards = '';
    while ( $query->have_posts() ) {
        $query->the_post();
        $city  = get_post_meta( get_the_ID(), 'city', true );
        $cards .= sprintf(
            '<a href="%1$s" class="kt-city-grid__link wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0.125rem;border-radius:1.125rem;padding:1.25rem;display:flex;align-items:center;justify-content:space-between;gap:0.625rem;text-decoration:none;box-shadow:var(--wp--preset--shadow--natural)"><span class="kt-city-grid__link-label" style="font-weight:600;font-size:1.0625rem">%2$s</span><span class="link-dark-variant-support kt-gradient-text" style="font-size:0.875rem;flex-shrink:0">&rarr;</span></a>',
            esc_url( get_permalink() ),
            esc_html( $city )
        );
    }
    wp_reset_postdata();

    $columns_desktop = kotlinskidev_clamp_city_grid_columns( $attributes['columnsDesktop'] ?? 3 );
    $columns_tablet   = kotlinskidev_clamp_city_grid_columns( $attributes['columnsTablet'] ?? 2 );
    $columns_mobile   = kotlinskidev_clamp_city_grid_columns( $attributes['columnsMobile'] ?? 1 );
    $link_text_color  = isset( $attributes['linkTextColor'] ) ? trim( (string) $attributes['linkTextColor'] ) : '';

    $wrapper_style = sprintf(
        '--kt-city-grid-columns-desktop:%1$d;--kt-city-grid-columns-tablet:%2$d;--kt-city-grid-columns-mobile:%3$d',
        $columns_desktop,
        $columns_tablet,
        $columns_mobile
    );

    if ( $link_text_color ) {
        $wrapper_style .= ';--kt-city-grid-link-color:' . $link_text_color;
    }

    return sprintf( '<div class="kt-city-grid" style="%1$s">%2$s</div>', esc_attr( $wrapper_style ), $cards ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $cards built from esc_url()/esc_html()'d values above
}

function kotlinskidev_register_city_grid_block(): void {
    register_block_type( 'kotlinskidev/city-grid', [
        'title'            => __( 'City Grid', 'kotlinskidev' ),
        'category'         => 'kotlinskidev',
        'icon'             => 'grid-view',
        'attributes'       => [
            'columnsDesktop' => [ 'type' => 'number', 'default' => 3 ],
            'columnsTablet'  => [ 'type' => 'number', 'default' => 2 ],
            'columnsMobile'  => [ 'type' => 'number', 'default' => 1 ],
            'linkTextColor'  => [ 'type' => 'string', 'default' => '' ],
        ],
        'render_callback'  => 'kotlinskidev_render_city_grid_block',
    ] );
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
    return [
        [ 'name' => 'kotlinskidev/city-grid', 'title' => __( 'City Grid', 'kotlinskidev' ), 'icon' => 'grid-view' ],
        [ 'name' => 'kotlinskidev/city-map', 'title' => __( 'City Map', 'kotlinskidev' ), 'icon' => 'location' ],
        [ 'name' => 'kotlinskidev/contact-card', 'title' => __( 'Contact Card', 'kotlinskidev' ), 'icon' => 'phone' ],
    ];
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
