<?php

use Brain\Monkey\Functions;

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}
if (!defined('KOTLINSKIDEV_CACHE_PREFIX')) {
    define('KOTLINSKIDEV_CACHE_PREFIX', 'kotlinskidev_');
}
if (!defined('HOUR_IN_SECONDS')) {
    define('HOUR_IN_SECONDS', 3600);
}

if (!function_exists('has_filter')) {
    function has_filter(): bool
    {
        return false;
    }
}

require_once __DIR__ . '/../../functions/feature-toggles.php';
require_once __DIR__ . '/../../functions/polylang-content-resolution.php';
require_once __DIR__ . '/../../functions/service-location-local-content.php';
require_once __DIR__ . '/../../functions/service-location-seo.php';
require_once __DIR__ . '/../../functions/service-location-ready-ids-cache.php';

beforeEach(function () {
    $GLOBALS['kt_ready_store'] = [];
    $GLOBALS['kt_ready_ttls'] = [];
    Functions\when('sanitize_key')->alias(fn ($v) => strtolower(preg_replace('/[^a-zA-Z0-9_\-]/', '', (string) $v)));
    Functions\when('get_transient')->alias(fn ($key) => $GLOBALS['kt_ready_store'][$key] ?? false);
    Functions\when('set_transient')->alias(function ($key, $value, $ttl = 0) {
        $GLOBALS['kt_ready_store'][$key] = $value;
        $GLOBALS['kt_ready_ttls'][$key] = $ttl;
        return true;
    });
    Functions\when('delete_transient')->alias(function ($key) {
        unset($GLOBALS['kt_ready_store'][$key]);
        return true;
    });
    Functions\when('pll_get_post_language')->justReturn('');
    Functions\when('pll_languages_list')->justReturn([]);
    Functions\when('get_option')->alias(fn ($name, $default = false) => $default);
    Functions\when('sanitize_text_field')->alias(fn ($v) => trim(strip_tags((string) $v)));
    Functions\when('sanitize_textarea_field')->alias(fn ($v) => trim(strip_tags((string) $v)));
    Functions\when('absint')->alias(fn ($v) => abs((int) $v));
    Functions\when('get_post_meta')->alias(function ($id, $key = '', $single = false) {
        $ready = ['local_intro' => 'Intro', 'local_audience' => 'SMEs', 'local_distance' => '30 min'];
        return $id % 2 === 0 ? ($ready[$key] ?? '') : '';
    });
});

it('keeps only ready ids in query order and queries once', function () {
    Functions\expect('get_posts')->once()->andReturn([4, 3, 2, 8]);

    expect(kotlinskidev_service_location_ready_ids('en'))->toBe([4, 2, 8]);
    expect(kotlinskidev_service_location_ready_ids('en'))->toBe([4, 2, 8]);
});

it('caches per language and passes lang only when set', function () {
    $seen = [];
    Functions\when('get_posts')->alias(function ($args) use (&$seen) {
        $seen[] = $args;
        return [count($seen) * 2];
    });

    expect(kotlinskidev_service_location_ready_ids('en'))->toBe([2]);
    expect(kotlinskidev_service_location_ready_ids('pl'))->toBe([4]);
    expect(kotlinskidev_service_location_ready_ids(''))->toBe([6]);
    expect(kotlinskidev_service_location_ready_ids('en'))->toBe([2]);

    expect($seen)->toHaveCount(3);
    expect($seen[0]['lang'])->toBe('en');
    expect($seen[2])->not->toHaveKey('lang');
    expect($seen[0]['meta_key'])->toBe('city');
    expect($seen[0]['no_found_rows'])->toBeTrue();
    expect($seen[0]['update_post_term_cache'])->toBeFalse();
});

it('stores for twelve hours', function () {
    Functions\when('get_posts')->justReturn([2]);

    kotlinskidev_service_location_ready_ids('en');

    expect($GLOBALS['kt_ready_ttls'][kotlinskidev_service_location_ready_ids_cache_key('en')])->toBe(12 * 3600);
});

it('flushes every language and refetches', function () {
    Functions\when('pll_languages_list')->justReturn(['en', 'pl']);
    Functions\expect('get_posts')->times(3)->andReturn([2], [4], [6]);

    kotlinskidev_service_location_ready_ids('en');
    kotlinskidev_service_location_ready_ids('pl');
    kotlinskidev_service_location_flush_ready_ids_cache();

    expect($GLOBALS['kt_ready_store'])->toBe([]);
    expect(kotlinskidev_service_location_ready_ids('en'))->toBe([6]);
});

it('flushes only for service_location posts', function () {
    Functions\when('pll_languages_list')->justReturn(['en']);
    Functions\when('get_post_type')->alias(fn ($id) => 1 === $id ? 'service_location' : 'post');
    $GLOBALS['kt_ready_store'][kotlinskidev_service_location_ready_ids_cache_key('en')] = [2];

    kotlinskidev_service_location_flush_ready_ids_on_meta(10, 2);
    expect($GLOBALS['kt_ready_store'])->not->toBe([]);

    kotlinskidev_service_location_flush_ready_ids_on_meta(10, 1);
    expect($GLOBALS['kt_ready_store'])->toBe([]);
});

it('registers the purge hooks', function () {
    $source = file_get_contents(__DIR__ . '/../../functions/service-location-ready-ids-cache.php');

    foreach (['save_post_service_location', 'deleted_post', 'added_post_meta', 'updated_post_meta', 'deleted_post_meta'] as $hook) {
        expect($source)->toContain("add_action( '{$hook}'");
    }
});
