<?php
function kotlinskidev_register_article_card_post_type(): void {
    if ( ! kotlinskidev_feature_enabled( 'article_cards' ) ) {
        return;
    }

    register_post_type( 'kt_article_card', [
        'labels' => [
            'name'          => __( 'Article Cards', 'kotlinskidev' ),
            'singular_name' => __( 'Article Card', 'kotlinskidev' ),
            'add_new_item'  => __( 'Add New Article Card', 'kotlinskidev' ),
            'edit_item'     => __( 'Edit Article Card', 'kotlinskidev' ),
            'search_items'  => __( 'Search Article Cards', 'kotlinskidev' ),
            'not_found'     => __( 'No article cards found', 'kotlinskidev' ),
        ],
        'public'              => false,
        'publicly_queryable'  => false,
        'exclude_from_search' => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_rest'        => true,
        'menu_icon'           => 'dashicons-id-alt',
        'menu_position'       => 23,
        'supports'            => [ 'title', 'editor', 'custom-fields' ],
        'has_archive'         => false,
    ] );
}
add_action( 'init', 'kotlinskidev_register_article_card_post_type' );

function kotlinskidev_article_card_meta_fields(): array {
    return [
        'linked_article_id'    => 'integer',
        'card_description'     => 'string',
        'image_id'             => 'integer',
        'image_url'            => 'string',
        'image_alt'            => 'string',
        'resolved_description' => 'string',
        'permalink'            => 'string',
    ];
}

function kotlinskidev_register_article_card_meta(): void {
    if ( ! kotlinskidev_feature_enabled( 'article_cards' ) ) {
        return;
    }

    foreach ( kotlinskidev_article_card_meta_fields() as $key => $type ) {
        register_post_meta( 'kt_article_card', $key, [
            'type'              => $type,
            'single'            => true,
            'show_in_rest'      => true,
            'sanitize_callback' => 'integer' === $type ? 'absint' : 'sanitize_text_field',
            'auth_callback'     => function () {
                return current_user_can( 'edit_posts' );
            },
        ] );
    }
}
add_action( 'init', 'kotlinskidev_register_article_card_meta' );

function kotlinskidev_sync_article_card_meta( int $card_id ): void {
    $article_id = absint( get_post_meta( $card_id, 'linked_article_id', true ) );

    if ( ! $article_id || 'publish' !== get_post_status( $article_id ) ) {
        return;
    }

    $description = trim( (string) get_post_meta( $card_id, 'card_description', true ) );
    if ( '' === $description ) {
        $description = get_the_title( $article_id );
    }

    $thumbnail_id = get_post_thumbnail_id( $article_id );

    update_post_meta( $card_id, 'permalink', get_permalink( $article_id ) );
    update_post_meta( $card_id, 'resolved_description', $description );
    update_post_meta( $card_id, 'image_id', $thumbnail_id );
    update_post_meta( $card_id, 'image_url', $thumbnail_id ? (string) wp_get_attachment_image_url( $thumbnail_id, 'full' ) : '' );
    update_post_meta( $card_id, 'image_alt', $thumbnail_id ? get_post_meta( $thumbnail_id, '_wp_attachment_image_alt', true ) : '' );
}

function kotlinskidev_sync_article_card_on_rest_insert( WP_Post $post ): void {
    if ( ! kotlinskidev_feature_enabled( 'article_cards' ) ) {
        return;
    }

    kotlinskidev_sync_article_card_meta( $post->ID );
}
add_action( 'rest_insert_kt_article_card', 'kotlinskidev_sync_article_card_on_rest_insert' );

function kotlinskidev_merge_article_card_block_supports( string $html ): string {
    $supports = WP_Block_Supports::get_instance()->apply_block_supports();

    if ( empty( $supports ) ) {
        return $html;
    }

    $processor = new WP_HTML_Tag_Processor( $html );
    if ( ! $processor->next_tag() ) {
        return $html;
    }

    if ( ! empty( $supports['class'] ) ) {
        $existing_class = (string) $processor->get_attribute( 'class' );
        $processor->set_attribute( 'class', trim( $existing_class . ' ' . $supports['class'] ) );
    }

    if ( ! empty( $supports['style'] ) ) {
        $existing_style = (string) $processor->get_attribute( 'style' );
        $merged_style   = $existing_style ? rtrim( $existing_style, ';' ) . ';' . $supports['style'] : $supports['style'];
        $processor->set_attribute( 'style', $merged_style );
    }

    return $processor->get_updated_html();
}

function kotlinskidev_render_article_card_embed( int $card_id ): string {
    if ( ! $card_id || 'publish' !== get_post_status( $card_id ) ) {
        return '<div class="kt-article-card kt-article-card--empty"><p>' . esc_html__( 'Select a card to display it here.', 'kotlinskidev' ) . '</p></div>';
    }

    $template = get_block_template( get_stylesheet() . '//single-kt_article_card', 'wp_template' );

    if ( ! $template || ! $template->content ) {
        return '';
    }

    $card_post = get_post( $card_id );

    if ( ! $card_post ) {
        return '';
    }

    $context = [
        'postId'   => $card_id,
        'postType' => 'kt_article_card',
    ];

    $rendered = '';
    foreach ( parse_blocks( $template->content ) as $block ) {
        $rendered .= ( new WP_Block( $block, $context ) )->render();
    }

    return $rendered;
}

function kotlinskidev_article_card_editor_panel_script(): void {
    if ( ! kotlinskidev_feature_enabled( 'article_cards' ) ) {
        return;
    }

    $screen = get_current_screen();

    if ( ! $screen || 'kt_article_card' !== $screen->post_type ) {
        return;
    }

    $path = kotlinskidev_build_path( 'js', 'article-card-panel.js' );

    if ( ! file_exists( $path ) ) {
        return;
    }

    wp_enqueue_script(
        'kotlinskidev-article-card-panel',
        kotlinskidev_build_url( 'js', 'article-card-panel.js' ),
        [ 'wp-plugins', 'wp-edit-post', 'wp-editor', 'wp-element', 'wp-components', 'wp-data', 'wp-core-data', 'wp-i18n' ],
        (string) filemtime( $path ),
        true
    );
}
add_action( 'enqueue_block_editor_assets', 'kotlinskidev_article_card_editor_panel_script' );
