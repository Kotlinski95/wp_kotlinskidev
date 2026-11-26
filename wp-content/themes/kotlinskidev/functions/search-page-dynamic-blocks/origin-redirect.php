<?php
function kotlinskidev_search_origin_redirect_target( string $search_term, bool $is_search, bool $is_front_or_home, string $home_url, string $request_path ): string {
    if ( '' === $search_term || $is_search || ! $is_front_or_home ) {
        return '';
    }

    $home_path = (string) ( parse_url( $home_url, PHP_URL_PATH ) ?? '/' );

    if ( kotlinskidev_normalize_link_path( $home_path ) === kotlinskidev_normalize_link_path( $request_path ) ) {
        return '';
    }

    return add_query_arg( 's', rawurlencode( $search_term ), $home_url );
}

function kotlinskidev_redirect_search_from_home_origin() {
    $search_term = kotlinskidev_search_request_value( 's' );
    $home_url    = function_exists( 'pll_home_url' ) ? (string) pll_home_url() : home_url( '/' );
    $request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/';

    $target = kotlinskidev_search_origin_redirect_target(
        $search_term,
        is_search(),
        is_front_page() || is_home(),
        $home_url,
        (string) ( parse_url( $request_uri, PHP_URL_PATH ) ?? '/' )
    );

    if ( '' === $target ) {
        return;
    }

    wp_safe_redirect( $target, 302 );
    exit;
}
add_action( 'template_redirect', 'kotlinskidev_redirect_search_from_home_origin' );
