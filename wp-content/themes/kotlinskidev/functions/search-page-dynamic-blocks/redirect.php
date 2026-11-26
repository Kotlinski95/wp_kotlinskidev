<?php
function kotlinskidev_redirect_search_page_query() {
    if ( ! is_page( [ 'search', 'szukaj' ] ) ) {
        return;
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search redirect, no state change
    if ( ! isset( $_GET['s'] ) || '' === $_GET['s'] ) {
        return;
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search redirect, no state change
    $search_params = [ 's' => sanitize_text_field( wp_unslash( $_GET['s'] ) ) ];

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search redirect, no state change
    if ( ! empty( $_GET['search_category'] ) ) {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search redirect, no state change
        $search_params['search_category'] = sanitize_text_field( wp_unslash( $_GET['search_category'] ) );
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search redirect, no state change
    if ( ! empty( $_GET['search_type'] ) ) {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search redirect, no state change
        $search_params['search_type'] = sanitize_text_field( wp_unslash( $_GET['search_type'] ) );
    }

    wp_safe_redirect( home_url( '/?' . http_build_query( $search_params ) ) );
    exit;
}
add_action( 'template_redirect', 'kotlinskidev_redirect_search_page_query' );
