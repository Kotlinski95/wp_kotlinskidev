<?php
function kotlinskidev_csp_directive_option_map(): array {
	return array(
		'default-src'     => 'kotlinskidev_csp_default_src',
		'script-src'      => 'kotlinskidev_csp_script_src',
		'style-src'       => 'kotlinskidev_csp_style_src',
		'img-src'         => 'kotlinskidev_csp_img_src',
		'font-src'        => 'kotlinskidev_csp_font_src',
		'connect-src'     => 'kotlinskidev_csp_connect_src',
		'frame-src'       => 'kotlinskidev_csp_frame_src',
		'object-src'      => 'kotlinskidev_csp_object_src',
		'base-uri'        => 'kotlinskidev_csp_base_uri',
		'form-action'     => 'kotlinskidev_csp_form_action',
		'frame-ancestors' => 'kotlinskidev_csp_frame_ancestors',
	);
}

function kotlinskidev_csp_directive_labels(): array {
	return array_flip( kotlinskidev_csp_directive_option_map() );
}

function kotlinskidev_csp_directive_defaults(): array {
	return array(
		'kotlinskidev_csp_default_src'     => "'self'",
		'kotlinskidev_csp_script_src'      => "'self' 'unsafe-inline' www.googletagmanager.com www.google-analytics.com connect.facebook.net challenges.cloudflare.com maps.googleapis.com",
		'kotlinskidev_csp_style_src'       => "'self' 'unsafe-inline' fonts.googleapis.com",
		'kotlinskidev_csp_img_src'         => "'self' data: maps.gstatic.com maps.googleapis.com www.facebook.com www.google-analytics.com",
		'kotlinskidev_csp_font_src'        => "'self' fonts.gstatic.com",
		'kotlinskidev_csp_connect_src'     => "'self' www.google-analytics.com analytics.google.com region1.google-analytics.com www.googletagmanager.com maps.googleapis.com connect.facebook.net consent.complianz.io cookiedatabase.org",
		'kotlinskidev_csp_frame_src'       => "'self' challenges.cloudflare.com www.google.com maps.google.com",
		'kotlinskidev_csp_object_src'      => "'none'",
		'kotlinskidev_csp_base_uri'        => "'self'",
		'kotlinskidev_csp_form_action'     => "'self'",
		'kotlinskidev_csp_frame_ancestors' => "'none'",
	);
}

function kotlinskidev_referrer_policy_choices(): array {
	return array(
		'no-referrer',
		'no-referrer-when-downgrade',
		'origin',
		'origin-when-cross-origin',
		'same-origin',
		'strict-origin',
		'strict-origin-when-cross-origin',
		'unsafe-url',
	);
}

function kotlinskidev_permissions_policy_default(): string {
	return "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), xr-spatial-tracking=()";
}

function kotlinskidev_content_security_policy_value(): string {
	$defaults   = kotlinskidev_csp_directive_defaults();
	$directives = array();

	foreach ( kotlinskidev_csp_directive_option_map() as $name => $option_key ) {
		$value = trim( (string) get_option( $option_key, $defaults[ $option_key ] ) );
		if ( $value !== '' ) {
			$directives[] = $name . ' ' . $value;
		}
	}

	if ( (bool) get_option( 'kotlinskidev_csp_upgrade_insecure_requests', true ) ) {
		$directives[] = 'upgrade-insecure-requests';
	}

	return implode( '; ', $directives );
}

function kotlinskidev_security_headers( array $headers ): array {
	if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
		return $headers;
	}

	$referrer_policy = (string) get_option( 'kotlinskidev_referrer_policy', 'strict-origin-when-cross-origin' );
	if ( ! in_array( $referrer_policy, kotlinskidev_referrer_policy_choices(), true ) ) {
		$referrer_policy = 'strict-origin-when-cross-origin';
	}
	$headers['Referrer-Policy'] = $referrer_policy;

	$permissions_policy = trim( (string) get_option( 'kotlinskidev_permissions_policy', kotlinskidev_permissions_policy_default() ) );
	if ( $permissions_policy !== '' ) {
		$headers['Permissions-Policy'] = $permissions_policy;
	}

	if ( (bool) get_option( 'kotlinskidev_csp_enabled', true ) ) {
		$header_name             = (bool) get_option( 'kotlinskidev_csp_enforce', false )
			? 'Content-Security-Policy'
			: 'Content-Security-Policy-Report-Only';
		$headers[ $header_name ] = kotlinskidev_content_security_policy_value();
	}

	return $headers;
}
add_filter( 'wp_headers', 'kotlinskidev_security_headers' );
