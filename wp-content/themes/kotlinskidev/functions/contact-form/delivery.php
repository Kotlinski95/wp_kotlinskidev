<?php
function kotlinskidev_contact_form_save_and_send( array $submission, int $post_id, array $stored ): bool {
    $body    = kotlinskidev_contact_form_email_body( $submission, $stored );
    $headers = [
        'Content-Type: text/html; charset=UTF-8',
        'Reply-To: ' . $submission['email'],
    ];

    try {
        $submission_id = kotlinskidev_save_contact_submission(
            [
                'post_id'     => $post_id,
                'name'        => $submission['name'],
                'email'       => $submission['email'],
                'topic'       => $submission['topic'],
                'message'     => $submission['message'],
                'agree'       => 'Yes' === $submission['agree'],
                'attachments' => kotlinskidev_contact_attachment_record_json( $stored ),
            ]
        );

        $email_sent = wp_mail( get_option( 'admin_email' ), 'New Contact Form Submission', $body, $headers, kotlinskidev_contact_attachment_mail_attachments( $stored ) );
        kotlinskidev_mark_contact_submission_email_status( $submission_id, $email_sent );

        if ( ! $email_sent && [] !== $stored ) {
            kotlinskidev_contact_attachment_retain( $stored, $submission_id );
        }

        return $email_sent;
    } finally {
        kotlinskidev_contact_attachment_delete( $stored );
    }
}

function kotlinskidev_contact_form_alert_failed_delivery( array $stored ): void {
    error_log( 'Contact form email sending failed.' );

    if ( [] !== $stored ) {
        kotlinskidev_contact_attachment_alert_retained();
    } else {
        kotlinskidev_alert_contact_mail_failure();
    }
}

function kotlinskidev_contact_form_success_redirect_url( $redirect_type, $thank_you_page_url ): string {
    if ( 'thank_you_page' === $redirect_type ) {
        return ! empty( $thank_you_page_url )
            ? esc_url_raw( $thank_you_page_url )
            : add_query_arg( 'contact-thankyou', '1', home_url() );
    }

    return add_query_arg( 'contact-success', '1', wp_get_referer() ?: home_url() );
}
