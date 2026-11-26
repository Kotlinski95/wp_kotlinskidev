<?php
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
            'attachments'  => $data['attachments'] ?? null,
            'email_sent'   => 0,
            'submitted_at' => current_time( 'mysql' ),
        ],
        [ '%d', '%s', '%s', '%s', '%s', '%d', '%s', '%d', '%s' ]
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
