<?php
function kotlinskidev_contact_submissions_status_filters(): array
{
    return [
        'all'    => esc_html__( 'All', 'kotlinskidev' ),
        'unread' => esc_html__( 'Unread', 'kotlinskidev' ),
        'sent'   => esc_html__( 'Sent', 'kotlinskidev' ),
        'failed' => esc_html__( 'Failed', 'kotlinskidev' ),
    ];
}

function kotlinskidev_contact_submissions_status_filter_links( string $current_status, string $base_url ): string
{
    $links = [];
    foreach ( kotlinskidev_contact_submissions_status_filters() as $key => $label ) {
        $url     = 'all' === $key ? $base_url : add_query_arg( 'status', $key, $base_url );
        $class   = $key === $current_status ? ' class="current"' : '';
        $links[] = sprintf( '<li><a href="%s"%s>%s</a></li>', esc_url( $url ), $class, $label );
    }

    return implode( ' | ', $links );
}

function kotlinskidev_render_contact_submissions_list(): void
{
    if ( ! class_exists( 'Kotlinskidev_Contact_Submissions_List_Table' ) ) {
        require_once __DIR__ . '/../class-contact-submissions-list-table.php';
    }

    $list_table = new Kotlinskidev_Contact_Submissions_List_Table();
    $list_table->prepare_items();

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only filter state, no state change
    $current_status = isset( $_GET['status'] ) ? sanitize_key( wp_unslash( $_GET['status'] ) ) : 'all';
    $base_url        = admin_url( 'admin.php?page=kotlinskidev-contact-submissions' );
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Contact Form Submissions', 'kotlinskidev' ); ?></h1>
        <ul class="subsubsub">
            <?php echo wp_kses_post( kotlinskidev_contact_submissions_status_filter_links( $current_status, $base_url ) ); ?>
        </ul>
        <form method="post">
            <?php
            wp_nonce_field( 'bulk-submissions' );
            $list_table->display();
            ?>
        </form>
    </div>
    <?php
}
