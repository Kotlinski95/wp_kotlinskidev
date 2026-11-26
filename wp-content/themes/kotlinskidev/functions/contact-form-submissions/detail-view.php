<?php
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
        <table class="form-table">
            <?php kotlinskidev_render_contact_submission_fields( $submission ); ?>
            <?php kotlinskidev_render_contact_submission_attachments_row( $submission ); ?>
            <?php kotlinskidev_render_contact_submission_source_row( $submission ); ?>
        </table>
        <p>
            <a href="<?php echo esc_url( $delete_url ); ?>" class="button" onclick="return confirm('<?php echo esc_js( __( 'Delete this submission permanently?', 'kotlinskidev' ) ); ?>');">
                <?php esc_html_e( 'Delete', 'kotlinskidev' ); ?>
            </a>
        </p>
    </div>
    <?php
}

function kotlinskidev_render_contact_submission_fields( object $submission ): void
{
    ?>
            <tr>
                <th scope="row"><?php esc_html_e( 'Date', 'kotlinskidev' ); ?></th>
                <td><?php echo esc_html( mysql2date( 'Y-m-d H:i', $submission->submitted_at ) ); ?></td>
            </tr>
            <tr>
                <th scope="row"><?php esc_html_e( 'Name', 'kotlinskidev' ); ?></th>
                <td><?php echo esc_html( $submission->name ); ?></td>
            </tr>
            <tr>
                <th scope="row"><?php esc_html_e( 'Email', 'kotlinskidev' ); ?></th>
                <td><a href="<?php echo esc_url( 'mailto:' . $submission->email ); ?>"><?php echo esc_html( $submission->email ); ?></a></td>
            </tr>
            <tr>
                <th scope="row"><?php esc_html_e( 'Topic', 'kotlinskidev' ); ?></th>
                <td><?php echo esc_html( $submission->topic ); ?></td>
            </tr>
            <tr>
                <th scope="row"><?php esc_html_e( 'Message', 'kotlinskidev' ); ?></th>
                <td style="white-space:pre-line;"><?php echo esc_html( $submission->message ); ?></td>
            </tr>
            <tr>
                <th scope="row"><?php esc_html_e( 'Agreed to be contacted', 'kotlinskidev' ); ?></th>
                <td><?php echo $submission->agree ? esc_html__( 'Yes', 'kotlinskidev' ) : esc_html__( 'No', 'kotlinskidev' ); ?></td>
            </tr>
            <tr>
                <th scope="row"><?php esc_html_e( 'Email delivery', 'kotlinskidev' ); ?></th>
                <td><?php echo $submission->email_sent ? '✅ ' . esc_html__( 'Sent', 'kotlinskidev' ) : '⚠️ ' . esc_html__( 'Failed', 'kotlinskidev' ); ?></td>
            </tr>
    <?php
}

function kotlinskidev_render_contact_submission_attachments_row( object $submission ): void
{
    $attachment_records = ! empty( $submission->attachments ) ? json_decode( (string) $submission->attachments, true ) : [];

    if ( ! is_array( $attachment_records ) || [] === $attachment_records ) {
        return;
    }
    ?>
            <tr>
                <th scope="row"><?php esc_html_e( 'Attachments', 'kotlinskidev' ); ?></th>
                <td>
                    <?php foreach ( $attachment_records as $record ) : ?>
                        <div>
                            <?php echo esc_html( (string) ( $record['name'] ?? '' ) ); ?>
                            (<?php echo esc_html( size_format( absint( $record['size'] ?? 0 ) ) ); ?>)
                            <code><?php echo esc_html( (string) ( $record['sha256'] ?? '' ) ); ?></code>
                        </div>
                    <?php endforeach; ?>
                </td>
            </tr>
    <?php
}

function kotlinskidev_render_contact_submission_source_row( object $submission ): void
{
    if ( ! $submission->post_id ) {
        return;
    }
    ?>
            <tr>
                <th scope="row"><?php esc_html_e( 'Submitted from', 'kotlinskidev' ); ?></th>
                <td><a href="<?php echo esc_url( (string) get_permalink( (int) $submission->post_id ) ); ?>" target="_blank" rel="noopener"><?php echo esc_html( get_the_title( (int) $submission->post_id ) ); ?></a></td>
            </tr>
    <?php
}
