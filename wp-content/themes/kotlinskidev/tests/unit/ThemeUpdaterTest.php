<?php

use Brain\Monkey\Filters;
use Brain\Monkey\Functions;

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

require_once __DIR__ . '/../../functions/theme-updater.php';

function kotlinskidev_updater_test_constants(array $values): callable
{
    return static fn (string $name): mixed => $values[$name] ?? null;
}

function kotlinskidev_updater_test_release(array $names, bool $prerelease = false): object
{
    return (object) [
        'prerelease' => $prerelease,
        'assets'     => array_map(static fn (string $name): object => (object) ['name' => $name], $names),
    ];
}

beforeEach(function () {
    Functions\when('get_site_option')->justReturn([]);
    Functions\when('wp_doing_cron')->justReturn(false);
    Functions\when('wp_parse_url')->alias('parse_url');
    Functions\when('untrailingslashit')->alias(static fn (string $value): string => rtrim($value, '/'));
    Functions\when('__')->returnArg();
});

it('defaults to the stable channel', function () {
    expect(kotlinskidev_theme_update_channel(kotlinskidev_updater_test_constants([])))->toBe('stable');
});

it('uses the stored channel when valid', function () {
    Functions\when('get_site_option')->justReturn(['channel' => 'beta']);

    expect(kotlinskidev_theme_update_channel(kotlinskidev_updater_test_constants([])))->toBe('beta');
});

it('lets the constant win over the stored channel', function () {
    Functions\when('get_site_option')->justReturn(['channel' => 'beta']);

    $constants = kotlinskidev_updater_test_constants(['KOTLINSKIDEV_THEME_UPDATE_CHANNEL' => 'stable']);

    expect(kotlinskidev_theme_update_channel($constants))->toBe('stable');
});

it('ignores an invalid constant and an invalid filter result', function () {
    Filters\expectApplied('kotlinskidev_theme_update_channel')->once()->andReturn('nightly');

    $constants = kotlinskidev_updater_test_constants(['KOTLINSKIDEV_THEME_UPDATE_CHANNEL' => 'nightly']);

    expect(kotlinskidev_theme_update_channel($constants))->toBe('stable');
});

it('accepts a valid filtered channel', function () {
    Filters\expectApplied('kotlinskidev_theme_update_channel')->once()->andReturn('beta');

    expect(kotlinskidev_theme_update_channel(kotlinskidev_updater_test_constants([])))->toBe('beta');
});

it('falls back to defaults for malformed source filter values', function () {
    Filters\expectApplied('kotlinskidev_theme_update_source')->once()->andReturn(['repository' => '', 'slug' => 5, 'branch' => 'main']);

    $source = kotlinskidev_theme_update_source();

    expect($source['repository'])->toBe('https://github.com/Kotlinski95/wp_kotlinskidev/');
    expect($source['slug'])->toBe('kotlinskidev');
    expect($source['branch'])->toBe('main');
});

it('trusts only release downloads of the configured github repository', function () {
    $base = 'https://github.com/Kotlinski95/wp_kotlinskidev/releases/download/v2.7.0/kotlinskidev.zip';

    expect(kotlinskidev_theme_update_is_trusted_url($base))->toBeTrue();
    expect(kotlinskidev_theme_update_is_trusted_url('https://github.com/evil/repo/releases/download/v2.7.0/kotlinskidev.zip'))->toBeFalse();
    expect(kotlinskidev_theme_update_is_trusted_url('http://github.com/Kotlinski95/wp_kotlinskidev/releases/download/v1/x.zip'))->toBeFalse();
});

it('skips outside admin and cron contexts', function () {
    Functions\when('is_admin')->justReturn(false);

    expect(kotlinskidev_theme_update_skip_reason(kotlinskidev_updater_test_constants([]), '/nonexistent/theme', '/nonexistent'))->toBe('context');
});

it('runs in cron context', function () {
    Functions\when('is_admin')->justReturn(false);
    Functions\when('wp_doing_cron')->justReturn(true);

    expect(kotlinskidev_theme_update_skip_reason(kotlinskidev_updater_test_constants([]), '/nonexistent/theme', '/nonexistent'))->toBeNull();
});

it('skips when updates are disabled by constant', function () {
    $constants = kotlinskidev_updater_test_constants(['KOTLINSKIDEV_THEME_UPDATES_DISABLED' => true]);

    expect(kotlinskidev_theme_update_skip_reason($constants, '/nonexistent/theme', '/nonexistent'))->toBe('disabled');
});

