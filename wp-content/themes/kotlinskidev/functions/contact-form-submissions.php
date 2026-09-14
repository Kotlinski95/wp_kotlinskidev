<?php
function kotlinskidev_contact_submissions_table_name(): string
{
    global $wpdb;
    return $wpdb->prefix . 'kotlinskidev_contact_submissions';
}

function kotlinskidev_contact_submissions_db_version(): string
{
    return '1.0';
}

function kotlinskidev_contact_submissions_maybe_create_table(): void
{
    if ( get_option( 'kotlinskidev_contact_submissions_db_version' ) === kotlinskidev_contact_submissions_db_version() ) {
        return;
    }

    global $wpdb;
    $table_name      = kotlinskidev_contact_submissions_table_name();
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE {$table_name} (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        post_id BIGINT UNSIGNED NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        topic VARCHAR(255) NOT NULL DEFAULT '',
        message LONGTEXT NOT NULL,
        agree TINYINT(1) NOT NULL DEFAULT 0,
        email_sent TINYINT(1) NOT NULL DEFAULT 0,
        submitted_at DATETIME NOT NULL,
        read_at DATETIME NULL,
        PRIMARY KEY (id),
        KEY submitted_at (submitted_at),
        KEY email_sent (email_sent),
        KEY read_at (read_at)
    ) {$charset_collate};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );

    update_option( 'kotlinskidev_contact_submissions_db_version', kotlinskidev_contact_submissions_db_version() );
}
add_action( 'after_switch_theme', 'kotlinskidev_contact_submissions_maybe_create_table' );
add_action( 'admin_init', 'kotlinskidev_contact_submissions_maybe_create_table' );

function kotlinskidev_save_contact_submission( array $data ): int
{
    global $wpdb;

    $wpdb->insert(
        kotlinskidev_contact_submissions_table_name(),
        [
            'post_id'      => ! empty( $data['post_id'] ) ? absint( $data['post_id'] ) : null,
            'name'         => $data['name'],
            'email'        => $data['email'],
            'topic'        => $data['topic'] ?? '',
            'message'      => $data['message'],
            'agree'        => ! empty( $data['agree'] ) ? 1 : 0,
            'email_sent'   => 0,
            'submitted_at' => current_time( 'mysql' ),
        ],
        [ '%d', '%s', '%s', '%s', '%s', '%d', '%d', '%s' ]
    );

    return (int) $wpdb->insert_id;
}

function kotlinskidev_mark_contact_submission_email_status( int $submission_id, bool $sent ): void
{
    global $wpdb;

    $wpdb->update(
        kotlinskidev_contact_submissions_table_name(),
        [ 'email_sent' => $sent ? 1 : 0 ],
        [ 'id' => $submission_id ],
        [ '%d' ],
        [ '%d' ]
    );
}

