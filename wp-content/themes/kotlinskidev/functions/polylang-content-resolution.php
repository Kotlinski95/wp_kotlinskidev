<?php
function kotlinskidev_pll_register_navigation( array $post_types, bool $is_settings ): array {
	$post_types['wp_navigation'] = 'wp_navigation';
	return $post_types;
}

if ( function_exists( 'pll_get_post' ) || has_filter( 'pll_get_post_types' ) ) {
	add_filter( 'pll_get_post_types', 'kotlinskidev_pll_register_navigation', 10, 2 );
}

function kotlinskidev_resolve_translatable_post( string $slug, string $post_type ): ?WP_Post {
	$post = get_page_by_path( $slug, OBJECT, $post_type );
	if ( ! $post instanceof WP_Post ) {
		return null;
	}
	if ( function_exists( 'pll_get_post' ) ) {
		$translated_id = pll_get_post( $post->ID );
		if ( $translated_id ) {
			$post = get_post( $translated_id );
		}
	}
	return $post instanceof WP_Post ? $post : null;
}
