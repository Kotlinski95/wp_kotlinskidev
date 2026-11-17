<?php

function kotlinskidev_sanitize_cf_beacon_token($value): string
{
	$token = strtolower(trim((string) $value));

	return 1 === preg_match('/^[a-f0-9]{32}$/', $token) ? $token : '';
}

function kotlinskidev_cf_beacon_token(): string
{
	$token = defined('KOTLINSKIDEV_CF_BEACON_TOKEN')
		? (string) constant('KOTLINSKIDEV_CF_BEACON_TOKEN')
		: (string) get_option('kotlinskidev_cf_beacon_token', '');

	return kotlinskidev_sanitize_cf_beacon_token(apply_filters('kotlinskidev_cf_beacon_token', $token));
}

function kotlinskidev_cf_beacon_enabled(): bool
{
	if (is_admin() || is_feed() || is_customize_preview() || '' === kotlinskidev_cf_beacon_token()) {
		return false;
	}

	return (bool) apply_filters('kotlinskidev_cf_beacon_enabled', true);
}

function kotlinskidev_cf_beacon_script(): string
{
	$config = wp_json_encode(
		array(
			'token' => kotlinskidev_cf_beacon_token(),
		)
	);

	return '(function(){var started=false;function load(){if(started||document.querySelector("script[data-cf-beacon]")){return}started=true;var s=document.createElement("script");s.type="module";s.src="https://static.cloudflareinsights.com/beacon.min.js";s.setAttribute("data-cf-beacon",' . wp_json_encode($config) . ');document.head.appendChild(s)}var events=["pointerdown","keydown","scroll","touchstart"];function arm(){events.forEach(function(e){addEventListener(e,load,{once:true,passive:true})});setTimeout(load,6000)}if(document.readyState==="complete"){arm()}else{addEventListener("load",arm,{once:true})}})();';
}

function kotlinskidev_print_cf_beacon_loader(): void
{
	if (!kotlinskidev_cf_beacon_enabled()) {
		return;
	}

	echo '<script id="kt-cf-beacon-loader">' . kotlinskidev_cf_beacon_script() . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static script, token validated as 32 hex chars and passed through wp_json_encode
}
add_action('wp_footer', 'kotlinskidev_print_cf_beacon_loader', 30);
