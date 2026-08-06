<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/maintenance.php';

beforeEach(function () {
    Functions\when('esc_url')->alias(fn ($u) => $u);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
    unset($_GET['lang'], $_SERVER['HTTP_ACCEPT_LANGUAGE'], $_SERVER['REQUEST_URI']);
});

it('returns null for the current language when polylang is not active', function () {
    expect(get_maintenance_current_language())->toBeNull();
});

it('falls back to the raw default when polylang is inactive and no option is saved', function () {
    Functions\when('get_option')->justReturn('');

    expect(get_maintenance_translation('maintenance_mode_heading', 'Default Heading'))->toBe('Default Heading');
});

it('uses the saved option value over the default when polylang is inactive', function () {
    Functions\when('get_option')->justReturn('Saved Heading');

    expect(get_maintenance_translation('maintenance_mode_heading', 'Default Heading'))->toBe('Saved Heading');
});

it('looks up a known flag url by language code', function () {
    expect(get_maintenance_flag_url('pl'))->toBe('https://flagcdn.com/w20/pl.png');
});

it('returns an empty string for an unknown language flag', function () {
    expect(get_maintenance_flag_url('xx'))->toBe('');
});

it('builds a language-switch url appending the lang query parameter', function () {
    Functions\when('home_url')->alias(fn ($path) => 'https://example.test' . $path);
    $_SERVER['REQUEST_URI'] = '/some-page/';

    expect(get_maintenance_language_url('pl'))->toBe('https://example.test/some-page/?lang=pl');
});

it('replaces an existing lang query parameter rather than duplicating it', function () {
    Functions\when('home_url')->alias(fn ($path) => 'https://example.test' . $path);
    $_SERVER['REQUEST_URI'] = '/some-page/?lang=en&foo=bar';

    $url = get_maintenance_language_url('pl');

    expect($url)->toBe('https://example.test/some-page/&foo=bar?lang=pl');
});

it('returns an empty language switcher when polylang is not active', function () {
    Functions\when('get_option')->justReturn(true);

    expect(get_maintenance_language_switcher())->toBe('');
});

it('returns an empty string for social media links when no platform urls are set', function () {
    Functions\when('get_option')->justReturn('');

    expect(get_maintenance_social_media_links())->toBe('');
});

it('renders a social icon link only for platforms with a configured url', function () {
    Functions\when('get_option')->alias(
        fn ($name, $default = '') => $name === 'maintenance_mode_github_url' ? 'https://github.com/me' : ''
    );

    $html = get_maintenance_social_media_links();

    expect($html)->toContain('social-github');
    expect($html)->toContain('https://github.com/me');
    expect($html)->not->toContain('social-facebook');
});

function kotlinskidev_run_maintenance_subprocess(array $get, array $server, string $callExpr): mixed
{
    $file = __DIR__ . '/../../functions/maintenance.php';
    $getExport = var_export($get, true);
    $serverExport = var_export($server, true);

    $script = <<<PHP
<?php
function add_action(...\$args) { return true; }
function esc_url(\$v) { return \$v; }
function esc_attr(\$v) { return \$v; }
function esc_html(\$v) { return \$v; }
function sanitize_text_field(\$v) { return \$v; }
function wp_unslash(\$v) { return \$v; }
function home_url(\$path = '') { return 'https://example.test' . \$path; }
\$GLOBALS['kt_options'] = [];
function get_option(\$name, \$default = '') { return \$GLOBALS['kt_options'][\$name] ?? \$default; }
function pll_languages_list() { return ['en', 'pl', 'de']; }
function pll_current_language() { return \$GLOBALS['kt_pll_current'] ?? ''; }
\$_GET = {$getExport};
\$_SERVER = array_merge(\$_SERVER, {$serverExport});
require '{$file}';
echo json_encode({$callExpr});
PHP;

    $tmpFile = tempnam(sys_get_temp_dir(), 'kt_maint_');
    file_put_contents($tmpFile, $script);
    $output = shell_exec('php ' . escapeshellarg($tmpFile));
    unlink($tmpFile);

    return json_decode($output, true);
}

it('prefers the ?lang= url parameter when it is a valid, known language', function () {
    $result = kotlinskidev_run_maintenance_subprocess(['lang' => 'de'], [], 'get_maintenance_current_language()');

    expect($result)->toBe('de');
});

it('ignores an unknown ?lang= value and falls through to polylang detection', function () {
    $script = <<<'PHP'
$GLOBALS['kt_pll_current'] = 'pl';
PHP;
    $result = kotlinskidev_run_maintenance_subprocess(
        ['lang' => 'zz'],
        [],
        "(function() { {$script} return get_maintenance_current_language(); })()"
    );

    expect($result)->toBe('pl');
});

it('falls back to the browser Accept-Language header when polylang has no current language', function () {
    $result = kotlinskidev_run_maintenance_subprocess(
        [],
        ['HTTP_ACCEPT_LANGUAGE' => 'de-DE,de;q=0.9'],
        'get_maintenance_current_language()'
    );

    expect($result)->toBe('de');
});

it('defaults to the first configured language when nothing else matches', function () {
    $result = kotlinskidev_run_maintenance_subprocess(
        [],
        ['HTTP_ACCEPT_LANGUAGE' => 'zz-ZZ'],
        'get_maintenance_current_language()'
    );

    expect($result)->toBe('en');
});

it('hides the language switcher when there is only one configured language', function () {
    $file = __DIR__ . '/../../functions/maintenance.php';
    $script = <<<PHP
<?php
function add_action(...\$args) { return true; }
function esc_url(\$v) { return \$v; }
function esc_attr(\$v) { return \$v; }
function esc_html(\$v) { return \$v; }
function sanitize_text_field(\$v) { return \$v; }
function wp_unslash(\$v) { return \$v; }
function home_url(\$path = '') { return 'https://example.test' . \$path; }
function get_option(\$name, \$default = '') { return \$name === 'maintenance_mode_show_language_switcher' ? true : \$default; }
function pll_languages_list() { return ['en']; }
require '{$file}';
echo json_encode(get_maintenance_language_switcher());
PHP;

    $tmpFile = tempnam(sys_get_temp_dir(), 'kt_maint_');
    file_put_contents($tmpFile, $script);
    $output = json_decode(shell_exec('php ' . escapeshellarg($tmpFile)), true);
    unlink($tmpFile);

    expect($output)->toBe('');
});

it('lists every other configured language in the switcher dropdown', function () {
    $file = __DIR__ . '/../../functions/maintenance.php';
    $script = <<<PHP
<?php
function add_action(...\$args) { return true; }
function esc_url(\$v) { return \$v; }
function esc_attr(\$v) { return \$v; }
function esc_html(\$v) { return \$v; }
function sanitize_text_field(\$v) { return \$v; }
function wp_unslash(\$v) { return \$v; }
function home_url(\$path = '') { return 'https://example.test' . \$path; }
function get_option(\$name, \$default = '') { return \$name === 'maintenance_mode_show_language_switcher' ? true : \$default; }
function pll_languages_list() { return ['en', 'pl']; }
require '{$file}';
echo json_encode(get_maintenance_language_switcher());
PHP;

    $tmpFile = tempnam(sys_get_temp_dir(), 'kt_maint_');
    file_put_contents($tmpFile, $script);
    $output = json_decode(shell_exec('php ' . escapeshellarg($tmpFile)), true);
    unlink($tmpFile);

    expect($output)->toContain('lang=pl');
});
