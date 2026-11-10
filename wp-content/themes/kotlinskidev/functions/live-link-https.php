<?php
function kotlinskidev_is_valid_host( string $host ): bool {
	return 1 === preg_match( '/^[a-z0-9][a-z0-9.-]*[a-z0-9](:\d+)?$/i', $host );
}

function kotlinskidev_force_https_for_hosts( string $html, array $hosts ): string {
	foreach ( array_unique( array_filter( $hosts, 'kotlinskidev_is_valid_host' ) ) as $host ) {
		$html = str_replace(
			array( 'http://' . $host, 'http:\/\/' . $host ),
			array( 'https://' . $host, 'https:\/\/' . $host ),
			$html
		);
	}
	return $html;
}

function kotlinskidev_is_live_link_request(): bool {
	return 'local' === wp_get_environment_type()
		&& ! empty( $_SERVER['HTTP_X_ORIGINAL_HOST'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotValidated -- presence check only, value is never output
}

function kotlinskidev_start_live_link_https_buffer(): void {
	if ( ! kotlinskidev_is_live_link_request() || is_admin() || is_feed() || wp_doing_ajax() ) {
		return;
	}

	$hosts = array(
		sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_ORIGINAL_HOST'] ) ), // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotValidated -- guarded by kotlinskidev_is_live_link_request()
		(string) wp_parse_url( get_option( 'home' ), PHP_URL_HOST ),
		sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ?? '' ) ),
	);

	ob_start(
		static fn( string $html ): string => kotlinskidev_force_https_for_hosts( $html, $hosts )
	);
}
add_action( 'template_redirect', 'kotlinskidev_start_live_link_https_buffer', 0 );
