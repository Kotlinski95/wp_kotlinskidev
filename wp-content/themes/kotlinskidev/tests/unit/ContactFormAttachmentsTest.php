<?php

use Brain\Monkey\Functions;

if (!defined('ABSPATH')) {
    define('ABSPATH', sys_get_temp_dir() . '/kt-abspath-' . getmypid() . '/');
}

if (!defined('DAY_IN_SECONDS')) {
    define('DAY_IN_SECONDS', 86400);
}

if (!defined('KOTLINSKIDEV_CACHE_PREFIX')) {
    define('KOTLINSKIDEV_CACHE_PREFIX', 'kotlinskidev_');
}

$GLOBALS['kotlinskidev_test_upload_gate'] = true;

if (!function_exists('kotlinskidev_contact_attachment_is_uploaded')) {
    function kotlinskidev_contact_attachment_is_uploaded(string $path): bool
    {
        return $GLOBALS['kotlinskidev_test_upload_gate'] && is_file($path);
    }
}

if (!function_exists('kotlinskidev_contact_attachment_move_upload')) {
    function kotlinskidev_contact_attachment_move_upload(string $from, string $to): bool
    {
        return rename($from, $to);
    }
}

require_once __DIR__ . '/../../functions/contact-form-attachments.php';
require_once __DIR__ . '/../../functions/mail-failure-alerts.php';

function kotlinskidev_test_attachment_tmp_dir(): string
{
    static $dir = null;

    if (null === $dir) {
        $dir = sys_get_temp_dir() . '/kt-attach-' . getmypid() . '-' . bin2hex(random_bytes(4));
        mkdir($dir, 0700, true);
    }

    return $dir;
}

function kotlinskidev_test_attachment_make_file(string $content): string
{
    $path = kotlinskidev_test_attachment_tmp_dir() . '/' . bin2hex(random_bytes(6));
    file_put_contents($path, $content);

    return $path;
}

function kotlinskidev_test_attachment_zip(array $entries): string
{
    $path    = kotlinskidev_test_attachment_tmp_dir() . '/' . bin2hex(random_bytes(6)) . '.zip';
    $archive = new ZipArchive();
    $archive->open($path, ZipArchive::CREATE);
    foreach ($entries as $name => $content) {
        $archive->addFromString($name, $content);
    }
    $archive->close();

    return $path;
}

function kotlinskidev_test_attachment_upload(string $name, string $path, int $error = UPLOAD_ERR_OK): array
{
    return ['name' => $name, 'tmp_name' => $path, 'error' => $error];
}

function kotlinskidev_test_png(): string
{
    return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
}

function kotlinskidev_test_jpeg(): string
{
    return base64_decode('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=');
}

function kotlinskidev_test_ole(): string
{
    return "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1" . str_repeat("\0", 512);
}

beforeEach(function () {
    $this->transients = [];
    Functions\when('apply_filters')->alias(fn ($hook, $value) => $value);
    $GLOBALS['kotlinskidev_test_upload_gate'] = true;
    Functions\when('get_temp_dir')->justReturn(sys_get_temp_dir());
    Functions\when('wp_salt')->justReturn('salt');
    Functions\when('wp_json_encode')->alias(fn ($v) => json_encode($v));
    Functions\when('esc_html')->alias(fn ($v) => htmlspecialchars((string) $v, ENT_QUOTES));
    Functions\when('untrailingslashit')->alias(fn ($v) => rtrim($v, '/\\'));
    Functions\when('trailingslashit')->alias(fn ($v) => rtrim($v, '/\\') . '/');
    Functions\when('absint')->alias(fn ($v) => abs((int) $v));
    Functions\when('get_transient')->alias(fn ($key) => $this->transients[$key] ?? false);
    Functions\when('set_transient')->alias(function ($key, $value) {
        $this->transients[$key] = $value;
        return true;
    });
    $_SERVER['REMOTE_ADDR'] = '203.0.113.9';
});

afterEach(function () {
    unset($_SERVER['CONTENT_LENGTH'], $_FILES['attachments']);
    $_POST = [];
});

