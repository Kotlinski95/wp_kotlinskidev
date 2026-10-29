<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/icon-library.php';

beforeEach(function () {
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('_n_noop')->alias(fn ($single, $plural, $domain = null) => ['singular' => $single, 'plural' => $plural]);
});

it('adds an svg entry without disturbing existing mime types', function () {
    $result = kotlinskidev_add_icon_library_media_filter([
        'image' => ['Images', 'Manage Images', 'Images <span class="count">(%s)</span>'],
    ]);

    expect($result)->toHaveKey('image');
    expect($result)->toHaveKey('image/svg+xml');
});

it('labels the svg entry as Icons (SVG)', function () {
    $result = kotlinskidev_add_icon_library_media_filter([]);

    expect($result['image/svg+xml'][0])->toBe('Icons (SVG)');
    expect($result['image/svg+xml'][1])->toBe('Manage Icons (SVG)');
});
