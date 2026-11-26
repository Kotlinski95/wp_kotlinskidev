<?php
function kotlinskidev_contact_attachment_validate_transfer(array $upload): string
{
    $error = (int) $upload['error'];

    if (UPLOAD_ERR_INI_SIZE === $error || UPLOAD_ERR_FORM_SIZE === $error) {
        return 'attachment_size';
    }

    if (UPLOAD_ERR_OK !== $error) {
        return 'attachment_failed';
    }

    $path = $upload['tmp_name'];

    if ('' === $path || !kotlinskidev_contact_attachment_is_uploaded($path) || !is_file($path)) {
        return 'attachment_failed';
    }

    return '';
}

function kotlinskidev_contact_attachment_validate_upload(array $upload, array $limits): string
{
    $transfer_error = kotlinskidev_contact_attachment_validate_transfer($upload);

    if ('' !== $transfer_error) {
        return $transfer_error;
    }

    $path = $upload['tmp_name'];
    $extension = kotlinskidev_contact_attachment_extension($upload['name']);

    if ('' === $extension) {
        return 'attachment_type';
    }

    $size = (int) filesize($path);

    if ($size > $limits['max_file_bytes']) {
        return 'attachment_size';
    }

    if ($size < 1) {
        return 'attachment_type';
    }

    $mime = kotlinskidev_contact_attachment_detect_mime($path);

    if (!in_array($mime, kotlinskidev_contact_attachment_allowed_types()[$extension], true)) {
        return 'attachment_type';
    }

    if (!kotlinskidev_contact_attachment_signature_matches($extension, $path)) {
        return 'attachment_type';
    }

    if (in_array($extension, ['docx', 'odt'], true) && !kotlinskidev_contact_attachment_archive_is_safe($extension, $path)) {
        return 'attachment_type';
    }

    return '';
}

function kotlinskidev_contact_attachment_validate(array $uploads): string
{
    $limits = kotlinskidev_contact_attachment_limits();

    if (count($uploads) > $limits['max_files']) {
        return 'attachment_count';
    }

    $total = 0;

    foreach ($uploads as $upload) {
        $error = kotlinskidev_contact_attachment_validate_upload($upload, $limits);

        if ('' !== $error) {
            return $error;
        }

        $total += (int) filesize($upload['tmp_name']);
    }

    return $total > $limits['max_total_bytes'] ? 'attachment_size' : '';
}
