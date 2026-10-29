<?php

uses(Tests\Integration\TestCase::class);

it('detects no active SEO plugin in a clean environment', function () {
    expect(kotlinskidev_detect_active_seo_plugin())->toBe('');
});

it('leaves query args untouched when no SEO plugin is detected', function () {
    $args = ['post_type' => 'post', 'posts_per_page' => 10];

    expect(kotlinskidev_apply_seo_noindex_exclusion($args))->toBe($args);
});

it('leaves an empty query args array untouched when no SEO plugin is detected', function () {
    expect(kotlinskidev_apply_seo_noindex_exclusion([]))->toBe([]);
});
