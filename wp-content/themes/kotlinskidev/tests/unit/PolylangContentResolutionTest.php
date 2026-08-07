<?php

use Brain\Monkey\Functions;

if (!class_exists('WP_Post')) {
    class WP_Post
    {
        public int $ID;
        public string $post_content = '';
        public function __construct(int $id)
        {
            $this->ID = $id;
        }
    }
}

if (!function_exists('has_filter')) {
    function has_filter(...$args)
    {
        return false;
    }
}

if (!defined('OBJECT')) {
    define('OBJECT', 'OBJECT');
}

require_once __DIR__ . '/../../functions/polylang-content-resolution.php';

it('adds wp_navigation to the list of translatable post types', function () {
    $result = kotlinskidev_pll_register_navigation(['post' => 'post'], false);

    expect($result)->toBe(['post' => 'post', 'wp_navigation' => 'wp_navigation']);
});

it('adds wp_block to the list of translatable post types', function () {
    $result = kotlinskidev_pll_register_reusable_blocks(['post' => 'post'], false);

    expect($result)->toBe(['post' => 'post', 'wp_block' => 'wp_block']);
});

it('returns null when no post exists at the given path', function () {
    Functions\when('get_page_by_path')->justReturn(null);

    expect(kotlinskidev_resolve_translatable_post('missing-slug', 'wp_navigation'))->toBeNull();
});

it('returns the resolved post as-is when polylang is not active', function () {
    $post = new WP_Post(42);
    Functions\when('get_page_by_path')->justReturn($post);

    $result = kotlinskidev_resolve_translatable_post('header-nav', 'wp_navigation');

    expect($result)->toBe($post);
});
