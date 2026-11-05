<?php

use Brain\Monkey\Functions;

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

if (!function_exists('add_action')) {
    function add_action(...$args)
    {
        return true;
    }
}

if (!defined('MINUTE_IN_SECONDS')) {
    define('MINUTE_IN_SECONDS', 60);
}

if (!defined('MB_IN_BYTES')) {
    define('MB_IN_BYTES', 1048576);
}

define('WP_CONTENT_DIR', sys_get_temp_dir() . '/kotlinskidev-debug-log-rotation-test');
if (!is_dir(WP_CONTENT_DIR)) {
    mkdir(WP_CONTENT_DIR);
}

define('WP_DEBUG', true);

require_once __DIR__ . '/../../functions/debug-log-rotation.php';

beforeEach(function () {
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
});

afterEach(function () {
    if (file_exists(kotlinskidev_debug_log_path())) {
        unlink(kotlinskidev_debug_log_path());
    }
});

it('does nothing when the log is smaller than the threshold', function () {
    file_put_contents(kotlinskidev_debug_log_path(), str_repeat('x', 1024));

    kotlinskidev_maybe_rotate_debug_log();

    expect(filesize(kotlinskidev_debug_log_path()))->toBe(1024);
});

it('truncates the log once it exceeds the threshold', function () {
    file_put_contents(kotlinskidev_debug_log_path(), str_repeat('x', 6 * MB_IN_BYTES));

    kotlinskidev_maybe_rotate_debug_log();

    expect(filesize(kotlinskidev_debug_log_path()))->toBe(0);
});

it('skips the size check when the rotation was already checked recently', function () {
    Functions\when('get_transient')->justReturn(true);
    file_put_contents(kotlinskidev_debug_log_path(), str_repeat('x', 6 * MB_IN_BYTES));

    kotlinskidev_maybe_rotate_debug_log();

    expect(filesize(kotlinskidev_debug_log_path()))->toBe(6 * MB_IN_BYTES);
});

it('does nothing when the log file does not exist', function () {
    expect(fn () => kotlinskidev_maybe_rotate_debug_log())->not->toThrow(Throwable::class);
});