it('accepts every allowed type with real content', function (string $name, callable $content) {
    $path = kotlinskidev_test_attachment_make_file($content());

    expect(kotlinskidev_contact_attachment_validate([kotlinskidev_test_attachment_upload($name, $path)]))->toBe('');
})->with([
    'pdf'  => ['cv.pdf', fn () => "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"],
    'png'  => ['pic.png', fn () => kotlinskidev_test_png()],
    'jpg'  => ['pic.jpg', fn () => kotlinskidev_test_jpeg()],
    'jpeg' => ['pic.JPEG', fn () => kotlinskidev_test_jpeg()],
    'txt'  => ['note.txt', fn () => "Zażółć gęślą jaźń\n"],
    'rtf'  => ['doc.rtf', fn () => '{\\rtf1\\ansi Hello}'],
    'doc'  => ['old.doc', fn () => kotlinskidev_test_ole()],
    'zip'  => ['bundle.zip', fn () => file_get_contents(kotlinskidev_test_attachment_zip(['a.txt' => 'hi']))],
    'docx' => ['new.docx', fn () => file_get_contents(kotlinskidev_test_attachment_zip(['[Content_Types].xml' => '<x/>', 'word/document.xml' => '<w/>']))],
    'odt'  => ['new.odt', fn () => file_get_contents(kotlinskidev_test_attachment_zip(['mimetype' => 'application/vnd.oasis.opendocument.text', 'content.xml' => '<c/>']))],
]);

it('rejects an extension that does not match the real content', function (string $name, string $content) {
    $path = kotlinskidev_test_attachment_make_file($content);

    expect(kotlinskidev_contact_attachment_validate([kotlinskidev_test_attachment_upload($name, $path)]))->toBe('attachment_type');
})->with([
    'php as jpg'   => ['pic.jpg', "<?php system(\$_GET['c']);"],
    'pdf as png'   => ['x.png', "%PDF-1.4\n%%EOF"],
    'txt with nul' => ['x.txt', "abc\0def"],
    'txt bad utf8' => ['x.txt', "\xff\xfe\xfa"],
    'empty'        => ['x.pdf', ''],
    'html as pdf'  => ['x.pdf', '<html><script>alert(1)</script></html>'],
    'exe as zip'   => ['x.zip', "MZ\x90\x00\x03\x00\x00\x00"],
]);

it('rejects png bytes named as pdf', function () {
    $path = kotlinskidev_test_attachment_make_file(kotlinskidev_test_png());

    expect(kotlinskidev_contact_attachment_validate([kotlinskidev_test_attachment_upload('x.pdf', $path)]))->toBe('attachment_type');
});

it('rejects blocked, double-extension and malformed names', function (string $name) {
    expect(kotlinskidev_contact_attachment_extension($name))->toBe('');
})->with([
    'invoice.pdf.exe', 'a.php.jpg', 'macro.docm', 'macro.dotm', 'sheet.xlsm', 'deck.pptm', 'page.html', 'page.htm', 'logo.svg',
    'run.js', 'shell.php', 'tool.phar', 'setup.exe', 'run.bat', 'run.cmd', 'run.sh', 'app.jar', 'lib.dll', 'screen.scr',
    'setup.msi', 'link.lnk', 'disk.iso', 'disk.img', 'run.vbs', 'run.ps1', 'noextension', '.htaccess', 'trailing.', "nul\0byte.pdf",
    "ctrl\x07char.pdf", "line\nbreak.pdf", 'a..pdf', 'file.PHP.png', '',
]);

it('keeps benign dotted names and normalizes the extension case', function () {
    expect(kotlinskidev_contact_attachment_extension('report.v2.final.PDF'))->toBe('pdf');
});

it('rejects a docx that contains vbaProject.bin', function () {
    $path = kotlinskidev_test_attachment_zip(['[Content_Types].xml' => '<x/>', 'word/vbaProject.bin' => 'macro']);

    expect(kotlinskidev_contact_attachment_validate([kotlinskidev_test_attachment_upload('m.docx', $path)]))->toBe('attachment_type');
});

