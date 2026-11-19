<?php
function kotlinskidev_offer_placeholder_count(): int {
	$ids = get_posts( [
		'post_type'        => 'kt_offer',
		'post_status'      => [ 'publish', 'draft', 'pending', 'private' ],
		'numberposts'      => -1,
		'fields'           => 'ids',
		'lang'             => '',
		'suppress_filters' => true,
		'meta_key'         => 'is_placeholder',
		'meta_value'       => '1',
	] );
	return is_array( $ids ) ? count( $ids ) : 0;
}

function kotlinskidev_offer_placeholder_message( int $count ): string {
	return sprintf(
		_n( '%d offer uses placeholder prices', '%d offers use placeholder prices', $count, 'kotlinskidev' ),
		$count
	);
}

function kotlinskidev_offer_placeholder_notice(): void {
	if ( ! current_user_can( 'edit_posts' ) ) {
		return;
	}
	$count = kotlinskidev_offer_placeholder_count();
	if ( $count < 1 ) {
		return;
	}
	printf(
		'<div class="notice notice-warning"><p>%s <a href="%s">%s</a></p></div>',
		esc_html( kotlinskidev_offer_placeholder_message( $count ) ),
		esc_url( admin_url( 'edit.php?post_type=kt_offer' ) ),
		esc_html__( 'Review offers', 'kotlinskidev' )
	);
}
add_action( 'admin_notices', 'kotlinskidev_offer_placeholder_notice' );

function kotlinskidev_offer_admin_bar_node( WP_Admin_Bar $admin_bar ): void {
	if ( ! current_user_can( 'edit_posts' ) ) {
		return;
	}
	$count = kotlinskidev_offer_placeholder_count();
	if ( $count < 1 ) {
		return;
	}
	$admin_bar->add_node( [
		'id'    => 'kotlinskidev-offer-placeholders',
		'title' => esc_html( kotlinskidev_offer_placeholder_message( $count ) ),
		'href'  => admin_url( 'edit.php?post_type=kt_offer' ),
	] );
}
add_action( 'admin_bar_menu', 'kotlinskidev_offer_admin_bar_node', 100 );
