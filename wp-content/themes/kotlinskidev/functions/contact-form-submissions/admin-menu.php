<?php
function kotlinskidev_register_contact_submissions_page(): void
{
    $menu_title   = esc_html__( 'Submissions', 'kotlinskidev' );
    $unread_count = kotlinskidev_contact_submissions_unread_count();

    if ( $unread_count > 0 ) {
        $menu_title .= sprintf(
            ' <span class="awaiting-mod count-%1$d"><span class="pending-count">%1$d</span></span>',
            $unread_count
        );
    }

    add_menu_page(
        esc_html__( 'Contact Submissions', 'kotlinskidev' ),
        $menu_title,
        'manage_options',
        'kotlinskidev-contact-submissions',
        'kotlinskidev_render_contact_submissions_page',
        'dashicons-email-alt',
        30
    );
}
add_action( 'admin_menu', 'kotlinskidev_register_contact_submissions_page' );

function kotlinskidev_render_contact_submissions_page(): void
{
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'You do not have permission to access this page.', 'kotlinskidev' ) );
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only view-state routing, no state change
    $action = isset( $_GET['action'] ) ? sanitize_key( wp_unslash( $_GET['action'] ) ) : '';
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only view-state routing, no state change
    $submission_id = isset( $_GET['id'] ) ? absint( $_GET['id'] ) : 0;

    if ( 'view' === $action && $submission_id ) {
        kotlinskidev_render_contact_submission_detail( $submission_id );
        return;
    }

    kotlinskidev_render_contact_submissions_list();
}
