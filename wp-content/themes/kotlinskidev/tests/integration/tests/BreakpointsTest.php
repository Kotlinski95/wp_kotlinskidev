<?php

uses(Tests\Integration\TestCase::class);

it('returns the default breakpoints with correct min/max relationships when no options are set', function () {
    $breakpoints = kotlinskidev_get_breakpoints();

    expect($breakpoints['mobile_max'])->toBe(781);
    expect($breakpoints['tablet_max'])->toBe(1023);
    expect($breakpoints['large'])->toBe(1200);
    expect($breakpoints['tablet_min'])->toBe($breakpoints['mobile_max'] + 1);
    expect($breakpoints['desktop_min'])->toBe($breakpoints['tablet_max'] + 1);
});

it('reports the breakpoints as default when no overriding options are set', function () {
    expect(kotlinskidev_breakpoints_are_default())->toBeTrue();
});

it('produces an 8-character breakpoints hash', function () {
    expect(kotlinskidev_breakpoints_hash())->toHaveLength(8);
});

it('converts a pixel value to a trimmed rem string', function () {
    expect(kotlinskidev_breakpoint_px_to_rem(16))->toBe('1rem');
    expect(kotlinskidev_breakpoint_px_to_rem(781))->toBe('48.8125rem');
    expect(kotlinskidev_breakpoint_px_to_rem(1023))->toBe('63.9375rem');
    expect(kotlinskidev_breakpoint_px_to_rem(1200))->toBe('75rem');
});

it('detects a known breakpoint build token inside css', function () {
    expect(kotlinskidev_css_has_breakpoint_tokens('@media (max-width: 48.875rem) { .x { display: none; } }'))->toBeTrue();
});

it('reports no breakpoint tokens present in unrelated css', function () {
    expect(kotlinskidev_css_has_breakpoint_tokens('.x { color: red; }'))->toBeFalse();
});

it('leaves css untouched when the current breakpoints are still the defaults', function () {
    $css = '@media (max-width: 48.875rem) { .x { display: none; } }';

    expect(kotlinskidev_transform_breakpoint_css($css))->toBe($css);
});

it('builds the four expected css media query strings from the current breakpoints', function () {
    $breakpoints = kotlinskidev_get_breakpoints();
    $queries = kotlinskidev_get_css_breakpoints();

    expect($queries['mobile'])->toBe("@media (max-width: {$breakpoints['mobile_max']}px)");
    expect($queries['tablet'])->toBe(
        "@media (min-width: {$breakpoints['tablet_min']}px) and (max-width: {$breakpoints['tablet_max']}px)"
    );
    expect($queries['desktop'])->toBe("@media (min-width: {$breakpoints['desktop_min']}px)");
    expect($queries['large'])->toBe("@media (min-width: {$breakpoints['large']}px)");
});

it('returns the same shape from kotlinskidev_get_js_breakpoints as kotlinskidev_get_breakpoints', function () {
    expect(kotlinskidev_get_js_breakpoints())->toBe(kotlinskidev_get_breakpoints());
});

it('builds scoped responsive css only for devices with a non-empty value', function () {
    $css = kotlinskidev_build_scoped_responsive_css('.my-block', [
        'display' => ['desktop' => 'flex', 'mobile' => 'block'],
    ]);

    expect($css)->toContain('.my-block{display:flex;}');
    expect($css)->toContain('.my-block{display:block;}');
    expect(substr_count($css, '.my-block{'))->toBe(2);
});

it('produces empty scoped css when no device has a value', function () {
    $css = kotlinskidev_build_scoped_responsive_css('.my-block', [
        'display' => ['desktop' => '', 'tablet' => '', 'mobile' => ''],
    ]);

    expect($css)->toBe('');
});

it('bridges the mobile_breakpoint theme_mod filter to the real mobile_max breakpoint', function () {
    expect(apply_filters('theme_mod_mobile_breakpoint', null))
        ->toBe(kotlinskidev_get_breakpoints()['mobile_max']);
});

it('bridges the tablet_breakpoint theme_mod filter to the real tablet_max breakpoint', function () {
    expect(apply_filters('theme_mod_tablet_breakpoint', null))
        ->toBe(kotlinskidev_get_breakpoints()['tablet_max']);
});
