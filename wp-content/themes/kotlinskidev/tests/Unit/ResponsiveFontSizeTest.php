<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/breakpoints.php';
require_once __DIR__ . '/../../functions/responsive-font-size.php';

beforeEach(function () {
    Functions\when('get_option')->alias(fn ($name, $default) => $default);
    Functions\when('wp_json_encode')->alias('json_encode');
});

it('returns an empty string for an empty value', function () {
    expect(kotlinskidev_sanitize_font_size_length(''))->toBe('');
});

it('accepts valid font-size lengths in supported units', function () {
    foreach (['16px', '1.5rem', '120%', '2em', '5vw', '3vh'] as $value) {
        expect(kotlinskidev_sanitize_font_size_length($value))->toBe($value);
    }
});

it('rejects negative values, since font-size cannot be negative', function () {
    expect(kotlinskidev_sanitize_font_size_length('-16px'))->toBe('');
});

it('rejects unsupported units and non-numeric values', function () {
    foreach (['16pt', 'large', '16 px'] as $value) {
        expect(kotlinskidev_sanitize_font_size_length($value))->toBe('');
    }
});

it('trims surrounding whitespace before validating', function () {
    expect(kotlinskidev_sanitize_font_size_length('  16px  '))->toBe('16px');
});

it('collects only the valid devices from the font sizes array', function () {
    $values = kotlinskidev_collect_responsive_font_sizes([
        'mobile' => '16px',
        'tablet' => 'invalid',
        'desktop' => '2rem',
    ]);

    expect($values)->toBe(['mobile' => '16px', 'desktop' => '2rem']);
});

it('returns an empty array when no device has a valid font size', function () {
    expect(kotlinskidev_collect_responsive_font_sizes([]))->toBe([]);
});

it('builds a stable, deterministic class name from the collected values', function () {
    $values = ['mobile' => '16px'];

    $class = kotlinskidev_responsive_font_size_class($values);

    expect($class)->toBe('kt-rfs-' . substr(md5(json_encode($values)), 0, 10));
});

it('produces different class names for different values', function () {
    $classA = kotlinskidev_responsive_font_size_class(['mobile' => '16px']);
    $classB = kotlinskidev_responsive_font_size_class(['mobile' => '18px']);

    expect($classA)->not->toBe($classB);
});

it('returns an empty string when there are no values to build css from', function () {
    expect(kotlinskidev_build_responsive_font_size_css('kt-rfs-abc', []))->toBe('');
});

it('builds one important-flagged font-size rule per device with a value', function () {
    $css = kotlinskidev_build_responsive_font_size_css('kt-rfs-abc', [
        'mobile' => '16px',
        'desktop' => '2rem',
    ]);

    expect($css)->toBe(
        '@media (max-width: 781px){.kt-rfs-abc{font-size:16px !important}}'
        . '@media (min-width: 1024px){.kt-rfs-abc{font-size:2rem !important}}'
    );
});
