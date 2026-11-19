<?php
function kotlinskidev_contact_form_require_valid_nonce(): void {
    if (
        ! isset( $_POST['kotlinskidev_contact_form_nonce'] )
        || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['kotlinskidev_contact_form_nonce'] ) ), 'kotlinskidev_contact_form_submit' )
    ) {
        wp_die( esc_html__( 'Security check failed. Please reload the page and try again.', 'kotlinskidev' ), '', [ 'response' => 403 ] );
    }
}

function kotlinskidev_contact_form_read_submission(): array {
    // phpcs:disable WordPress.Security.NonceVerification.Missing -- the nonce is verified by kotlinskidev_contact_form_require_valid_nonce() before this runs
    return [
        'name'    => sanitize_text_field( wp_unslash( $_POST['name'] ?? '' ) ),
        'email'   => sanitize_email( wp_unslash( $_POST['email'] ?? '' ) ),
        'topic'   => sanitize_text_field( wp_unslash( $_POST['topic'] ?? '' ) ),
        'message' => sanitize_textarea_field( wp_unslash( $_POST['message'] ?? '' ) ),
        'agree'   => isset( $_POST['agree'] ) ? 'Yes' : 'No',
    ];
    // phpcs:enable WordPress.Security.NonceVerification.Missing
}
