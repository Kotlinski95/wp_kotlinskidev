<?php
const KOTLINSKIDEV_CONTACT_ATTACHMENT_PURGE_HOOK = 'kotlinskidev_contact_attachments_purge';
const KOTLINSKIDEV_CONTACT_ATTACHMENT_RETENTION_DAYS = 7;
const KOTLINSKIDEV_CONTACT_ATTACHMENT_RATE_LIMIT_MAX = 5;
const KOTLINSKIDEV_CONTACT_ATTACHMENT_RATE_LIMIT_WINDOW = 600;
const KOTLINSKIDEV_CONTACT_ATTACHMENT_MAX_ZIP_ENTRIES = 500;

function kotlinskidev_contact_attachment_limits(): array
{
    $defaults = [
        'max_files'      => 3,
        'max_total_bytes' => 10 * 1048576,
        'max_file_bytes' => 8 * 1048576,
        'max_name_length' => 100,
    ];

    $filtered = apply_filters('kotlinskidev_contact_attachment_limits', $defaults);
    $filtered = is_array($filtered) ? $filtered : $defaults;
    $limits   = [];

    foreach ($defaults as $key => $default) {
        $value          = isset($filtered[$key]) ? (int) $filtered[$key] : $default;
        $limits[$key]   = $value > 0 ? $value : $default;
    }

    return $limits;
}

function kotlinskidev_contact_attachment_allowed_types(): array
{
    return [
        'pdf'  => ['application/pdf'],
        'doc'  => ['application/msword', 'application/vnd.ms-office', 'application/x-ole-storage', 'application/CDFV2'],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
        'odt'  => ['application/vnd.oasis.opendocument.text', 'application/zip'],
        'rtf'  => ['text/rtf', 'application/rtf'],
        'txt'  => ['text/plain'],
        'png'  => ['image/png'],
        'jpg'  => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'zip'  => ['application/zip', 'application/x-zip-compressed'],
    ];
}

function kotlinskidev_contact_attachment_blocked_extensions(): array
{
    return [
        'docm', 'dotm', 'xlsm', 'pptm', 'xlsb', 'xlam', 'ppam',
        'html', 'htm', 'xhtml', 'svg', 'js', 'mjs', 'php', 'phtml', 'phar', 'php3', 'php4', 'php5', 'php7', 'php8', 'pht', 'phps',
        'exe', 'bat', 'cmd', 'com', 'sh', 'bash', 'jar', 'dll', 'scr', 'msi', 'lnk', 'iso', 'img', 'vbs', 'vbe', 'wsf', 'ps1', 'py', 'pl', 'cgi', 'asp', 'aspx', 'jsp', 'htaccess',
    ];
}

function kotlinskidev_contact_attachment_accept_attribute(): string
{
    return implode(',', array_map(static fn (string $extension): string => '.' . $extension, array_keys(kotlinskidev_contact_attachment_allowed_types())));
}

function kotlinskidev_contact_attachment_format_bytes(int $bytes): string
{
    if ($bytes >= 1048576) {
        return round($bytes / 1048576, 1) . ' MB';
    }

    return max(1, (int) round($bytes / 1024)) . ' KB';
}
