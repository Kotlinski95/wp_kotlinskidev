<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/svg-support.php';
require_once __DIR__ . '/../../functions/responsive-style-dedupe.php';

function kt_dedupe_context(bool $front_end, int $wp_head_count): void
{
    Functions\when('is_admin')->justReturn(!$front_end);
    Functions\when('wp_doing_ajax')->justReturn(false);
    Functions\when('is_feed')->justReturn(false);
    Functions\when('did_action')->alias(fn ($hook) => 'wp_head' === $hook ? $wp_head_count : 0);
}

it('holds styles back for wp_head while the template renders before the head', function () {
    kt_dedupe_context(true, 0);

    $html = kotlinskidev_append_responsive_style('<div class="a">x</div>', 'kt-rspc-early01', '.kt-rspc-early01{color:red}');

    expect($html)->toBe('<div class="a">x</div>');
    expect(kotlinskidev_responsive_style_registry()['pending'])->toHaveKey('kt-rspc-early01');
});

it('prints each held class once in a single head style tag', function () {
    kt_dedupe_context(true, 0);
    kotlinskidev_append_responsive_style('<p>1</p>', 'kt-rspc-early02', '.kt-rspc-early02{a:b}');
    kotlinskidev_append_responsive_style('<p>2</p>', 'kt-rspc-early02', '.kt-rspc-early02{a:b}');

    ob_start();
    kotlinskidev_print_responsive_styles();
    $out = ob_get_clean();

    expect(substr_count($out, 'kt-rspc-early02{a:b}'))->toBe(1);
    expect($out)->toContain('<style id="kt-responsive-styles">');
});

it('skips the inline style after the head when the class already printed there', function () {
    kt_dedupe_context(true, 1);

    $html = kotlinskidev_append_responsive_style('<p>late</p>', 'kt-rspc-early02', '.kt-rspc-early02{a:b}');

    expect($html)->toBe('<p>late</p>');
});

it('keeps an inline style for a class never printed in the head', function () {
    kt_dedupe_context(true, 1);

    $html = kotlinskidev_append_responsive_style('<p>late</p>', 'kt-rspc-late01', '.kt-rspc-late01{a:b}');

    expect($html)->toBe('<p>late</p><style>.kt-rspc-late01{a:b}</style>');
});

it('always emits inline styles outside the front end render', function () {
    kt_dedupe_context(false, 0);

    $html = kotlinskidev_append_responsive_style('<p>x</p>', 'kt-rspc-admin01', '.kt-rspc-admin01{a:b}');

    expect($html)->toContain('<style>.kt-rspc-admin01{a:b}</style>');
});
