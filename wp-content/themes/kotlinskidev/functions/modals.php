<?php
function kotlinskidev_register_modal_post_type(): void {
    register_post_type( 'kt_modal', [
        'labels' => [
            'name'          => __( 'Modals', 'kotlinskidev' ),
            'singular_name' => __( 'Modal', 'kotlinskidev' ),
            'add_new_item'  => __( 'Add New Modal', 'kotlinskidev' ),
            'edit_item'     => __( 'Edit Modal', 'kotlinskidev' ),
            'search_items'  => __( 'Search Modals', 'kotlinskidev' ),
            'not_found'     => __( 'No modals found', 'kotlinskidev' ),
        ],
        'public'             => false,
        'publicly_queryable' => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_rest'       => true,
        'menu_icon'          => 'dashicons-external',
        'menu_position'      => 21,
        'supports'           => [ 'title', 'editor', 'custom-fields' ],
    ] );
}
add_action( 'init', 'kotlinskidev_register_modal_post_type' );

function kotlinskidev_register_modal_meta(): void {
    register_post_meta( 'kt_modal', 'kt_modal_size', [
        'type'              => 'string',
        'single'            => true,
        'default'           => 'medium',
        'show_in_rest'      => true,
        'sanitize_callback' => function ( $value ) {
            return in_array( $value, [ 'small', 'medium', 'large', 'full' ], true ) ? $value : 'medium';
        },
        'auth_callback'     => function () {
            return current_user_can( 'edit_posts' );
        },
    ] );
}
add_action( 'init', 'kotlinskidev_register_modal_meta' );

function kotlinskidev_resolve_modal_by_id( int $id ): ?WP_Post {
    static $resolved = [];

    if ( array_key_exists( $id, $resolved ) ) {
        return $resolved[ $id ];
    }

    $post = get_post( $id );
    if ( ! $post instanceof WP_Post || 'kt_modal' !== $post->post_type || 'publish' !== $post->post_status ) {
        return $resolved[ $id ] = null;
    }

    if ( function_exists( 'pll_get_post' ) ) {
        $translated_id = pll_get_post( $post->ID );
        if ( $translated_id ) {
            $post = get_post( $translated_id );
        }
    }

    return $resolved[ $id ] = ( $post instanceof WP_Post ? $post : null );
}

function kotlinskidev_modal_footer_ids( ?int $register_id = null ): array {
    static $ids = [];

    if ( null !== $register_id ) {
        $ids[ $register_id ] = true;
    }

    return array_keys( $ids );
}

function kotlinskidev_register_modal_for_footer( int $id ): void {
    kotlinskidev_modal_footer_ids( $id );
}

function kotlinskidev_get_modals_for_footer(): array {
    return kotlinskidev_modal_footer_ids();
}

function kotlinskidev_apply_modal_trigger( string $block_content, array $block ): string {
    if ( ! in_array( $block['blockName'] ?? '', [ 'kotlinskidev/button', 'kotlinskidev/nav-link', 'core/button', 'core/navigation-link', 'core/navigation-submenu' ], true ) ) {
        return $block_content;
    }

    if ( empty( $block['attrs']['opensInModal'] ) || empty( $block['attrs']['modalId'] ) ) {
        return $block_content;
    }

    $modal = kotlinskidev_resolve_modal_by_id( (int) $block['attrs']['modalId'] );
    if ( ! $modal instanceof WP_Post ) {
        return $block_content;
    }

    kotlinskidev_register_modal_for_footer( $modal->ID );

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag( [ 'tag_name' => 'a' ] ) ) {
        return $block_content;
    }

    $existing_href = $processor->get_attribute( 'href' );
    if ( empty( $existing_href ) || '#' === $existing_href ) {
        $processor->set_attribute( 'href', '#kt-modal-' . $modal->ID );
    }
    $processor->set_attribute( 'data-kt-modal-target', 'kt-modal-' . $modal->ID );

    return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_modal_trigger', 10, 2 );

function kotlinskidev_render_modal_shells(): void {
    $modal_ids = kotlinskidev_get_modals_for_footer();
    if ( empty( $modal_ids ) ) {
        return;
    }

    foreach ( $modal_ids as $modal_id ) {
        $modal = kotlinskidev_resolve_modal_by_id( $modal_id );
        if ( ! $modal instanceof WP_Post ) {
            continue;
        }

        $size = get_post_meta( $modal->ID, 'kt_modal_size', true ) ?: 'medium';
        $size = in_array( $size, [ 'small', 'medium', 'large', 'full' ], true ) ? $size : 'medium';

        echo '<div id="kt-modal-' . esc_attr( $modal->ID ) . '" class="kt-modal kt-modal--' . esc_attr( $size ) . '" role="dialog" aria-modal="true" aria-hidden="true" aria-label="' . esc_attr( $modal->post_title ) . '">';
        echo '<div class="kt-modal__backdrop" data-kt-modal-close></div>';
        echo '<div class="kt-modal__dialog">';
        echo '<button type="button" class="kt-modal__close" data-kt-modal-close aria-label="' . esc_attr__( 'Close', 'kotlinskidev' ) . '">&times;</button>';
        echo '<div class="kt-modal__content">' . do_blocks( $modal->post_content ) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- do_blocks() renders trusted editor-authored block content for the kt_modal post type, same trust boundary as the_content()
        echo '</div>';
        echo '</div>';
    }
}
add_action( 'wp_footer', 'kotlinskidev_render_modal_shells' );

function kotlinskidev_enqueue_modal_settings_panel_assets(): void {
    $screen = get_current_screen();
    if ( ! $screen || 'kt_modal' !== $screen->post_type ) {
        return;
    }

    wp_enqueue_script(
        'kotlinskidev-modal-settings-panel',
        get_template_directory_uri() . '/build/modal-settings-panel.js',
        [ 'wp-plugins', 'wp-edit-post', 'wp-editor', 'wp-element', 'wp-components', 'wp-i18n', 'wp-data', 'wp-core-data' ],
        filemtime( get_template_directory() . '/build/modal-settings-panel.js' ),
        true
    );

    wp_set_script_translations( 'kotlinskidev-modal-settings-panel', 'kotlinskidev', get_template_directory() . '/languages' );
}
add_action( 'enqueue_block_editor_assets', 'kotlinskidev_enqueue_modal_settings_panel_assets' );