it('rejects a docx with more than 500 entries and an odt with macros', function () {
    $entries = ['[Content_Types].xml' => '<x/>'];
    for ($i = 0; $i < 501; $i++) {
        $entries["f{$i}.xml"] = '<a/>';
    }

    expect(kotlinskidev_contact_attachment_validate([kotlinskidev_test_attachment_upload('big.docx', kotlinskidev_test_attachment_zip($entries))]))->toBe('attachment_type');
    expect(kotlinskidev_contact_attachment_validate([kotlinskidev_test_attachment_upload('m.odt', kotlinskidev_test_attachment_zip(['mimetype' => 'application/vnd.oasis.opendocument.text', 'Basic/Standard/a.xml' => '<a/>']))]))->toBe('attachment_type');
});

it('never inspects the inside of a plain zip', function () {
    $path = kotlinskidev_test_attachment_zip(['vbaProject.bin' => 'x', 'evil.php' => '<?php']);

    expect(kotlinskidev_contact_attachment_validate([kotlinskidev_test_attachment_upload('a.zip', $path)]))->toBe('');
});

it('maps upload errors to specific codes', function (int $error, string $code) {
    expect(kotlinskidev_contact_attachment_validate([kotlinskidev_test_attachment_upload('a.pdf', '', $error)]))->toBe($code);
})->with([
    [UPLOAD_ERR_INI_SIZE, 'attachment_size'],
    [UPLOAD_ERR_FORM_SIZE, 'attachment_size'],
    [UPLOAD_ERR_PARTIAL, 'attachment_failed'],
    [UPLOAD_ERR_NO_TMP_DIR, 'attachment_failed'],
    [UPLOAD_ERR_CANT_WRITE, 'attachment_failed'],
]);

it('rejects files that were not really uploaded', function () {
    $GLOBALS['kotlinskidev_test_upload_gate'] = false;
    $path = kotlinskidev_test_attachment_make_file(kotlinskidev_test_png());

    expect(kotlinskidev_contact_attachment_validate([kotlinskidev_test_attachment_upload('a.png', $path)]))->toBe('attachment_failed');
});

it('enforces count, per-file and total limits', function () {
    $png = kotlinskidev_test_attachment_make_file(kotlinskidev_test_png());
    $four = array_fill(0, 4, kotlinskidev_test_attachment_upload('a.png', $png));
    expect(kotlinskidev_contact_attachment_validate($four))->toBe('attachment_count');

    Functions\when('apply_filters')->alias(fn ($hook, $value) => array_merge($value, ['max_file_bytes' => 10, 'max_total_bytes' => 100]));
    $pdf = kotlinskidev_test_attachment_make_file("%PDF-1.4\n" . str_repeat('a', 20));
    expect(kotlinskidev_contact_attachment_validate([kotlinskidev_test_attachment_upload('a.pdf', $pdf)]))->toBe('attachment_size');

    Functions\when('apply_filters')->alias(fn ($hook, $value) => array_merge($value, ['max_total_bytes' => 100]));
    $big = kotlinskidev_test_attachment_make_file("%PDF-1.4\n" . str_repeat('a', 60));
    $uploads = [kotlinskidev_test_attachment_upload('a.pdf', $big), kotlinskidev_test_attachment_upload('b.pdf', $big)];
    expect(kotlinskidev_contact_attachment_validate($uploads))->toBe('attachment_size');
});

it('has the documented default limits', function () {
    expect(kotlinskidev_contact_attachment_limits())->toBe([
        'max_files' => 3, 'max_total_bytes' => 10485760, 'max_file_bytes' => 8388608, 'max_name_length' => 100,
    ]);
});

it('sanitizes display names', function (string $raw, string $expected) {
    expect(kotlinskidev_contact_attachment_display_name($raw, 'pdf', 100))->toBe($expected);
})->with([
    'traversal'    => ['../../etc/passwd.pdf', 'passwd.pdf'],
    'backslash'    => ['..\\..\\win\\cv.pdf', 'cv.pdf'],
    'bidi'         => ["evil\u{202E}fdp.pdf", 'evilfdp.pdf'],
    'crlf'         => ["a\r\nBcc: x@y.z.pdf", 'aBcc x@y.z.pdf'],
    'null byte'    => ["a\0b.pdf", 'ab.pdf'],
    'whitespace'   => ["a   b \t c.pdf", 'a b c.pdf'],
    'only ext'     => ['.pdf', 'attachment.pdf'],
    'angle quotes' => ['<b>"x".pdf', 'bx.pdf'],
]);

