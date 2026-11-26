<?php
function kotlinskidev_contact_form_referer_post_id(): int {
    $referer = wp_get_referer();

    return $referer ? url_to_postid( $referer ) : 0;
}

function kotlinskidev_contact_form_resolve_source_post( int $post_id ) {
    $post = $post_id ? get_post( $post_id ) : null;

    if ( ! $post ) {
        global $post;
    }

    return $post;
}

function kotlinskidev_contact_form_find_block_in_post( $post ) {
    if ( $post && has_blocks( $post->post_content ) ) {
        return kotlinskidev_contact_form_find_block( parse_blocks( $post->post_content ) );
    }

    return null;
}