it('skips when the theme sits inside a git checkout', function () {
    $root  = sys_get_temp_dir() . '/kt-updater-' . uniqid();
    $theme = $root . '/wp-content/themes/kotlinskidev';
    mkdir($theme, 0777, true);
    mkdir($root . '/.git');

    expect(kotlinskidev_theme_under_version_control($theme, $root))->toBeTrue();
    expect(kotlinskidev_theme_update_skip_reason(kotlinskidev_updater_test_constants([]), $theme, $root))->toBe('version-control');

    rmdir($root . '/.git');
    expect(kotlinskidev_theme_under_version_control($theme, $root))->toBeFalse();
    expect(kotlinskidev_theme_update_skip_reason(kotlinskidev_updater_test_constants([]), $theme, $root))->toBeNull();

    rmdir($theme);
    rmdir($root . '/wp-content/themes');
    rmdir($root . '/wp-content');
    rmdir($root);
});

it('accepts a stable release only with zip and checksum assets', function () {
    $complete = kotlinskidev_updater_test_release(['kotlinskidev.zip', 'kotlinskidev.zip.sha256']);
    $no_sum   = kotlinskidev_updater_test_release(['kotlinskidev.zip']);

    expect(kotlinskidev_theme_release_acceptable('2.7.0', $complete, 'stable'))->toBeTrue();
    expect(kotlinskidev_theme_release_acceptable('2.7.0', $no_sum, 'stable'))->toBeFalse();
});

it('rejects prereleases on stable and accepts them on beta', function () {
    $beta = kotlinskidev_updater_test_release(['kotlinskidev.zip', 'kotlinskidev.zip.sha256'], true);

    expect(kotlinskidev_theme_release_acceptable('2.7.0-beta.1', $beta, 'stable'))->toBeFalse();
    expect(kotlinskidev_theme_release_acceptable('2.7.0-beta.1', $beta, 'beta'))->toBeTrue();
});

it('rejects malformed versions', function () {
    $complete = kotlinskidev_updater_test_release(['kotlinskidev.zip', 'kotlinskidev.zip.sha256']);

    expect(kotlinskidev_theme_release_acceptable('latest', $complete, 'beta'))->toBeFalse();
    expect(kotlinskidev_theme_release_acceptable('2.7', $complete, 'beta'))->toBeFalse();
});

it('keeps only the latest release detection strategy', function () {
    $strategies = ['latest_release' => 'a', 'latest_tag' => 'b', 'branch' => 'c'];

    expect(kotlinskidev_theme_update_only_release_strategy($strategies))->toBe(['latest_release' => 'a']);
    expect(kotlinskidev_theme_update_only_release_strategy(null))->toBe([]);
});

it('parses checksum files', function () {
    $hash = str_repeat('AB', 32);

    expect(kotlinskidev_theme_update_parse_checksum($hash . "  kotlinskidev.zip\n"))->toBe(strtolower($hash));
    expect(kotlinskidev_theme_update_parse_checksum('nothex'))->toBeNull();
    expect(kotlinskidev_theme_update_parse_checksum(str_repeat('a', 63)))->toBeNull();
});

it('reads the version from a release download url', function () {
    expect(kotlinskidev_theme_update_package_version('https://github.com/a/b/releases/download/v2.7.0/kotlinskidev.zip'))->toBe('2.7.0');
    expect(kotlinskidev_theme_update_package_version('https://example.com/x.zip'))->toBeNull();
});

it('leaves other downloads untouched', function () {
    expect(kotlinskidev_theme_verify_package(false, 'https://x/y.zip', null, ['theme' => 'twentytwentyfive']))->toBeFalse();
    expect(kotlinskidev_theme_verify_package('/tmp/already.zip', 'https://x/y.zip', null, ['theme' => 'kotlinskidev']))->toBe('/tmp/already.zip');
});

it('rejects an untrusted package and records the failure', function () {
    Functions\when('is_wp_error')->alias(static fn (mixed $value): bool => $value instanceof WP_Error);
    $GLOBALS['kt_failure'] = null;
    Functions\when('update_site_option')->alias(static function (string $option, mixed $value): bool {
        $GLOBALS['kt_failure'] = $value;

        return true;
    });

    $result = kotlinskidev_theme_verify_package(false, 'https://evil.example/kotlinskidev.zip', null, ['theme' => 'kotlinskidev']);

    expect($result)->toBeInstanceOf(WP_Error::class);
    expect($result)->toBeInstanceOf(WP_Error::class);
    expect($GLOBALS['kt_failure']['message'])->toContain('trusted GitHub release');
});

it('rejects a package whose checksum file is missing', function () {
    Functions\when('is_wp_error')->alias(static fn (mixed $value): bool => $value instanceof WP_Error);
    Functions\when('wp_safe_remote_get')->justReturn(['response' => ['code' => 404]]);
    Functions\when('wp_remote_retrieve_response_code')->justReturn(404);
    $GLOBALS['kt_failure'] = null;
    Functions\when('update_site_option')->alias(static function (string $option, mixed $value): bool {
        $GLOBALS['kt_failure'] = $value;

        return true;
    });

    $package = 'https://github.com/Kotlinski95/wp_kotlinskidev/releases/download/v2.7.0/kotlinskidev.zip';
    $result  = kotlinskidev_theme_verify_package(false, $package, null, ['theme' => 'kotlinskidev']);

    expect($result)->toBeInstanceOf(WP_Error::class);
    expect($GLOBALS['kt_failure']['message'])->toContain('no SHA-256 checksum file');
});

