<?php
function kotlinskidev_contact_attachment_extension(string $name): string
{
    if ('' === $name || !mb_check_encoding($name, 'UTF-8') || 1 === preg_match('/[\x00-\x1F\x7F]/', $name)) {
        return '';
    }

    $segments = explode('.', strtolower(kotlinskidev_contact_attachment_leaf_name($name)));

    if (count($segments) < 2) {
        return '';
    }

    $extension = (string) array_pop($segments);

    if (!array_key_exists($extension, kotlinskidev_contact_attachment_allowed_types())) {
        return '';
    }

    $blocked = kotlinskidev_contact_attachment_blocked_extensions();

    foreach (array_slice($segments, 1) as $segment) {
        if (in_array(trim($segment), $blocked, true)) {
            return '';
        }
    }

    if (in_array('', array_slice($segments, 1), true)) {
        return '';
    }

    return $extension;
}

function kotlinskidev_contact_attachment_leaf_name(string $name): string
{
    $parts = explode('/', str_replace('\\', '/', $name));

    return (string) end($parts);
}

function kotlinskidev_contact_attachment_display_name(string $raw, string $extension, int $max_length): string
{
    $name = kotlinskidev_contact_attachment_leaf_name($raw);
    $name = (string) preg_replace('/[\x00-\x1F\x7F]/', '', $name);
    $name = (string) preg_replace('/[\x{202A}-\x{202E}\x{2066}-\x{2069}\x{200B}-\x{200F}\x{FEFF}]/u', '', $name);
    $name = (string) preg_replace('/[<>:"|?*]/', '', $name);
    $name = trim((string) preg_replace('/\s+/u', ' ', $name));

    $suffix = '.' . $extension;
    if (str_ends_with(strtolower($name), $suffix)) {
        $name = substr($name, 0, -strlen($suffix));
    }

    $name = trim($name, " .\t");
    $name = '' === $name ? 'attachment' : $name;
    $name = mb_substr($name, 0, max(1, $max_length - strlen($suffix)));
    $name = rtrim($name, " .");

    return ('' === $name ? 'attachment' : $name) . $suffix;
}
