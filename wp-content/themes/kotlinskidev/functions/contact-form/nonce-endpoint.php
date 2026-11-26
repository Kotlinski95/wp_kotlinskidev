<?php
function kotlinskidev_contact_form_send_nonce() {
    nocache_headers();
    wp_send_json_success( [ 'nonce' => wp_create_nonce( 'kotlinskidev_contact_form_submit' ) ] );
}
add_action( 'wp_ajax_nopriv_kotlinskidev_contact_form_nonce', 'kotlinskidev_contact_form_send_nonce' );
add_action( 'wp_ajax_kotlinskidev_contact_form_nonce', 'kotlinskidev_contact_form_send_nonce' );
