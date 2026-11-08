<?php
function kotlinskidev_localize_active_link_state(): void {
	wp_localize_script( 'wp-typescript', 'kotlinskidevActiveLinkState', array(
		'enabled'     => (bool) get_option( 'kotlinskidev_active_link_state_enabled', true ),
		'blockClicks' => (bool) get_option( 'kotlinskidev_active_link_state_block_clicks', true ),
	) );
}
add_action( 'wp_enqueue_scripts', 'kotlinskidev_localize_active_link_state', 20 );
