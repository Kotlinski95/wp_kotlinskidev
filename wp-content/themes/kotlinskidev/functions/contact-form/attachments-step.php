<?php
function kotlinskidev_contact_form_store_attachments( $contact_block ): array {
    $uploads = kotlinskidev_contact_attachments_enabled( $contact_block ) ? kotlinskidev_contact_attachment_collect_uploads() : [];
    $stored  = [];

    if ( [] !== $uploads ) {
        if ( ! kotlinskidev_contact_attachment_register_attempt() ) {
            kotlinskidev_contact_form_redirect_with_error( 'ratelimit' );
        }

        $attachment_error = kotlinskidev_contact_attachment_validate( $uploads );
        if ( '' !== $attachment_error ) {
            kotlinskidev_contact_form_redirect_with_error( $attachment_error );
        }

        $stored = kotlinskidev_contact_attachment_store( $uploads );
        if ( null === $stored ) {
            kotlinskidev_contact_form_redirect_with_error( 'attachment_failed' );
        }
    }

    return $stored;
}
