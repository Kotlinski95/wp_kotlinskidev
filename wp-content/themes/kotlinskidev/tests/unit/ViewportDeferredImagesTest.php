<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/above-fold-media.php';
require_once __DIR__ . '/../../functions/viewport-deferred-images.php';

beforeEach(function () {
    Functions\when('is_admin')->justReturn(false);
    Functions\when('is_feed')->justReturn(false);
    Functions\when('wp_is_json_request')->justReturn(false);
});

$panel = '<div class="kt-content-tabs__panel"><img src="a.jpg" srcset="a.jpg 1x, b.jpg 2x" sizes="100vw" width="10" height="5" loading="lazy" alt=""></div>';

it('moves src, srcset and sizes to data attributes and adds a noscript copy', function () use ($panel) {
    $html = kotlinskidev_defer_content_tabs_images($panel, ['blockName' => 'kotlinskidev/content-tabs-item', 'attrs' => []]);

    expect($html)->toContain('data-src="a.jpg"');
    expect($html)->toContain('data-srcset="a.jpg 1x, b.jpg 2x"');
    expect($html)->toContain('data-sizes="100vw"');
    expect($html)->toContain('width="10" height="5"');
    expect($html)->toContain('<noscript><img src="a.jpg" srcset="a.jpg 1x, b.jpg 2x" sizes="100vw"');
});

it('leaves already deferred images alone', function () {
    $html = '<img data-src="a.jpg" alt="">';

    expect(kotlinskidev_defer_content_tabs_images($html, ['blockName' => 'x', 'attrs' => []]))->toBe($html);
});

it('skips above-fold items', function () use ($panel) {
    $html = kotlinskidev_defer_content_tabs_images($panel, ['blockName' => 'x', 'attrs' => ['kotlinskidevAboveFold' => true]]);

    expect($html)->toBe($panel);
});

it('skips admin, feed and json requests', function () use ($panel) {
    Functions\when('is_feed')->justReturn(true);

    expect(kotlinskidev_defer_content_tabs_images($panel, ['blockName' => 'x', 'attrs' => []]))->toBe($panel);
});

it('returns content without images untouched', function () {
    expect(kotlinskidev_defer_content_tabs_images('<p>hi</p>', ['blockName' => 'x', 'attrs' => []]))->toBe('<p>hi</p>');
});
