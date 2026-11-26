<?php
function kotlinskidev_contact_form_handle_submit() {
    if ( kotlinskidev_contact_attachment_is_oversized_request() ) {
        kotlinskidev_contact_form_redirect_with_error( 'toolarge' );
    }

    kotlinskidev_contact_form_require_valid_nonce();

    $submission    = kotlinskidev_contact_form_read_submission();
    $post_id       = kotlinskidev_contact_form_referer_post_id();
    $contact_block = kotlinskidev_contact_form_find_block_in_post( kotlinskidev_contact_form_resolve_source_post( $post_id ) );
    $attributes    = $contact_block['attrs'] ?? [];

    kotlinskidev_contact_form_verify_captcha( $attributes );

    $stored     = kotlinskidev_contact_form_store_attachments( $contact_block );
    $email_sent = kotlinskidev_contact_form_save_and_send( $submission, $post_id, $stored );

    if ( ! $email_sent ) {
        kotlinskidev_contact_form_alert_failed_delivery( $stored );
    }

    $redirect_url = kotlinskidev_contact_form_success_redirect_url(
        $attributes['redirectType'] ?? 'query_param',
        $attributes['thankYouPageUrl'] ?? ''
    );

    wp_safe_redirect( $redirect_url );
    exit;
}
add_action( 'admin_post_nopriv_kotlinskidev_contact_form_submit', 'kotlinskidev_contact_form_handle_submit' );
add_action( 'admin_post_kotlinskidev_contact_form_submit', 'kotlinskidev_contact_form_handle_submit' );
