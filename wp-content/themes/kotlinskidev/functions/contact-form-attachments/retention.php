<?php
function kotlinskidev_contact_attachment_retain(array $stored, int $submission_id): void
{
    $target = kotlinskidev_contact_attachment_base_dir() . '/retained/' . absint($submission_id);

    if (!kotlinskidev_contact_attachment_ensure_dir($target)) {
        return;
    }

    foreach ($stored as $file) {
        if (is_file($file['path'])) {
            rename($file['path'], $target . '/' . basename($file['path']));
        }
    }
}

function kotlinskidev_contact_attachment_alert_retained(): void
{
    kotlinskidev_send_mail_failure_alert(
        sprintf(
            'Contact form email with attachments failed to send. Attachments are retained privately on the server for %d days.',
            KOTLINSKIDEV_CONTACT_ATTACHMENT_RETENTION_DAYS
        )
    );
}

function kotlinskidev_contact_attachments_purge(): void
{
    $root = kotlinskidev_contact_attachment_base_dir() . '/retained';

    if (!is_dir($root)) {
        return;
    }

    $cutoff = time() - KOTLINSKIDEV_CONTACT_ATTACHMENT_RETENTION_DAYS * DAY_IN_SECONDS;

    foreach (scandir($root) ?: [] as $entry) {
        $directory = $root . '/' . $entry;

        if ('.' === $entry || '..' === $entry || is_link($directory) || !is_dir($directory)) {
            continue;
        }

        foreach (scandir($directory) ?: [] as $file) {
            $path = $directory . '/' . $file;

            if (is_file($path) && !is_link($path) && filemtime($path) < $cutoff) {
                unlink($path);
            }
        }

        if ([] === array_diff(scandir($directory) ?: [], ['.', '..'])) {
            rmdir($directory);
        }
    }
}
add_action(KOTLINSKIDEV_CONTACT_ATTACHMENT_PURGE_HOOK, 'kotlinskidev_contact_attachments_purge');

function kotlinskidev_contact_attachments_schedule_purge(): void
{
    if (false === wp_next_scheduled(KOTLINSKIDEV_CONTACT_ATTACHMENT_PURGE_HOOK)) {
        wp_schedule_event(time(), 'daily', KOTLINSKIDEV_CONTACT_ATTACHMENT_PURGE_HOOK);
    }
}
add_action('init', 'kotlinskidev_contact_attachments_schedule_purge');
