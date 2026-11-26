<?php
function kotlinskidev_contact_attachment_unique_display_name(string $name, array $taken): string
{
    if (!isset($taken[$name])) {
        return $name;
    }

    $dot  = strrpos($name, '.');
    $stem = false === $dot ? $name : substr($name, 0, $dot);
    $ext  = false === $dot ? '' : substr($name, $dot);

    for ($counter = 2; isset($taken[$stem . ' (' . $counter . ')' . $ext]); $counter++) {
    }

    return $stem . ' (' . $counter . ')' . $ext;
}

function kotlinskidev_contact_attachment_store(array $uploads): ?array
{
    $dir = kotlinskidev_contact_attachment_base_dir();

    if (!kotlinskidev_contact_attachment_ensure_dir($dir)) {
        return null;
    }

    $limits = kotlinskidev_contact_attachment_limits();
    $stored = [];
    $taken  = [];

    foreach ($uploads as $upload) {
        $extension = kotlinskidev_contact_attachment_extension($upload['name']);
        $display   = kotlinskidev_contact_attachment_unique_display_name(
            kotlinskidev_contact_attachment_display_name($upload['name'], $extension, $limits['max_name_length']),
            $taken
        );
        $path      = $dir . '/' . bin2hex(random_bytes(16));

        if (!kotlinskidev_contact_attachment_move_upload($upload['tmp_name'], $path)) {
            kotlinskidev_contact_attachment_delete($stored);

            return null;
        }

        chmod($path, 0600);
        $taken[$display] = true;
        $stored[]        = [
            'name'   => $display,
            'path'   => $path,
            'size'   => (int) filesize($path),
            'sha256' => (string) hash_file('sha256', $path),
        ];
    }

    return $stored;
}

function kotlinskidev_contact_attachment_delete(array $stored): void
{
    foreach ($stored as $file) {
        if (isset($file['path']) && is_file($file['path'])) {
            unlink($file['path']);
        }
    }
}

function kotlinskidev_contact_attachment_mail_attachments(array $stored): array
{
    $attachments = [];

    foreach ($stored as $file) {
        $attachments[$file['name']] = $file['path'];
    }

    return $attachments;
}

function kotlinskidev_contact_attachment_record_json(array $stored): ?string
{
    if ([] === $stored) {
        return null;
    }

    $records = array_map(
        static fn (array $file): array => ['name' => $file['name'], 'size' => $file['size'], 'sha256' => $file['sha256']],
        $stored
    );

    return wp_json_encode($records);
}

function kotlinskidev_contact_attachment_email_block(array $stored): string
{
    if ([] === $stored) {
        return '';
    }

    $lines = array_map(
        static fn (array $file): string => esc_html($file['name']) . ' (' . esc_html(kotlinskidev_contact_attachment_format_bytes((int) $file['size'])) . ')',
        $stored
    );

    return '    <div class="field"><span class="label">Attachments</span><div class="value">' . implode('<br>', $lines) . '</div></div>' . "\n";
}
