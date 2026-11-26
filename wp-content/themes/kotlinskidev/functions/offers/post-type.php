<?php
function kotlinskidev_register_offer_post_type(): void {
	register_post_type( 'kt_offer', [
		'labels' => [
			'name'          => __( 'Offers', 'kotlinskidev' ),
			'singular_name' => __( 'Offer', 'kotlinskidev' ),
			'add_new_item'  => __( 'Add New Offer', 'kotlinskidev' ),
			'edit_item'     => __( 'Edit Offer', 'kotlinskidev' ),
			'search_items'  => __( 'Search Offers', 'kotlinskidev' ),
			'not_found'     => __( 'No offers found', 'kotlinskidev' ),
		],
		'public'              => false,
		'publicly_queryable'  => false,
		'exclude_from_search' => true,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'show_in_rest'        => true,
		'menu_icon'           => 'dashicons-tag',
		'menu_position'       => 24,
		'supports'            => [ 'title', 'custom-fields', 'page-attributes' ],
		'has_archive'         => false,
	] );
}
add_action( 'init', 'kotlinskidev_register_offer_post_type' );
