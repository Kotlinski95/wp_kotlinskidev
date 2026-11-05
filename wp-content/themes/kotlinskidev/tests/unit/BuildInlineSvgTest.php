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

it('carries over the width attribute from the source img tag, escaped via esc_attr', function () {
    Functions\when('esc_attr')->justReturn('247');

    $result = kotlinskidev_build_inline_svg('<svg><path/></svg>', '<img src="logo.svg" width="247">');

    expect($result)->toContain('width="247"');
});

it('carries over the height attribute from the source img tag, escaped via esc_attr', function () {
    Functions\when('esc_attr')->justReturn('72');

    $result = kotlinskidev_build_inline_svg('<svg><path/></svg>', '<img src="logo.svg" height="72">');

    expect($result)->toContain('height="72"');
});

it('omits width and height attributes entirely when the source img tag has none', function () {
    $result = kotlinskidev_build_inline_svg('<svg><path/></svg>', '<img src="logo.svg">');

    expect($result)->not->toContain('width=');
    expect($result)->not->toContain('height=');
});

it('places the copied width/height before the SVG file\'s own, so a duplicate-attribute-tolerant parser prefers the block\'s configured size', function () {
    Functions\when('esc_attr')->returnArg();

    $result = kotlinskidev_build_inline_svg(
        '<svg width="274" height="80"><path/></svg>',
        '<img src="logo.svg" width="247" height="72">'
    );

    $firstWidthPos = strpos($result, 'width="247"');
    $secondWidthPos = strpos($result, 'width="274"');
    expect($firstWidthPos)->not->toBeFalse();
    expect($secondWidthPos)->not->toBeFalse();
    expect($firstWidthPos)->toBeLessThan($secondWidthPos);
});
