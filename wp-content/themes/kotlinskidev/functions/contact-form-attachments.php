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

function kotlinskidev_contact_attachment_validate_upload(array $upload, array $limits): string
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

function kotlinskidev_contact_attachment_rate_limit_key(): string
{
    $address = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';

    return 'kotlinskidev_attach_rl_' . hash('sha256', $address . wp_salt('nonce'));
}

function kotlinskidev_contact_attachment_register_attempt(): bool
{
    $key   = kotlinskidev_contact_attachment_rate_limit_key();
    $state = get_transient($key);
    $now   = time();

    if (!is_array($state) || !isset($state['count'], $state['started']) || $now - (int) $state['started'] >= KOTLINSKIDEV_CONTACT_ATTACHMENT_RATE_LIMIT_WINDOW) {
        $state = ['count' => 0, 'started' => $now];
    }

    if ((int) $state['count'] >= KOTLINSKIDEV_CONTACT_ATTACHMENT_RATE_LIMIT_MAX) {
        return false;
    }

    $state['count'] = (int) $state['count'] + 1;
    $remaining      = max(1, KOTLINSKIDEV_CONTACT_ATTACHMENT_RATE_LIMIT_WINDOW - ($now - (int) $state['started']));
    set_transient($key, $state, $remaining);

    return true;
}

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
