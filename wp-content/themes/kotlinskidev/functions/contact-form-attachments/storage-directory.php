<?php
function kotlinskidev_contact_attachment_default_dir(): string
{
    $parent  = dirname(untrailingslashit(ABSPATH));
    $private = $parent . '/kotlinskidev-private';

    if (is_dir($private) ? is_writable($private) : is_writable($parent)) {
        return $private . '/contact-attachments';
    }

    return trailingslashit(get_temp_dir()) . 'kotlinskidev-contact-attachments';
}

function kotlinskidev_contact_attachment_base_dir(): string
{
    $dir = apply_filters('kotlinskidev_contact_attachment_dir', kotlinskidev_contact_attachment_default_dir());

    return untrailingslashit((string) $dir);
}

function kotlinskidev_contact_attachment_dir_is_inside_web_root(string $dir): bool
{
    $root = realpath(untrailingslashit(ABSPATH));
    $real = realpath($dir);

    return false !== $root && false !== $real && str_starts_with($real . '/', $root . '/');
}

function kotlinskidev_contact_attachment_ensure_dir(string $dir): bool
{
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
        return false;
    }

    chmod($dir, 0700);

    if (!is_writable($dir)) {
        return false;
    }

    if (kotlinskidev_contact_attachment_dir_is_inside_web_root($dir)) {
        if (!file_exists($dir . '/.htaccess')) {
            file_put_contents($dir . '/.htaccess', "<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
        }

        if (!file_exists($dir . '/index.php')) {
            file_put_contents($dir . '/index.php', "<?php\nexit;\n");
        }
    }

    return true;
}
