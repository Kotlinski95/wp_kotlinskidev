<?php

require_once __DIR__ . '/../../functions/responsive-width.php';

it('passes through empty, auto, and none unchanged', function () {
    expect(kotlinskidev_sanitize_css_length(''))->toBe('');
    expect(kotlinskidev_sanitize_css_length('auto'))->toBe('auto');
    expect(kotlinskidev_sanitize_css_length('none'))->toBe('none');
});

it('accepts valid css length values in supported units', function () {
    foreach (['100px', '50%', '1.5rem', '2em', '10vw', '5vh', '-10px'] as $value) {
        expect(kotlinskidev_sanitize_css_length($value))->toBe($value);
    }
});

it('passes through the css sizing keywords unchanged', function () {
    foreach (['max-content', 'min-content', 'fit-content', 'stretch'] as $value) {
        expect(kotlinskidev_sanitize_css_length($value))->toBe($value);
    }
});

it('trims surrounding whitespace before validating', function () {
    expect(kotlinskidev_sanitize_css_length('  100px  '))->toBe('100px');
});

it('rejects unsupported units, keywords, and expressions', function () {
    foreach (['red', '100', '10ptx', 'calc(100% - 10px)', '100 px'] as $value) {
        expect(kotlinskidev_sanitize_css_length($value))->toBe('');
    }
});

it('returns no declarations for an empty responsiveWidth array', function () {
    expect(kotlinskidev_build_responsive_width_declarations([]))->toBe([]);
});

it('builds width and max-width custom properties for a device', function () {
    $declarations = kotlinskidev_build_responsive_width_declarations([
        'desktop' => ['width' => '100%', 'maxWidth' => '1200px'],
    ]);

    expect($declarations)->toBe([
        '--kt-width-desktop:100%',
        '--kt-max-width-desktop:1200px',
    ]);
});

it('skips a device entirely when its settings are not an array', function () {
    $declarations = kotlinskidev_build_responsive_width_declarations([
        'desktop' => 'not-an-array',
    ]);

    expect($declarations)->toBe([]);
});

it('omits an individual property when its value fails sanitization', function () {
    $declarations = kotlinskidev_build_responsive_width_declarations([
        'desktop' => ['width' => 'not-a-length', 'maxWidth' => '1200px'],
    ]);

    expect($declarations)->toBe(['--kt-max-width-desktop:1200px']);
});

it('builds declarations across all three devices in order', function () {
    $declarations = kotlinskidev_build_responsive_width_declarations([
        'desktop' => ['width' => '100%'],
        'tablet' => ['width' => '90%'],
        'mobile' => ['maxWidth' => '400px'],
    ]);

    expect($declarations)->toBe([
        '--kt-width-desktop:100%',
        '--kt-width-tablet:90%',
        '--kt-max-width-mobile:400px',
    ]);
});