it('caps display name length and keeps the extension', function () {
    $name = kotlinskidev_contact_attachment_display_name(str_repeat('a', 300) . '.pdf', 'pdf', 100);

    expect(mb_strlen($name))->toBe(100)->and($name)->toEndWith('.pdf');
});

it('stores accepted uploads under random private names without user-supplied path parts', function () {
    $dir = kotlinskidev_test_attachment_tmp_dir() . '/store-' . bin2hex(random_bytes(3));
    Functions\when('apply_filters')->alias(fn ($hook, $value) => 'kotlinskidev_contact_attachment_dir' === $hook ? $dir : $value);
    $first  = kotlinskidev_test_attachment_make_file(kotlinskidev_test_png());
    $second = kotlinskidev_test_attachment_make_file(kotlinskidev_test_png());

    $stored = kotlinskidev_contact_attachment_store([
        kotlinskidev_test_attachment_upload('../../x.png', $first),
        kotlinskidev_test_attachment_upload('../../x.png', $second),
    ]);

    expect($stored)->toHaveCount(2);
    expect($stored[0]['name'])->toBe('x.png');
    expect($stored[1]['name'])->toBe('x (2).png');
    foreach ($stored as $file) {
        expect(dirname($file['path']))->toBe($dir);
        expect(basename($file['path']))->toMatch('/^[0-9a-f]{32}$/');
        expect(decoct(fileperms($file['path']) & 0777))->toBe('600');
        expect(strlen($file['sha256']))->toBe(64);
    }
    expect(decoct(fileperms($dir) & 0777))->toBe('700');
    expect(kotlinskidev_contact_attachment_mail_attachments($stored))->toHaveKeys(['x.png', 'x (2).png']);
});

it('writes deny rules when the directory is inside the web root', function () {
    $root = ABSPATH;
    if (!is_dir($root)) {
        mkdir($root, 0700, true);
    }
    $dir = rtrim($root, '/') . '/uploads-private';
    Functions\when('apply_filters')->alias(fn ($hook, $value) => 'kotlinskidev_contact_attachment_dir' === $hook ? $dir : $value);

    expect(kotlinskidev_contact_attachment_ensure_dir($dir))->toBeTrue();
    expect(file_get_contents($dir . '/.htaccess'))->toContain('Require all denied');
    expect(file_exists($dir . '/index.php'))->toBeTrue();
});

it('deletes temp files after send and retains them when the send failed', function () {
    $dir = kotlinskidev_test_attachment_tmp_dir() . '/retain-' . bin2hex(random_bytes(3));
    Functions\when('apply_filters')->alias(fn ($hook, $value) => 'kotlinskidev_contact_attachment_dir' === $hook ? $dir : $value);
    $make = fn () => kotlinskidev_contact_attachment_store([kotlinskidev_test_attachment_upload('a.png', kotlinskidev_test_attachment_make_file(kotlinskidev_test_png()))]);

    $sent = $make();
    kotlinskidev_contact_attachment_delete($sent);
    expect(file_exists($sent[0]['path']))->toBeFalse();

    $failed = $make();
    kotlinskidev_contact_attachment_retain($failed, 42);
    kotlinskidev_contact_attachment_delete($failed);
    $retained = $dir . '/retained/42/' . basename($failed[0]['path']);
    expect(file_exists($retained))->toBeTrue();
    expect(file_exists($failed[0]['path']))->toBeFalse();
});

it('purges retained files older than 7 days and removes empty directories', function () {
    $dir = kotlinskidev_test_attachment_tmp_dir() . '/purge-' . bin2hex(random_bytes(3));
    Functions\when('apply_filters')->alias(fn ($hook, $value) => 'kotlinskidev_contact_attachment_dir' === $hook ? $dir : $value);
    mkdir($dir . '/retained/1', 0700, true);
    mkdir($dir . '/retained/2', 0700, true);
    file_put_contents($dir . '/retained/1/old', 'x');
    file_put_contents($dir . '/retained/2/new', 'x');
    touch($dir . '/retained/1/old', time() - 8 * 86400);
    touch($dir . '/retained/2/new', time() - 6 * 86400);

    kotlinskidev_contact_attachments_purge();

    expect(is_dir($dir . '/retained/1'))->toBeFalse();
    expect(file_exists($dir . '/retained/2/new'))->toBeTrue();
});

