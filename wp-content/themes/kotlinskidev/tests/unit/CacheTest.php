<?php

use Brain\Monkey\Functions;

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

require_once __DIR__ . '/../../functions/cache.php';

it('returns the "no-build" sentinel when build/build-id.php does not exist', function () {
    Functions\when('get_template_directory')->justReturn('/definitely/does/not/exist');

    expect(kotlinskidev_build_fingerprint())->toBe('no-build');
});

it('returns the value written to build/build-id.php', function () {
    $dir = sys_get_temp_dir() . '/kt-cache-test-' . uniqid();
    mkdir($dir . '/build', 0777, true);
    file_put_contents("{$dir}/build/build-id.php", "<?php return '1234567890';\n");

    Functions\when('get_template_directory')->justReturn($dir);

    expect(kotlinskidev_build_fingerprint())->toBe('1234567890');

    unlink("{$dir}/build/build-id.php");
    rmdir($dir . '/build');
    rmdir($dir);
});

it('changes the fingerprint when build-id.php is rewritten by a new build', function () {
    $dir = sys_get_temp_dir() . '/kt-cache-test-' . uniqid();
    mkdir($dir . '/build', 0777, true);
    file_put_contents("{$dir}/build/build-id.php", "<?php return 'first-build';\n");

    Functions\when('get_template_directory')->justReturn($dir);
    $before = kotlinskidev_build_fingerprint();

    file_put_contents("{$dir}/build/build-id.php", "<?php return 'second-build';\n");
    $after = kotlinskidev_build_fingerprint();

    unlink("{$dir}/build/build-id.php");
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
