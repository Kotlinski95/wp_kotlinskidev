<?php
function kotlinskidev_offer_flush_on_save(): void {
	kotlinskidev_offer_flush_cache();
}
add_action( 'save_post_kt_offer', 'kotlinskidev_offer_flush_on_save' );
add_action( 'pll_save_post', 'kotlinskidev_offer_flush_on_save' );

function kotlinskidev_offer_flush_on_post_removal( int $post_id ): void {
	if ( 'kt_offer' === get_post_type( $post_id ) ) {
		kotlinskidev_offer_flush_cache();
	}
}
add_action( 'trashed_post', 'kotlinskidev_offer_flush_on_post_removal' );
add_action( 'deleted_post', 'kotlinskidev_offer_flush_on_post_removal' );

function kotlinskidev_offer_flush_on_meta_change( $meta_id, int $post_id, string $meta_key = '' ): void {
	if ( in_array( $meta_key, [ 'offer_key', 'currency', 'is_placeholder', 'variants' ], true ) && 'kt_offer' === get_post_type( $post_id ) ) {
		kotlinskidev_offer_flush_cache();
	}
}
add_action( 'added_post_meta', 'kotlinskidev_offer_flush_on_meta_change', 10, 3 );
add_action( 'updated_post_meta', 'kotlinskidev_offer_flush_on_meta_change', 10, 3 );
add_action( 'deleted_post_meta', 'kotlinskidev_offer_flush_on_meta_change', 10, 3 );
