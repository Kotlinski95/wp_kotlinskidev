<?php
function kotlinskidev_pll_register_navigation( array $post_types, bool $is_settings ): array {
	$post_types['wp_navigation'] = 'wp_navigation';
	return $post_types;
}

if ( function_exists( 'pll_get_post' ) || has_filter( 'pll_get_post_types' ) ) {
	add_filter( 'pll_get_post_types', 'kotlinskidev_pll_register_navigation', 10, 2 );
}
