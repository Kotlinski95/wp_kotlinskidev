<?php

use Brain\Monkey\Functions;

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

require_once __DIR__ . '/../../functions/cache.php';

it('globs every css/js file under the split build/css and build/js directories', function () {
    $dir = sys_get_temp_dir() . '/kt-cache-test-' . uniqid();
    mkdir($dir . '/build/css', 0777, true);
    mkdir($dir . '/build/js', 0777, true);
    file_put_contents("{$dir}/build/css/main.css", 'x');
    file_put_contents("{$dir}/build/css/critical.css", 'x');
    file_put_contents("{$dir}/build/js/main.js", 'x');
    file_put_contents("{$dir}/build/js/marquee-init.js", 'x');

    Functions\when('get_template_directory')->justReturn($dir);

    expect(kotlinskidev_tracked_build_files())->toEqualCanonicalizing([
        "{$dir}/build/css/main.css",
        "{$dir}/build/css/critical.css",
        "{$dir}/build/js/main.js",
        "{$dir}/build/js/marquee-init.js",
    ]);

    unlink("{$dir}/build/css/main.css");
    unlink("{$dir}/build/css/critical.css");
    unlink("{$dir}/build/js/main.js");
    unlink("{$dir}/build/js/marquee-init.js");
    rmdir($dir . '/build/css');
    rmdir($dir . '/build/js');
    rmdir($dir . '/build');
    rmdir($dir);
});

it('fingerprints as the empty-string hash when none of the tracked build files exist', function () {
    Functions\when('get_template_directory')->justReturn('/definitely/does/not/exist');

    expect(kotlinskidev_build_fingerprint())->toBe(md5(''));
});

it('changes the fingerprint when a tracked build file is modified', function () {
    $dir = sys_get_temp_dir() . '/kt-cache-test-' . uniqid();
    mkdir($dir . '/build/css', 0777, true);
    mkdir($dir . '/build/js', 0777, true);
    file_put_contents("{$dir}/build/css/critical.css", 'x');
    touch("{$dir}/build/css/critical.css", 1000);
    file_put_contents("{$dir}/build/js/main.js", 'x');
    touch("{$dir}/build/js/main.js", 1000);

    Functions\when('get_template_directory')->justReturn($dir);
    $before = kotlinskidev_build_fingerprint();

    touch("{$dir}/build/js/main.js", 2000);
    $after = kotlinskidev_build_fingerprint();

    unlink("{$dir}/build/css/critical.css");
    unlink("{$dir}/build/js/main.js");
    rmdir($dir . '/build/css');
    rmdir($dir . '/build/js');
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
