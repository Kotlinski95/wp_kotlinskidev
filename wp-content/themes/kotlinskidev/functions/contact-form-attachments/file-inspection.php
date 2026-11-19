<?php
function kotlinskidev_contact_attachment_read_head(string $path, int $length): string
{
    $handle = fopen($path, 'rb');

    if (false === $handle) {
        return '';
    }

    $head = (string) fread($handle, $length);
    fclose($handle);

    return $head;
}

function kotlinskidev_contact_attachment_detect_mime(string $path): string
{
    $finfo = finfo_open(FILEINFO_MIME_TYPE);

    if (false === $finfo) {
        return '';
    }

    $mime = finfo_file($finfo, $path);

    return is_string($mime) ? $mime : '';
}

function kotlinskidev_contact_attachment_signature_matches(string $extension, string $path): bool
{
    $head = kotlinskidev_contact_attachment_read_head($path, 16);

    switch ($extension) {
        case 'pdf':
            return str_starts_with($head, '%PDF-');
        case 'png':
            return str_starts_with($head, "\x89PNG\r\n\x1a\n");
        case 'jpg':
        case 'jpeg':
            return str_starts_with($head, "\xFF\xD8\xFF");
        case 'docx':
        case 'odt':
        case 'zip':
            return str_starts_with($head, "PK\x03\x04");
        case 'rtf':
            return str_starts_with($head, '{\\rtf');
        case 'doc':
            return str_starts_with($head, "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1");
        case 'txt':
            $content = (string) file_get_contents($path);

            return !str_contains($content, "\0") && mb_check_encoding($content, 'UTF-8');
    }

    return false;
}

function kotlinskidev_contact_attachment_archive_is_safe(string $extension, string $path): bool
{
    if (!class_exists('ZipArchive')) {
        return false;
    }

    $archive = new ZipArchive();

    if (true !== $archive->open($path, ZipArchive::RDONLY)) {
        return false;
    }

    $safe = $archive->numFiles <= KOTLINSKIDEV_CONTACT_ATTACHMENT_MAX_ZIP_ENTRIES;

    for ($index = 0; $safe && $index < $archive->numFiles; $index++) {
        $entry = strtolower((string) $archive->getNameIndex($index));
        $leaf  = kotlinskidev_contact_attachment_leaf_name($entry);

        if ('vbaproject.bin' === $leaf || 'vbadata.xml' === $leaf) {
            $safe = false;
        }

        if ('odt' === $extension && (str_starts_with($entry, 'basic/') || str_starts_with($entry, 'scripts/'))) {
            $safe = false;
        }
    }

    if ($safe && 'docx' === $extension) {
        $safe = false !== $archive->locateName('[Content_Types].xml');
    }

    $archive->close();

    return $safe;
}
