<?php
function kotlinskidev_localize_active_link_state(): void {
	wp_localize_script( 'wp-typescript', 'kotlinskidevActiveLinkState', array(
		'enabled'     => (bool) get_option( 'kotlinskidev_active_link_state_enabled', true ),
		'blockClicks' => (bool) get_option( 'kotlinskidev_active_link_state_block_clicks', true ),
	) );
}
add_action( 'wp_enqueue_scripts', 'kotlinskidev_localize_active_link_state', 20 );

function kotlinskidev_normalize_link_path( string $path ): string {
	$trimmed = rtrim( $path, '/' );
	return '' === $trimmed ? '/' : $trimmed;
}

function kotlinskidev_is_current_link_url( string $href, string $request_path, string $site_host ): bool {
	$trimmed = trim( $href );

	if ( '' === $trimmed || '#' === $trimmed || str_contains( $trimmed, '#' ) ) {
		return false;
	}

	if ( 1 === preg_match( '/^(javascript|mailto|tel):/i', $trimmed ) ) {
		return false;
	}

	$parts = parse_url( $trimmed );
	if ( false === $parts ) {
		return false;
	}

	if ( isset( $parts['host'] ) && strtolower( $parts['host'] ) !== strtolower( $site_host ) ) {
		return false;
	}

	if ( isset( $parts['scheme'] ) && ! isset( $parts['host'] ) ) {
		return false;
	}

	$link_path = $parts['path'] ?? '/';
	if ( '' === $link_path || '/' !== $link_path[0] ) {
		return false;
	}

	return kotlinskidev_normalize_link_path( $link_path ) === kotlinskidev_normalize_link_path( $request_path );
}

function kotlinskidev_is_current_request_link( string $href ): bool {
	if ( ! (bool) get_option( 'kotlinskidev_active_link_state_enabled', true ) ) {
		return false;
	}

	$request_uri  = isset( $_SERVER['REQUEST_URI'] ) ? (string) $_SERVER['REQUEST_URI'] : '/';
	$request_path = (string) ( parse_url( $request_uri, PHP_URL_PATH ) ?? '/' );
	$site_host    = (string) ( parse_url( home_url(), PHP_URL_HOST ) ?? '' );

	return kotlinskidev_is_current_link_url( $href, $request_path, $site_host );
}
