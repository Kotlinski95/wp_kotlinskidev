<?php
function kotlinskidev_register_project_card_post_type(): void {
    register_post_type( 'kt_project_card', [
        'labels' => [
            'name'          => __( 'Project Cards', 'kotlinskidev' ),
            'singular_name' => __( 'Project Card', 'kotlinskidev' ),
            'add_new_item'  => __( 'Add New Project Card', 'kotlinskidev' ),
            'edit_item'     => __( 'Edit Project Card', 'kotlinskidev' ),
            'search_items'  => __( 'Search Project Cards', 'kotlinskidev' ),
            'not_found'     => __( 'No project cards found', 'kotlinskidev' ),
        ],
        'public'              => true,
        'publicly_queryable'  => true,
        'exclude_from_search' => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_rest'        => true,
        'menu_icon'           => 'dashicons-portfolio',
        'menu_position'       => 24,
        'supports'            => [ 'title', 'editor', 'thumbnail', 'custom-fields' ],
        'has_archive'         => false,
    ] );
}
add_action( 'init', 'kotlinskidev_register_project_card_post_type' );

function kotlinskidev_project_card_meta_fields(): array {
    return [
        'project_description' => 'sanitize_text_field',
        'project_tags'        => 'sanitize_text_field',
        'project_url'         => 'esc_url_raw',
    ];
}

function kotlinskidev_register_project_card_meta(): void {
    foreach ( kotlinskidev_project_card_meta_fields() as $key => $sanitize_callback ) {
        register_post_meta( 'kt_project_card', $key, [
            'type'              => 'string',
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => $sanitize_callback,
            'auth_callback'     => function () {
                return current_user_can( 'edit_posts' );
            },
        ] );
    }
}
add_action( 'init', 'kotlinskidev_register_project_card_meta' );

function kotlinskidev_inject_project_card_overlay( string $html, string $description ): string {
    if ( '' === trim( $description ) ) {
        return $html;
    }

    $processor = new WP_HTML_Tag_Processor( $html );
    if ( ! $processor->next_tag( 'figure' ) ) {
        return $html;
    }

    $existing_class = $processor->get_attribute( 'class' );
    $existing_class = is_string( $existing_class ) ? $existing_class . ' ' : '';
    $processor->set_attribute( 'class', trim( $existing_class . 'kt-image-hover-overlay' ) );

    $html = $processor->get_updated_html();

    $close_pos = strpos( $html, '</figure>' );
    if ( false === $close_pos ) {
        return $html;
    }

    return substr_replace(
        $html,
        kotlinskidev_image_overlay_markup( '', $description ) . '</figure>',
        $close_pos,
        strlen( '</figure>' )
    );
}

function kotlinskidev_render_project_card_embed( int $card_id ): string {
    $card_id = $card_id ? kotlinskidev_resolve_translatable_post_id( $card_id ) : $card_id;

    if ( ! $card_id || 'publish' !== get_post_status( $card_id ) ) {
        return '<div class="kt-project-card kt-project-card--empty"><p>' . esc_html__( 'Select a card to display it here.', 'kotlinskidev' ) . '</p></div>';
    }

    $template = get_block_template( get_stylesheet() . '//single-kt_project_card', 'wp_template' );

    if ( ! $template || ! $template->content ) {
        return '';
    }

    $context = [
        'postId'   => $card_id,
        'postType' => 'kt_project_card',
    ];

    global $post;
    $original_post = $post;
    $post          = get_post( $card_id );
    setup_postdata( $post );

    $rendered = '';
    foreach ( parse_blocks( $template->content ) as $block ) {
        $rendered .= ( new WP_Block( $block, $context ) )->render();
    }

    $post = $original_post;
    if ( $original_post ) {
        setup_postdata( $original_post );
    } else {
        wp_reset_postdata();
    }

    $description = (string) get_post_meta( $card_id, 'project_description', true );

    return kotlinskidev_inject_project_card_overlay( $rendered, $description );
}

function kotlinskidev_project_card_editor_panel_script(): void {
    $screen = get_current_screen();

    if ( ! $screen || 'kt_project_card' !== $screen->post_type ) {
        return;
    }

    $path = kotlinskidev_build_path( 'js', 'project-card-panel.js' );

    if ( ! file_exists( $path ) ) {
        return;
    }

    wp_enqueue_script(
        'kotlinskidev-project-card-panel',
        kotlinskidev_build_url( 'js', 'project-card-panel.js' ),
        [ 'wp-plugins', 'wp-edit-post', 'wp-editor', 'wp-element', 'wp-components', 'wp-data', 'wp-core-data', 'wp-i18n' ],
        (string) filemtime( $path ),
        true
    );
}
add_action( 'enqueue_block_editor_assets', 'kotlinskidev_project_card_editor_panel_script' );
