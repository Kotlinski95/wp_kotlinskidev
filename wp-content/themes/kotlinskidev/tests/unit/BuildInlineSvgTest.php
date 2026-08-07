<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/svg-support.php';

it('adds aria-hidden and focusable attributes to the svg tag', function () {
    $result = kotlinskidev_build_inline_svg('<svg><path/></svg>', '<img src="logo.svg">');

    expect($result)->toContain('aria-hidden="true"');
    expect($result)->toContain('focusable="false"');
});

it('carries over the class attribute from the source img tag, escaped via esc_attr', function () {
    Functions\when('esc_attr')->justReturn('kt-logo escaped');

    $result = kotlinskidev_build_inline_svg('<svg><path/></svg>', '<img src="logo.svg" class="kt-logo">');

    expect($result)->toContain('class="kt-logo escaped"');
});

it('carries over the style attribute from the source img tag, escaped via esc_attr', function () {
    Functions\when('esc_attr')->justReturn('width:2rem escaped');

    $result = kotlinskidev_build_inline_svg('<svg><path/></svg>', '<img src="logo.svg" style="width:2rem">');

    expect($result)->toContain('style="width:2rem escaped"');
});

it('omits class and style attributes entirely when the source img tag has none', function () {
    $result = kotlinskidev_build_inline_svg('<svg><path/></svg>', '<img src="logo.svg">');

    expect($result)->not->toContain('class=');
    expect($result)->not->toContain('style=');
});
