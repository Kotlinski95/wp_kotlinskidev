<?php

function kotlinskidev_app_shell_state( ?bool $set = null ): bool {
	static $active = false;
	if ( $set !== null ) {
		$active = $set;
	}
	return $active;
}

function kotlinskidev_mark_app_shell(): void {
	kotlinskidev_app_shell_state( true );
}

function kotlinskidev_app_shell_active(): bool {
	return kotlinskidev_app_shell_state();
}

function kotlinskidev_app_shell_can_defer_nav(): bool {
	return ! is_admin() && ! wp_is_json_request() && ! did_action( 'wp_footer' );
}

function kotlinskidev_app_shell_body_class( array $classes ): array {
	if ( kotlinskidev_app_shell_active() ) {
		$classes[] = 'kt-app-shell';
	}
	return $classes;
}
add_filter( 'body_class', 'kotlinskidev_app_shell_body_class' );

function kotlinskidev_app_shell_print_nav(): void {
	echo kotlinskidev_app_shell_nav_buffer(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- buffer holds markup already escaped by the navigation block render.php
}
add_action( 'wp_footer', 'kotlinskidev_app_shell_print_nav', 0 );

function kotlinskidev_app_shell_nav_buffer( ?string $set = null ): string {
	static $buffer = '';
	if ( $set !== null ) {
		$buffer = $set;
	}
	return $buffer;
}

function kotlinskidev_app_shell_defer_nav( string $markup ): void {
	kotlinskidev_app_shell_nav_buffer( kotlinskidev_app_shell_nav_buffer() . $markup );
	kotlinskidev_mark_app_shell();
}

function kotlinskidev_mobile_nav_solid_background_value( string $value ): string {
	$value = trim( $value );
	if ( preg_match( '/^[a-z0-9-]+$/', $value ) === 1 ) {
		return 'var(--wp--preset--color--' . $value . ')';
	}
	if ( preg_match( '/^#[0-9a-f]{3,8}$/i', $value ) === 1 ) {
		return strtolower( $value );
	}
	return '';
}
