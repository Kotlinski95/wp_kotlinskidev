<?php
function kotlinskidev_handle_delete_contact_submission(): void
{
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'You do not have permission to perform this action.', 'kotlinskidev' ), '', [ 'response' => 403 ] );
    }

    $submission_id = isset( $_GET['id'] ) ? absint( $_GET['id'] ) : 0;

    check_admin_referer( 'kotlinskidev_delete_contact_submission_' . $submission_id );

    if ( $submission_id ) {
        global $wpdb;
        $wpdb->delete( kotlinskidev_contact_submissions_table_name(), [ 'id' => $submission_id ], [ '%d' ] );
    }

    wp_safe_redirect( admin_url( 'admin.php?page=kotlinskidev-contact-submissions' ) );
    exit;
}
add_action( 'admin_post_kotlinskidev_delete_contact_submission', 'kotlinskidev_handle_delete_contact_submission' );
