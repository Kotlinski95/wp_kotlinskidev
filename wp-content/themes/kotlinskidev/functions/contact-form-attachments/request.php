<?php
function kotlinskidev_contact_attachment_is_oversized_request(): bool
{
    $content_length = isset($_SERVER['CONTENT_LENGTH']) ? (int) $_SERVER['CONTENT_LENGTH'] : 0;

    return $content_length > 0 && empty($_POST) && empty($_FILES);
}

function kotlinskidev_contact_attachments_enabled($contact_block): bool
{
    $enabled = is_array($contact_block) && true === ($contact_block['attrs']['enableAttachments'] ?? false);

    return (bool) apply_filters('kotlinskidev_contact_attachments_enabled', $enabled, $contact_block);
}

function kotlinskidev_contact_attachment_collect_uploads(): array
{
    if (!isset($_FILES['attachments']) || !is_array($_FILES['attachments'])) {
        return [];
    }

    $raw     = $_FILES['attachments'];
    $names   = (array) ($raw['name'] ?? []);
    $uploads = [];

    foreach (array_keys($names) as $index) {
        $error = (int) (((array) ($raw['error'] ?? []))[$index] ?? UPLOAD_ERR_NO_FILE);

        if (UPLOAD_ERR_NO_FILE === $error) {
            continue;
        }

        $uploads[] = [
            'name'     => (string) $names[$index],
            'tmp_name' => (string) (((array) ($raw['tmp_name'] ?? []))[$index] ?? ''),
            'error'    => $error,
        ];
    }

    return $uploads;
}

if (!function_exists('kotlinskidev_contact_attachment_is_uploaded')) {
    function kotlinskidev_contact_attachment_is_uploaded(string $path): bool
    {
        return is_uploaded_file($path);
    }
}

if (!function_exists('kotlinskidev_contact_attachment_move_upload')) {
    function kotlinskidev_contact_attachment_move_upload(string $from, string $to): bool
    {
        return move_uploaded_file($from, $to);
    }
}
