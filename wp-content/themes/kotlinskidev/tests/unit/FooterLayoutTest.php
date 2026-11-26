<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/footer-layout.php';

function kotlinskidev_footer_test_mods(array $mods): void
{
    Functions\when('get_theme_mod')->alias(fn ($key, $default = false) => $mods[$key] ?? $default);
}

beforeEach(function () {
    Functions\stubTranslationFunctions();
});

it('keeps known footer alignments and falls back to left for anything else', function () {
    expect(kotlinskidev_footer_alignment_sanitize('center'))->toBe('center');
    expect(kotlinskidev_footer_alignment_sanitize('left'))->toBe('left');
    expect(kotlinskidev_footer_alignment_sanitize('right'))->toBe('left');
    expect(kotlinskidev_footer_alignment_sanitize(null))->toBe('left');
    expect(kotlinskidev_footer_alignment_sanitize(['center']))->toBe('left');
});

it('clamps footer column counts to the allowed range per device', function () {
    expect(kotlinskidev_footer_columns_mobile_sanitize('2'))->toBe(2);
    expect(kotlinskidev_footer_columns_mobile_sanitize(9))->toBe(3);
    expect(kotlinskidev_footer_columns_mobile_sanitize(0))->toBe(1);
    expect(kotlinskidev_footer_columns_tablet_sanitize(9))->toBe(4);
    expect(kotlinskidev_footer_columns_tablet_sanitize('3'))->toBe(3);
});

it('falls back to one column for non numeric column values', function () {
    expect(kotlinskidev_footer_columns_mobile_sanitize('abc'))->toBe(1);
    expect(kotlinskidev_footer_columns_tablet_sanitize(null))->toBe(1);
    expect(kotlinskidev_footer_columns_tablet_sanitize(['3']))->toBe(1);
});

it('lists one choice per allowed column count', function () {
    expect(kotlinskidev_footer_columns_choices(3))->toBe(['1' => '1', '2' => '2', '3' => '3']);
});

it('adds no body class for the original left layout with one column everywhere', function () {
    kotlinskidev_footer_test_mods([]);

    expect(kotlinskidev_footer_layout_body_class(['home']))->toBe(['home']);
});

it('centers the brand and the navigation independently', function () {
    kotlinskidev_footer_test_mods(['kotlinskidev_footer_brand_alignment' => 'center']);
    expect(kotlinskidev_footer_layout_body_class([]))->toBe(['kt-footer-brand--center']);

    kotlinskidev_footer_test_mods(['kotlinskidev_footer_nav_alignment' => 'center']);
    expect(kotlinskidev_footer_layout_body_class([]))->toBe(['kt-footer-nav--center']);
});

it('adds column classes only above one column and independent of alignment', function () {
    kotlinskidev_footer_test_mods([
        'kotlinskidev_footer_brand_alignment' => 'center',
        'kotlinskidev_footer_columns_mobile'  => '2',
        'kotlinskidev_footer_columns_tablet'  => '3',
    ]);

    expect(kotlinskidev_footer_layout_body_class(['home']))->toBe(['home', 'kt-footer-brand--center', 'kt-footer-cols-mobile-2', 'kt-footer-cols-tablet-3']);
});

it('ignores tampered stored values', function () {
    kotlinskidev_footer_test_mods([
        'kotlinskidev_footer_brand_alignment' => '<script>',
        'kotlinskidev_footer_nav_alignment'   => ['center'],
        'kotlinskidev_footer_columns_mobile'  => 'abc',
    ]);

    expect(kotlinskidev_footer_layout_body_class([]))->toBe([]);
});
