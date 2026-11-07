<?php
const KOTLINSKIDEV_ADD_CITY_ACTION = 'kotlinskidev_add_city';

function kotlinskidev_add_city_title_prefixes(): array {
    return [
        'en' => 'Website Development – ',
        'pl' => 'Tworzenie stron internetowych – ',
    ];
}

function kotlinskidev_find_city_post_id( string $city, string $lang ): int {
    $args = [
        'post_type'        => 'service_location',
        'post_status'      => 'any',
        'posts_per_page'   => 1,
        'fields'           => 'ids',
        'suppress_filters' => false,
        'meta_query'       => [ [ 'key' => 'city', 'value' => $city ] ],
    ];

    if ( '' !== $lang ) {
        $args['lang'] = $lang;
    }

    $ids = get_posts( $args );

    return $ids ? (int) $ids[0] : 0;
}

function kotlinskidev_add_city_pages( string $city ): array {
    $city   = sanitize_text_field( $city );
    $result = [ 'created' => [], 'existing' => [], 'error' => '' ];

    if ( '' === $city ) {
        $result['error'] = 'empty_city';
        return $result;
    }

    $has_polylang = function_exists( 'pll_set_post_language' );
    $prefixes     = kotlinskidev_add_city_title_prefixes();
    if ( ! $has_polylang ) {
        $prefixes = [ 'en' => $prefixes['en'] ];
    }

    $slug = sanitize_title( $city );

    foreach ( $prefixes as $lang => $prefix ) {
        $existing_id = kotlinskidev_find_city_post_id( $city, $has_polylang ? $lang : '' );
        if ( $existing_id > 0 ) {
            $result['existing'][ $lang ] = $existing_id;
            continue;
        }

        $post_id = wp_insert_post( wp_slash( [
            'post_type'   => 'service_location',
            'post_status' => 'draft',
            'post_title'  => $prefix . $city,
            'post_name'   => $slug,
            'meta_input'  => [ 'city' => $city ],
        ] ), true );

        if ( is_wp_error( $post_id ) || ! $post_id ) {
            $result['error'] = 'insert_failed';
            return $result;
        }

        if ( $has_polylang ) {
            pll_set_post_language( $post_id, $lang );
        }

        $result['created'][ $lang ] = (int) $post_id;
    }

    if ( [] === $result['created'] && [] !== $result['existing'] ) {
        $result['error'] = 'duplicate';
    }

    if ( $has_polylang && function_exists( 'pll_save_post_translations' ) && [] !== $result['created'] ) {
        $translations = array_merge( $result['existing'], $result['created'] );
        if ( count( $translations ) > 1 ) {
            pll_save_post_translations( $translations );
        }
    }

    return $result;
}

function kotlinskidev_add_city_page_url( array $args = [] ): string {
    return add_query_arg( $args, admin_url( 'edit.php?post_type=service_location&page=' . KOTLINSKIDEV_ADD_CITY_ACTION ) );
}

function kotlinskidev_register_add_city_page(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    add_submenu_page(
        'edit.php?post_type=service_location',
        __( 'Add City (EN + PL)', 'kotlinskidev' ),
        __( 'Add City (EN + PL)', 'kotlinskidev' ),
        'edit_others_posts',
        KOTLINSKIDEV_ADD_CITY_ACTION,
        'kotlinskidev_render_add_city_page'
    );
}
add_action( 'admin_menu', 'kotlinskidev_register_add_city_page' );

function kotlinskidev_handle_add_city(): void {
    if ( ! current_user_can( 'edit_others_posts' ) ) {
        wp_die( esc_html__( 'You do not have permission to add cities.', 'kotlinskidev' ), 403 );
    }

    check_admin_referer( KOTLINSKIDEV_ADD_CITY_ACTION );

    $city   = isset( $_POST['kotlinskidev_city'] ) ? sanitize_text_field( wp_unslash( $_POST['kotlinskidev_city'] ) ) : '';
    $result = kotlinskidev_add_city_pages( $city );

    $args = [ 'kt_city' => $city ];
    if ( '' !== $result['error'] ) {
        $args['kt_error'] = $result['error'];
    }
    foreach ( [ 'created', 'existing' ] as $group ) {
        foreach ( $result[ $group ] as $lang => $id ) {
            $args[ 'kt_' . $group . '_' . $lang ] = $id;
        }
    }

    wp_safe_redirect( kotlinskidev_add_city_page_url( $args ) );
    exit;
}
add_action( 'admin_post_' . KOTLINSKIDEV_ADD_CITY_ACTION, 'kotlinskidev_handle_add_city' );

function kotlinskidev_add_city_error_message( string $error ): string {
    $messages = [
        'empty_city'    => __( 'Enter a city name.', 'kotlinskidev' ),
        'duplicate'     => __( 'This city already exists in every language, nothing was created.', 'kotlinskidev' ),
        'insert_failed' => __( 'Could not create the city page.', 'kotlinskidev' ),
    ];

    return $messages[ $error ] ?? '';
}

function kotlinskidev_add_city_result_notice(): string {
    // phpcs:disable WordPress.Security.NonceVerification.Recommended -- read-only display of a redirect result
    $error = isset( $_GET['kt_error'] ) ? sanitize_key( wp_unslash( $_GET['kt_error'] ) ) : '';
    if ( '' !== $error ) {
        return '<div class="notice notice-error"><p>' . esc_html( kotlinskidev_add_city_error_message( $error ) ) . '</p></div>';
    }

    $links = '';
    foreach ( [ 'en', 'pl' ] as $lang ) {
        $id = isset( $_GET[ 'kt_created_' . $lang ] ) ? absint( $_GET[ 'kt_created_' . $lang ] ) : 0;
        if ( $id > 0 ) {
            $links .= '<li><a href="' . esc_url( get_edit_post_link( $id ) ) . '">' . esc_html( strtoupper( $lang ) . ': ' . get_the_title( $id ) ) . '</a></li>';
        }
    }
    // phpcs:enable WordPress.Security.NonceVerification.Recommended

    if ( '' === $links ) {
        return '';
    }

    return '<div class="notice notice-success"><p>' . esc_html__( 'City draft pages created. Fill in the local content before publishing:', 'kotlinskidev' ) . '</p><ul>' . $links . '</ul></div>';
}

function kotlinskidev_render_add_city_page(): void {
    if ( ! current_user_can( 'edit_others_posts' ) ) {
        return;
    }

    echo '<div class="wrap"><h1>' . esc_html__( 'Add City (EN + PL)', 'kotlinskidev' ) . '</h1>';
    echo kotlinskidev_add_city_result_notice(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from esc_html()/esc_url()'d values
    echo '<p>' . esc_html__( 'Creates a draft page for the city in English and Polish and links them as translations. Cities stay noindex until their local content is filled in.', 'kotlinskidev' ) . '</p>';
    echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">';
    echo '<input type="hidden" name="action" value="' . esc_attr( KOTLINSKIDEV_ADD_CITY_ACTION ) . '">';
    wp_nonce_field( KOTLINSKIDEV_ADD_CITY_ACTION );
    echo '<p><label for="kotlinskidev_city">' . esc_html__( 'City name', 'kotlinskidev' ) . '</label><br>';
    echo '<input type="text" id="kotlinskidev_city" name="kotlinskidev_city" class="regular-text" required></p>';
    submit_button( __( 'Add city', 'kotlinskidev' ) );
    echo '</form></div>';
}
