<?php
function kotlinskidev_navigation_visibility_classes( string $visibility ): array {
	if ( $visibility === 'desktop' ) {
		return [ 'nav-desktop' ];
	}
	if ( $visibility === 'mobile' ) {
		return [ 'nav-mobile' ];
	}
	return [];
}

function kotlinskidev_render_navigation_block( array $attributes ): string {
	$menu_slug = $attributes['menuSlug'] ?? '';
	if ( empty( $menu_slug ) ) {
		return '';
	}

	$nav_classes = kotlinskidev_navigation_visibility_classes( $attributes['visibility'] ?? 'all' );
	$nav_post    = kotlinskidev_resolve_translatable_post( $menu_slug, 'wp_navigation' );
	if ( ! $nav_post instanceof WP_Post ) {
		return '';
	}

	if ( ( $attributes['overlayMenu'] ?? 'never' ) !== 'never' ) {
		return kotlinskidev_render_navigation_overlay( $attributes, $nav_post->ID, $nav_classes );
	}

	$display_mode = $attributes['displayMode'] ?? 'mega';
	if ( $display_mode === 'list' ) {
		return kotlinskidev_render_navigation_list( $nav_post, $nav_classes );
	}
	if ( $display_mode === 'bar' ) {
		return kotlinskidev_render_navigation_bar( $attributes, $nav_post );
	}
	return kotlinskidev_render_navigation_mega( $attributes, $nav_post, $nav_classes );
}
