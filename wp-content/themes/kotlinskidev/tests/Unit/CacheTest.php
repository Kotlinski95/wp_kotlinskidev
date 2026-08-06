<?php

use Brain\Monkey\Functions;

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

require_once __DIR__ . '/../../functions/cache.php';

it('lists the four tracked build files under the build directory', function () {
    Functions\when('get_template_directory')->justReturn('/theme');

    expect(kotlinskidev_tracked_build_files())->toBe([
        '/theme/build/critical.css',
        '/theme/build/critical.js',
        '/theme/build/main.css',
        '/theme/build/main.js',
    ]);
});

it('fingerprints as a fixed hash when none of the tracked build files exist', function () {
    Functions\when('get_template_directory')->justReturn('/definitely/does/not/exist');

    expect(kotlinskidev_build_fingerprint())->toBe(md5('0000'));
});

it('changes the fingerprint when a tracked build file is modified', function () {
    $dir = sys_get_temp_dir() . '/kt-cache-test-' . uniqid();
    mkdir($dir . '/build', 0777, true);
    foreach (['critical.css', 'critical.js', 'main.css', 'main.js'] as $file) {
        file_put_contents("{$dir}/build/{$file}", 'x');
        touch("{$dir}/build/{$file}", 1000);
    }

    Functions\when('get_template_directory')->justReturn($dir);
    $before = kotlinskidev_build_fingerprint();

    touch("{$dir}/build/main.js", 2000);
    $after = kotlinskidev_build_fingerprint();

    foreach (['critical.css', 'critical.js', 'main.css', 'main.js'] as $file) {
        unlink("{$dir}/build/{$file}");
    }
    rmdir($dir . '/build');
    rmdir($dir);

    expect($before)->not->toBe($after);
});

it('deletes matching transient rows and flushes the object cache', function () {
    $queries = [];

    global $wpdb;
    $wpdb = new class ($queries) {
        public array $queries = [];
        public string $options = 'wp_options';

        public function esc_like($text)
        {
            return $text;
        }

        public function prepare($sql, ...$args)
        {
            return $sql . '|' . implode(',', $args);
        }

        public function query($sql)
        {
            $this->queries[] = $sql;
            return true;
        }
    };

    Functions\expect('wp_cache_flush')->once();

    kotlinskidev_flush_all_transients();

    expect($wpdb->queries)->toHaveCount(2);
    expect($wpdb->queries[0])->toContain(KOTLINSKIDEV_CACHE_PREFIX . '%');
    expect($wpdb->queries[0])->toContain('_transient_img_size_%');
    expect($wpdb->queries[1])->toContain('_transient_timeout_' . KOTLINSKIDEV_CACHE_PREFIX . '%');
});
