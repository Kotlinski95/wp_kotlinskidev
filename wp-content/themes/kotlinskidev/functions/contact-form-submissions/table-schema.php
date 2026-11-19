<?php
function kotlinskidev_contact_submissions_table_name(): string
{
    global $wpdb;
    return $wpdb->prefix . 'kotlinskidev_contact_submissions';
}

function kotlinskidev_contact_submissions_db_version(): string
{
    return '1.1';
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
        attachments LONGTEXT NULL,
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
