<?php

use Brain\Monkey\Functions;

if (!defined('KOTLINSKIDEV_CACHE_PREFIX')) {
    define('KOTLINSKIDEV_CACHE_PREFIX', 'kotlinskidev_');
}
if (!defined('MINUTE_IN_SECONDS')) {
    define('MINUTE_IN_SECONDS', 60);
}

require_once __DIR__ . '/../../functions/seo-noindex-compat.php';

it('reports no active seo plugin when none of the known constants are defined', function () {
    expect(kotlinskidev_detect_active_seo_plugin())->toBe('');
});

it('leaves the query args untouched when no seo plugin is detected', function () {
    $args = ['post_type' => 'post'];

    expect(kotlinskidev_apply_seo_noindex_exclusion($args))->toBe($args);
});

it('returns the cached aioseo noindex ids without querying the database', function () {
    Functions\when('get_transient')->justReturn([5, 9]);
    Functions\expect('set_transient')->never();

    expect(kotlinskidev_get_aioseo_noindex_post_ids())->toBe([5, 9]);
});

it('queries and caches the aioseo noindex ids when nothing is cached yet', function () {
    Functions\when('get_transient')->justReturn(false);
    Functions\when('absint')->alias('intval');

    global $wpdb;
    $wpdb = new class {
        public string $prefix = 'wp_';
        public function get_col($sql)
        {
            return ['3', '7'];
        }
    };

    Functions\expect('set_transient')
        ->once()
        ->with(KOTLINSKIDEV_CACHE_PREFIX . 'aioseo_noindex_ids', [3, 7], 15 * MINUTE_IN_SECONDS);

    expect(kotlinskidev_get_aioseo_noindex_post_ids())->toBe([3, 7]);
});

function kotlinskidev_run_seo_noindex_subprocess(string $constantDefinition, string $extraStubs, string $callExpr): mixed
{
    $file = __DIR__ . '/../../functions/seo-noindex-compat.php';

    $script = <<<PHP
<?php
define('KOTLINSKIDEV_CACHE_PREFIX', 'kotlinskidev_');
define('MINUTE_IN_SECONDS', 60);
{$constantDefinition}
{$extraStubs}
require '{$file}';
echo json_encode({$callExpr});
PHP;

    $tmpFile = tempnam(sys_get_temp_dir(), 'kt_seo_');
    file_put_contents($tmpFile, $script);
    $output = shell_exec('php ' . escapeshellarg($tmpFile));
    unlink($tmpFile);

    return json_decode($output, true);
}

it('detects yoast and adds an OR noindex-exclusion meta_query clause', function () {
    $result = kotlinskidev_run_seo_noindex_subprocess(
        "define('WPSEO_VERSION', '1.0');",
        '',
        "kotlinskidev_apply_seo_noindex_exclusion(['post_type' => 'post'])"
    );

    expect($result)->toBe([
        'post_type' => 'post',
        'meta_query' => [
            'relation' => 'OR',
            ['key' => '_yoast_wpseo_meta-robots-noindex', 'compare' => 'NOT EXISTS'],
            ['key' => '_yoast_wpseo_meta-robots-noindex', 'value' => '1', 'compare' => '!='],
        ],
    ]);
});

it('detects seopress with its own meta key and comparison', function () {
    $result = kotlinskidev_run_seo_noindex_subprocess(
        "define('SEOPRESS_VERSION', '1.0');",
        '',
        "kotlinskidev_apply_seo_noindex_exclusion([])"
    );

    expect($result['meta_query'][1])->toBe([
        'key' => '_seopress_robots_index',
        'value' => 'yes',
        'compare' => '!=',
    ]);
});

it('detects rank math with a NOT LIKE comparison', function () {
    $result = kotlinskidev_run_seo_noindex_subprocess(
        "define('RANK_MATH_VERSION', '1.0');",
        '',
        "kotlinskidev_apply_seo_noindex_exclusion([])"
    );

    expect($result['meta_query'][1])->toBe([
        'key' => 'rank_math_robots',
        'value' => 'noindex',
        'compare' => 'NOT LIKE',
    ]);
});

it('wraps an existing meta_query with AND instead of replacing it', function () {
    $result = kotlinskidev_run_seo_noindex_subprocess(
        "define('WPSEO_VERSION', '1.0');",
        '',
        "kotlinskidev_apply_seo_noindex_exclusion(['meta_query' => [['key' => 'existing']]])"
    );

    expect($result['meta_query'])->toBe([
        'relation' => 'AND',
        0 => [['key' => 'existing']],
        1 => [
            'relation' => 'OR',
            ['key' => '_yoast_wpseo_meta-robots-noindex', 'compare' => 'NOT EXISTS'],
            ['key' => '_yoast_wpseo_meta-robots-noindex', 'value' => '1', 'compare' => '!='],
        ],
    ]);
});

it('merges aioseo noindex ids into post__not_in, deduplicated', function () {
    $extraStubs = <<<'PHP'
function get_transient($key) { return [5, 9]; }
function set_transient(...$args) { return true; }
PHP;

    $result = kotlinskidev_run_seo_noindex_subprocess(
        "define('AIOSEO_VERSION', '1.0');",
        $extraStubs,
        "kotlinskidev_apply_seo_noindex_exclusion(['post__not_in' => [9, 12]])"
    );

    expect($result['post__not_in'])->toBe([9, 12, 5]);
});

it('leaves post__not_in untouched when aioseo has no noindex posts', function () {
    $extraStubs = <<<'PHP'
function get_transient($key) { return []; }
function set_transient(...$args) { return true; }
PHP;

    $result = kotlinskidev_run_seo_noindex_subprocess(
        "define('AIOSEO_VERSION', '1.0');",
        $extraStubs,
        "kotlinskidev_apply_seo_noindex_exclusion(['post_type' => 'post'])"
    );

    expect($result)->toBe(['post_type' => 'post']);
});