it('rejects a downloaded package whose sha256 differs', function () {
    Functions\when('is_wp_error')->alias(static fn (mixed $value): bool => $value instanceof WP_Error);
    Functions\when('wp_safe_remote_get')->justReturn(['response' => ['code' => 200]]);
    Functions\when('wp_remote_retrieve_response_code')->justReturn(200);
    Functions\when('wp_remote_retrieve_body')->justReturn(str_repeat('0', 64) . "  kotlinskidev.zip\n");
    Functions\when('wp_delete_file')->alias('unlink');
    $GLOBALS['kt_failure'] = null;
    Functions\when('update_site_option')->alias(static function (string $option, mixed $value): bool {
        $GLOBALS['kt_failure'] = $value;

        return true;
    });

    $file = tempnam(sys_get_temp_dir(), 'kt');
    file_put_contents($file, 'package bytes');
    Functions\when('download_url')->justReturn($file);

    $package = 'https://github.com/Kotlinski95/wp_kotlinskidev/releases/download/v2.7.0/kotlinskidev.zip';
    $result  = kotlinskidev_theme_verify_package(false, $package, null, ['theme' => 'kotlinskidev']);

    expect($result)->toBeInstanceOf(WP_Error::class);
    expect($GLOBALS['kt_failure']['message'])->toContain('does not match its SHA-256');
    expect(file_exists($file))->toBeFalse();
});

it('returns the downloaded file when the sha256 matches', function () {
    Functions\when('is_wp_error')->alias(static fn (mixed $value): bool => $value instanceof WP_Error);
    Functions\when('wp_safe_remote_get')->justReturn(['response' => ['code' => 200]]);
    Functions\when('wp_remote_retrieve_response_code')->justReturn(200);

    $file = tempnam(sys_get_temp_dir(), 'kt');
    file_put_contents($file, 'package bytes');
    Functions\when('wp_remote_retrieve_body')->justReturn(hash('sha256', 'package bytes') . "  kotlinskidev.zip\n");
    Functions\when('download_url')->justReturn($file);

    $package = 'https://github.com/Kotlinski95/wp_kotlinskidev/releases/download/v2.7.0/kotlinskidev.zip';

    expect(kotlinskidev_theme_verify_package(false, $package, null, ['theme' => 'kotlinskidev']))->toBe($file);

    unlink($file);
});

it('validates the extracted package folder, files and version', function () {
    Functions\when('get_file_data')->alias(static function (string $file): array {
        preg_match('/^Version:\s*(.+)$/m', (string) file_get_contents($file), $match);

        return ['Version' => $match[1] ?? ''];
    });

    $root = sys_get_temp_dir() . '/kt-pkg-' . uniqid();
    $dir  = $root . '/kotlinskidev';
    mkdir($dir . '/vendor', 0777, true);
    file_put_contents($dir . '/style.css', "Version: 2.7.0\n");
    file_put_contents($dir . '/theme.json', '{}');
    file_put_contents($dir . '/functions.php', '<?php');
    file_put_contents($dir . '/vendor/autoload.php', '<?php');

    expect(kotlinskidev_theme_update_source_problem($dir . '/', '2.7.0'))->toBeNull();
    expect(kotlinskidev_theme_update_source_problem($dir, '2.8.0'))->not->toBeNull();

    unlink($dir . '/vendor/autoload.php');
    expect(kotlinskidev_theme_update_source_problem($dir, '2.7.0'))->not->toBeNull();

    rename($dir, $root . '/other');
    expect(kotlinskidev_theme_update_source_problem($root . '/other', '2.7.0'))->not->toBeNull();

    foreach (['other/style.css', 'other/theme.json', 'other/functions.php'] as $file) {
        unlink($root . '/' . $file);
    }
    rmdir($root . '/other/vendor');
    rmdir($root . '/other');
    rmdir($root);
});

it('recognises theme upgrades that include this theme', function () {
    expect(kotlinskidev_theme_update_includes_theme(['type' => 'theme', 'theme' => 'kotlinskidev']))->toBeTrue();
    expect(kotlinskidev_theme_update_includes_theme(['type' => 'theme', 'themes' => ['a', 'kotlinskidev']]))->toBeTrue();
    expect(kotlinskidev_theme_update_includes_theme(['type' => 'plugin', 'theme' => 'kotlinskidev']))->toBeFalse();
    expect(kotlinskidev_theme_update_includes_theme('nope'))->toBeFalse();
});

it('does not register without the update checker class', function () {
    Functions\when('get_template_directory')->justReturn('/nonexistent');

    expect(kotlinskidev_theme_updater_register('Missing\\Factory'))->toBeNull();
});
