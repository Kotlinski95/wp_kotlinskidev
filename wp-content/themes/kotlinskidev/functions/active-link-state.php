<?php
function kotlinskidev_is_current_link_url( string $url ): bool {
	$url = trim( $url );

	if ( $url === '' || $url === '#' ) {
		return false;
	}

	if ( preg_match( '/^(javascript|mailto|tel):/i', $url ) ) {
		return false;
	}

	if ( str_contains( $url, '#' ) ) {
		return false;
	}

	$link_host = wp_parse_url( $url, PHP_URL_HOST );
	if ( $link_host !== null && $link_host !== wp_parse_url( home_url(), PHP_URL_HOST ) ) {
		return false;
	}

	$link_path = untrailingslashit( (string) wp_parse_url( $url, PHP_URL_PATH ) );
	$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
	$current_path = untrailingslashit( (string) wp_parse_url( home_url( $request_uri ), PHP_URL_PATH ) );

	return $link_path === $current_path;
}

function kotlinskidev_disable_current_link_click( WP_HTML_Tag_Processor $processor, array $block ): void {
	$is_panel_trigger = $processor->get_attribute( 'aria-haspopup' ) === 'true';

	if ( $is_panel_trigger && empty( $block['attrs']['linkNavigatesOnClick'] ) ) {
		return;
	}

	if ( ! $is_panel_trigger ) {
		$processor->set_attribute( 'aria-disabled', 'true' );
		$processor->set_attribute( 'tabindex', '-1' );
	}

	$style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
	if ( $style !== '' && ! str_ends_with( $style, ';' ) ) {
		$style .= ';';
	}
	$processor->set_attribute( 'style', $style . 'pointer-events:none' );
}

function kotlinskidev_mark_active_link_state( string $block_content, array $block ): string {
	if ( $block_content === '' || ! str_contains( $block_content, '<a' ) ) {
		return $block_content;
	}

	if ( ! (bool) get_option( 'kotlinskidev_active_link_state_enabled', true ) ) {
		return $block_content;
	}

	if ( ! empty( $block['attrs']['activeLinkState']['disableActiveState'] ) ) {
		return $block_content;
	}

	$block_clicks = (bool) get_option( 'kotlinskidev_active_link_state_block_clicks', true );

	$processor = new WP_HTML_Tag_Processor( $block_content );
	$changed = false;

	while ( $processor->next_tag( 'a' ) ) {
		if ( $processor->has_class( 'kt-link-current' ) || $processor->has_class( 'kt-hover-no-link-gradient' ) ) {
			continue;
		}

		$href = $processor->get_attribute( 'href' );
		if ( ! is_string( $href ) || ! kotlinskidev_is_current_link_url( $href ) ) {
			continue;
		}

		$existing_class = $processor->get_attribute( 'class' ) ?? '';
		$processor->set_attribute( 'class', trim( $existing_class . ' kt-link-current' ) );
		$processor->set_attribute( 'aria-current', 'page' );

		if ( $block_clicks ) {
			kotlinskidev_disable_current_link_click( $processor, $block );
		}

		$changed = true;
	}

	return $changed ? $processor->get_updated_html() : $block_content;
}
add_filter( 'render_block', 'kotlinskidev_mark_active_link_state', 20, 2 );
