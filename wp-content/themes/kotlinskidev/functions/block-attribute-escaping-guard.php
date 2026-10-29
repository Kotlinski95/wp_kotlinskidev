<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function kotlinskidev_block_attribute_escaping_is_corrupted( string $content ): bool
{
    return (bool) preg_match( '/(?<!\\\\)u00(2d|22|27|26|3c|3e)/', $content );
}

function kotlinskidev_repair_block_attribute_escaping( string $content ): string
{
    return preg_replace( '/(?<!\\\\)u00(2d|22|27|26|3c|3e)/', '\\\\u00$1', $content );
}

function kotlinskidev_repair_saved_post_escaping( int $post_id, WP_Post $post ): void
{
    if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
        return;
    }

    if ( ! kotlinskidev_block_attribute_escaping_is_corrupted( $post->post_content ) ) {
        return;
    }

    global $wpdb;
    $wpdb->update(
        $wpdb->posts,
        [ 'post_content' => kotlinskidev_repair_block_attribute_escaping( $post->post_content ) ],
        [ 'ID' => $post_id ]
    );
    clean_post_cache( $post_id );
}
add_action( 'save_post', 'kotlinskidev_repair_saved_post_escaping', PHP_INT_MAX, 2 );
