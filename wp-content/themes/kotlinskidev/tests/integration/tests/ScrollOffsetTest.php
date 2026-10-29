<?php

uses(Tests\Integration\TestCase::class);

it('defines the documented default desktop and mobile scroll offsets', function () {
    expect(KOTLINSKIDEV_SCROLL_OFFSET_DEFAULTS)->toBe(['desktop' => 75, 'mobile' => 0]);
});

it('returns integer desktop and mobile scroll offsets', function () {
    $offsets = kotlinskidev_get_scroll_offsets();

    expect($offsets)->toHaveKeys(['desktop', 'mobile']);
    expect($offsets['desktop'])->toBeInt();
    expect($offsets['mobile'])->toBeInt();
});