function kotlinskidev_contact_submissions_unread_count(): int
{
    global $wpdb;
    $table = kotlinskidev_contact_submissions_table_name();
    return (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE read_at IS NULL" );
}

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

function kotlinskidev_render_contact_submission_delete_link( int $submission_id ): string
{
    return wp_nonce_url(
        admin_url( 'admin-post.php?action=kotlinskidev_delete_contact_submission&id=' . $submission_id ),
        'kotlinskidev_delete_contact_submission_' . $submission_id
    );
}

function kotlinskidev_render_contact_submission_detail( int $submission_id ): void
{
    global $wpdb;
    $table      = kotlinskidev_contact_submissions_table_name();
    $submission = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $submission_id ) );

    if ( ! $submission ) {
        echo '<div class="wrap"><p>' . esc_html__( 'Submission not found.', 'kotlinskidev' ) . '</p></div>';
        return;
    }

    if ( ! $submission->read_at ) {
        $wpdb->update( $table, [ 'read_at' => current_time( 'mysql' ) ], [ 'id' => $submission_id ], [ '%s' ], [ '%d' ] );
    }

    $list_url   = admin_url( 'admin.php?page=kotlinskidev-contact-submissions' );
    $delete_url = kotlinskidev_render_contact_submission_delete_link( $submission_id );
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Submission Details', 'kotlinskidev' ); ?></h1>
        <p><a href="<?php echo esc_url( $list_url ); ?>">&larr; <?php esc_html_e( 'Back to all submissions', 'kotlinskidev' ); ?></a></p>
        <table class="form-table" role="presentation">
            <tr>
                <th><?php esc_html_e( 'Date', 'kotlinskidev' ); ?></th>
                <td><?php echo esc_html( mysql2date( 'Y-m-d H:i', $submission->submitted_at ) ); ?></td>
            </tr>
            <tr>
                <th><?php esc_html_e( 'Name', 'kotlinskidev' ); ?></th>
                <td><?php echo esc_html( $submission->name ); ?></td>
            </tr>
            <tr>
                <th><?php esc_html_e( 'Email', 'kotlinskidev' ); ?></th>
                <td><a href="<?php echo esc_url( 'mailto:' . $submission->email ); ?>"><?php echo esc_html( $submission->email ); ?></a></td>
            </tr>
            <tr>
                <th><?php esc_html_e( 'Topic', 'kotlinskidev' ); ?></th>
                <td><?php echo esc_html( $submission->topic ); ?></td>
            </tr>
            <tr>
                <th><?php esc_html_e( 'Message', 'kotlinskidev' ); ?></th>
                <td style="white-space:pre-line;"><?php echo esc_html( $submission->message ); ?></td>
            </tr>
            <tr>
                <th><?php esc_html_e( 'Agreed to be contacted', 'kotlinskidev' ); ?></th>
                <td><?php echo $submission->agree ? esc_html__( 'Yes', 'kotlinskidev' ) : esc_html__( 'No', 'kotlinskidev' ); ?></td>
            </tr>
            <tr>
                <th><?php esc_html_e( 'Email delivery', 'kotlinskidev' ); ?></th>
                <td><?php echo $submission->email_sent ? '✅ ' . esc_html__( 'Sent', 'kotlinskidev' ) : '⚠️ ' . esc_html__( 'Failed', 'kotlinskidev' ); ?></td>
            </tr>
            <?php if ( $submission->post_id ) : ?>
            <tr>
                <th><?php esc_html_e( 'Submitted from', 'kotlinskidev' ); ?></th>
                <td><a href="<?php echo esc_url( (string) get_permalink( (int) $submission->post_id ) ); ?>" target="_blank" rel="noopener"><?php echo esc_html( get_the_title( (int) $submission->post_id ) ); ?></a></td>
            </tr>
            <?php endif; ?>
        </table>
        <p>
            <a href="<?php echo esc_url( $delete_url ); ?>" class="button" onclick="return confirm('<?php echo esc_js( __( 'Delete this submission permanently?', 'kotlinskidev' ) ); ?>');">
                <?php esc_html_e( 'Delete', 'kotlinskidev' ); ?>
            </a>
        </p>
    </div>
    <?php
}

function kotlinskidev_render_contact_submissions_list(): void
{
    if ( ! class_exists( 'Kotlinskidev_Contact_Submissions_List_Table' ) ) {
        require_once __DIR__ . '/class-contact-submissions-list-table.php';
    }

    $list_table = new Kotlinskidev_Contact_Submissions_List_Table();
    $list_table->prepare_items();

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only filter state, no state change
    $current_status = isset( $_GET['status'] ) ? sanitize_key( wp_unslash( $_GET['status'] ) ) : 'all';
    $base_url        = admin_url( 'admin.php?page=kotlinskidev-contact-submissions' );

    $filters = [
        'all'    => esc_html__( 'All', 'kotlinskidev' ),
        'unread' => esc_html__( 'Unread', 'kotlinskidev' ),
        'sent'   => esc_html__( 'Sent', 'kotlinskidev' ),
        'failed' => esc_html__( 'Failed', 'kotlinskidev' ),
    ];
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Contact Form Submissions', 'kotlinskidev' ); ?></h1>
        <ul class="subsubsub">
            <?php
            $links = [];
            foreach ( $filters as $key => $label ) {
                $url     = 'all' === $key ? $base_url : add_query_arg( 'status', $key, $base_url );
                $class   = $key === $current_status ? ' class="current"' : '';
                $links[] = sprintf( '<li><a href="%s"%s>%s</a></li>', esc_url( $url ), $class, $label );
            }
            echo wp_kses_post( implode( ' | ', $links ) );
            ?>
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
