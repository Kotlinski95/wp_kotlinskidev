<?php

require_once __DIR__ . '/../../functions/custom-css-vars.php';

it('lists the currently supported blocks', function () {
    expect(kotlinskidev_custom_css_vars_supported_blocks())->toBe([
        'kotlinskidev/icon',
        'core/image',
        'core/site-logo',
    ]);
});

it('accepts a valid css custom property name', function () {
    expect(kotlinskidev_sanitize_css_var_name('--logo-icon-bg'))->toBe('--logo-icon-bg');
});

it('trims surrounding whitespace on a name before validating', function () {
    expect(kotlinskidev_sanitize_css_var_name('  --logo-icon-bg  '))->toBe('--logo-icon-bg');
});

it('rejects a name missing the leading double dash', function () {
    expect(kotlinskidev_sanitize_css_var_name('logo-icon-bg'))->toBe('');
});

it('rejects a name starting with a digit after the dashes', function () {
    expect(kotlinskidev_sanitize_css_var_name('--1invalid'))->toBe('');
});

it('rejects a name containing a semicolon or brace injection attempt', function () {
    foreach (['--x;}body{display:none', '--x{', '--x}'] as $name) {
        expect(kotlinskidev_sanitize_css_var_name($name))->toBe('');
    }
});

it('accepts hex colors, rgb/hsl functions, keywords, and plain numbers as values', function () {
    foreach (['#1c1d18', '#00f6ff', 'rgba(0, 246, 255, 0.5)', 'transparent', '4', '1.5rem'] as $value) {
        expect(kotlinskidev_sanitize_css_var_value($value))->toBe($value);
    }
});

it('rejects an empty value', function () {
    expect(kotlinskidev_sanitize_css_var_value(''))->toBe('');
    expect(kotlinskidev_sanitize_css_var_value('   '))->toBe('');
});

it('rejects a value over 200 characters', function () {
    expect(kotlinskidev_sanitize_css_var_value(str_repeat('a', 201)))->toBe('');
});

it('rejects a value containing url( regardless of case', function () {
    foreach (['url(javascript:alert(1))', 'URL(evil.svg)'] as $value) {
        expect(kotlinskidev_sanitize_css_var_value($value))->toBe('');
    }
});

it('rejects a value containing css breakout characters', function () {
    foreach (['red; } body { display: none', 'red"onload="alert(1)', "red'"] as $value) {
        expect(kotlinskidev_sanitize_css_var_value($value))->toBe('');
    }
});

it('returns no declarations for an empty array', function () {
    expect(kotlinskidev_build_custom_css_vars_declarations([]))->toBe([]);
});

it('builds declarations for every valid entry, in order', function () {
    $declarations = kotlinskidev_build_custom_css_vars_declarations([
        ['name' => '--logo-icon-bg', 'value' => '#1c1d18'],
        ['name' => '--logo-icon-mark', 'value' => '#00f6ff'],
        ['name' => '--logo-dev-weight', 'value' => '4'],
    ]);

    expect($declarations)->toBe([
        '--logo-icon-bg:#1c1d18',
        '--logo-icon-mark:#00f6ff',
        '--logo-dev-weight:4',
    ]);
});

it('skips an entry with an invalid name but keeps the rest', function () {
    $declarations = kotlinskidev_build_custom_css_vars_declarations([
        ['name' => 'invalid', 'value' => '#1c1d18'],
        ['name' => '--logo-icon-mark', 'value' => '#00f6ff'],
    ]);

    expect($declarations)->toBe(['--logo-icon-mark:#00f6ff']);
});

it('skips an entry with an invalid value but keeps the rest', function () {
    $declarations = kotlinskidev_build_custom_css_vars_declarations([
        ['name' => '--logo-icon-bg', 'value' => 'url(evil.svg)'],
        ['name' => '--logo-icon-mark', 'value' => '#00f6ff'],
    ]);

    expect($declarations)->toBe(['--logo-icon-mark:#00f6ff']);
});

it('skips a non-array entry', function () {
    expect(kotlinskidev_build_custom_css_vars_declarations(['not-an-array']))->toBe([]);
});
