<?php

uses(Tests\Integration\TestCase::class);

it('registers wp_navigation as a translatable post type for polylang', function () {
    $post_types = kotlinskidev_pll_register_navigation(['post' => 'post'], false);

    expect($post_types)->toHaveKey('wp_navigation');
});

it('registers wp_block as a translatable post type for polylang', function () {
    $post_types = kotlinskidev_pll_register_reusable_blocks(['post' => 'post'], false);

    expect($post_types)->toHaveKey('wp_block');
});

it('resolves a real published post by slug and post type', function () {
    $unique_slug = 'kt-resolve-test-' . uniqid();
    $post_id = self::factory()->post->create([
        'post_type'   => 'wp_navigation',
        'post_name'   => $unique_slug,
        'post_status' => 'publish',
    ]);

    $resolved = kotlinskidev_resolve_translatable_post($unique_slug, 'wp_navigation');

    expect($resolved)->toBeInstanceOf(WP_Post::class);
    expect($resolved->ID)->toBe($post_id);
});

it('returns null for a slug that does not exist', function () {
    $missing_slug = 'kt-missing-' . uniqid();

    expect(kotlinskidev_resolve_translatable_post($missing_slug, 'wp_navigation'))->toBeNull();
});