it('rate limits attachment submissions to 5 per window without storing the raw ip', function () {
    for ($i = 0; $i < 5; $i++) {
        expect(kotlinskidev_contact_attachment_register_attempt())->toBeTrue();
    }

    expect(kotlinskidev_contact_attachment_register_attempt())->toBeFalse();
    foreach (array_keys($this->transients) as $key) {
        expect($key)->not->toContain('203.0.113.9')->and($key)->toMatch('/^kotlinskidev_attach_rl_[0-9a-f]{64}$/');
    }
});

it('detects a request PHP dropped for being oversized', function () {
    $_SERVER['CONTENT_LENGTH'] = '20000000';
    $_POST = [];
    expect(kotlinskidev_contact_attachment_is_oversized_request())->toBeTrue();

    $_POST = ['name' => 'x'];
    expect(kotlinskidev_contact_attachment_is_oversized_request())->toBeFalse();

    unset($_SERVER['CONTENT_LENGTH']);
    $_POST = [];
    expect(kotlinskidev_contact_attachment_is_oversized_request())->toBeFalse();
});

it('only enables attachments when the block asks for them', function () {
    expect(kotlinskidev_contact_attachments_enabled(null))->toBeFalse();
    expect(kotlinskidev_contact_attachments_enabled(['attrs' => []]))->toBeFalse();
    expect(kotlinskidev_contact_attachments_enabled(['attrs' => ['enableAttachments' => true]]))->toBeTrue();
});

it('collects uploads and skips empty file slots', function () {
    $_FILES['attachments'] = [
        'name'     => ['a.pdf', ''],
        'tmp_name' => ['/tmp/a', ''],
        'error'    => [UPLOAD_ERR_OK, UPLOAD_ERR_NO_FILE],
    ];

    expect(kotlinskidev_contact_attachment_collect_uploads())->toHaveCount(1);
});

it('lists attachment names and sizes escaped in the email block', function () {
    $html = kotlinskidev_contact_attachment_email_block([['name' => '<b>x</b>.pdf', 'size' => 2097152, 'path' => '/p', 'sha256' => 'h']]);

    expect($html)->toContain('&lt;b&gt;x&lt;/b&gt;.pdf')->and($html)->toContain('2 MB')->and($html)->not->toContain('<b>');
    expect(kotlinskidev_contact_attachment_email_block([]))->toBe('');
});

it('stores only name, size and hash in the submission record', function () {
    $json = kotlinskidev_contact_attachment_record_json([['name' => 'a.pdf', 'size' => 5, 'path' => '/secret/path', 'sha256' => 'abc']]);

    expect($json)->toBe('[{"name":"a.pdf","size":5,"sha256":"abc"}]');
    expect(kotlinskidev_contact_attachment_record_json([]))->toBeNull();
});

it('sends a retention alert without filenames or visitor data', function () {
    $requests = [];
    Functions\when('get_option')->alias(fn ($name, $default = '') => 'kotlinskidev_ntfy_alert_url' === $name ? 'https://ntfy.sh/topic' : $default);
    Functions\when('esc_url_raw')->returnArg();
    Functions\when('wp_parse_url')->alias(fn ($u, $component = -1) => parse_url($u, $component));
    Functions\when('home_url')->justReturn('https://kotlinski.dev');
    Functions\when('wp_strip_all_tags')->alias(fn ($s) => strip_tags($s));
    Functions\when('delete_transient')->justReturn(true);
    Functions\when('wp_remote_post')->alias(function ($url, $args) use (&$requests) {
        $requests[] = $args['body'];
        return [];
    });

    kotlinskidev_contact_attachment_alert_retained();

    expect($requests)->toHaveCount(1);
    expect($requests[0])->toContain('retained privately on the server for 7 days');
});
