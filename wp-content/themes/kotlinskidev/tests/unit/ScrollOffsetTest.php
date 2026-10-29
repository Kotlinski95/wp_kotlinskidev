<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/scroll-offset.php';

it('returns the desktop and mobile scroll offsets from options, falling back to the defaults', function () {
    Functions\when('get_option')->alias(fn ($name, $default) => $default);

    expect(kotlinskidev_get_scroll_offsets())->toBe(['desktop' => 75, 'mobile' => 0]);
});
