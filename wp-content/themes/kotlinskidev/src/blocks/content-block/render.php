<?php
$content_slug = $attributes['contentSlug'] ?? '';

if ( empty( $content_slug ) ) {
	return;
}

$content_post = kotlinskidev_resolve_translatable_post( $content_slug, 'wp_block' );

if ( ! $content_post instanceof WP_Post ) {
	return;
}

echo '<div ' . get_block_wrapper_attributes() . '>' . do_blocks( $content_post->post_content ) . '</div>';
