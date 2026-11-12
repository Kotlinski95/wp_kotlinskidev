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

require_once __DIR__ . '/../../functions/term-latest-post-cache.php';

beforeEach(function () {
    $GLOBALS['kt_term_latest_store'] = [];
    $GLOBALS['kt_term_latest_ttls'] = [];
    $GLOBALS['kt_term_latest_lang'] = 'en';
    Functions\when('sanitize_key')->alias(fn ($v) => strtolower(preg_replace('/[^a-zA-Z0-9_\-]/', '', (string) $v)));
    Functions\when('get_transient')->alias(fn ($key) => $GLOBALS['kt_term_latest_store'][$key] ?? false);
    Functions\when('set_transient')->alias(function ($key, $value, $ttl = 0) {
        $GLOBALS['kt_term_latest_store'][$key] = $value;
        $GLOBALS['kt_term_latest_ttls'][$key] = $ttl;
        return true;
    });
    Functions\when('pll_current_language')->alias(fn () => $GLOBALS['kt_term_latest_lang']);
});

it('queries once and serves the repeat call from the transient', function () {
    Functions\expect('get_posts')->once()->andReturn([42]);

    expect(kotlinskidev_get_term_latest_post_id(7, 'category'))->toBe(42);
    expect(kotlinskidev_get_term_latest_post_id(7, 'category'))->toBe(42);
});

it('caches an empty result as zero without re-querying', function () {
    Functions\expect('get_posts')->once()->andReturn([]);

    expect(kotlinskidev_get_term_latest_post_id(7, 'post_tag'))->toBe(0);
    expect(kotlinskidev_get_term_latest_post_id(7, 'post_tag'))->toBe(0);
});

it('caches per language', function () {
    Functions\expect('get_posts')->twice()->andReturn([1], [2]);

    expect(kotlinskidev_get_term_latest_post_id(7, 'category'))->toBe(1);
    $GLOBALS['kt_term_latest_lang'] = 'pl';
    expect(kotlinskidev_get_term_latest_post_id(7, 'category'))->toBe(2);
    expect(kotlinskidev_get_term_latest_post_id(7, 'category'))->toBe(2);
});

it('stores the id for twelve hours', function () {
    Functions\when('get_posts')->justReturn([5]);

    kotlinskidev_get_term_latest_post_id(3, 'category');

    $key = kotlinskidev_term_latest_post_cache_key(3, 'category', 'en');
    expect($GLOBALS['kt_term_latest_ttls'][$key])->toBe(12 * 3600);
});

it('uses the category arg for categories and tag_id for tags with lean query flags', function () {
    $category = kotlinskidev_term_latest_post_query_args(4, 'category', 'en');
    $tag = kotlinskidev_term_latest_post_query_args(4, 'post_tag', 'en');

    expect($category['category'])->toBe(4)->and($category)->not->toHaveKey('tag_id');
    expect($tag['tag_id'])->toBe(4)->and($tag)->not->toHaveKey('category');
    expect($category['no_found_rows'])->toBeTrue();
    expect($category['update_post_term_cache'])->toBeFalse();
    expect($category['fields'])->toBe('ids');
});

it('refetches after a purge', function () {
    Functions\expect('get_posts')->twice()->andReturn([1], [9]);

    expect(kotlinskidev_get_term_latest_post_id(7, 'category'))->toBe(1);
    kotlinskidev_purge_term_latest_post_cache();
    expect(kotlinskidev_get_term_latest_post_id(7, 'category'))->toBe(9);
});

it('purges only for relevant post types and taxonomies', function () {
    Functions\when('get_post_type')->alias(fn ($id) => 10 === $id ? 'post' : 'page');

    kotlinskidev_purge_term_latest_post_cache_on_post(11);
    expect(kotlinskidev_term_latest_post_version())->toBe(0);
    kotlinskidev_purge_term_latest_post_cache_on_post(10);
    expect(kotlinskidev_term_latest_post_version())->toBe(1);

    kotlinskidev_purge_term_latest_post_cache_on_object_terms(1, [], [], 'nav_menu');
    expect(kotlinskidev_term_latest_post_version())->toBe(1);
    kotlinskidev_purge_term_latest_post_cache_on_object_terms(1, [], [], 'post_tag');
    expect(kotlinskidev_term_latest_post_version())->toBe(2);

    kotlinskidev_purge_term_latest_post_cache_on_term(1, 1, 'category');
    expect(kotlinskidev_term_latest_post_version())->toBe(3);
});

it('registers the purge hooks', function () {
    $source = file_get_contents(__DIR__ . '/../../functions/term-latest-post-cache.php');

    foreach (['save_post_post', 'delete_post', 'set_object_terms', 'edited_term'] as $hook) {
        expect($source)->toContain("add_action( '{$hook}'");
    }
});
