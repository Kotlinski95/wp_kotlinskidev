<?php

require_once __DIR__ . '/../../functions/safe-css-gradient-vars.php';

it('does not override an already-allowed css value', function () {
    expect(kotlinskidev_allow_gradient_var_css(true, 'linear-gradient(red, blue)'))->toBeTrue();
});

it('blocks values containing backslashes, ampersands, equals, braces, or comment markers', function () {
    foreach (['a\\b', 'a&b', 'a=b', 'a}b', '/* comment */'] as $value) {
        expect(kotlinskidev_allow_gradient_var_css(false, $value))->toBeFalse();
    }
});

it('allows a plain linear-gradient() declaration', function () {
    expect(kotlinskidev_allow_gradient_var_css(false, 'linear-gradient(red, blue)'))->toBeTrue();
});

it('allows a plain rgba()/rgb() declaration', function () {
    expect(kotlinskidev_allow_gradient_var_css(false, 'rgba(0,0,0,0.5)'))->toBeTrue();
    expect(kotlinskidev_allow_gradient_var_css(false, 'rgb(0,0,0)'))->toBeTrue();
});

it('denies a var() css custom property reference', function () {
    expect(kotlinskidev_allow_gradient_var_css(false, 'var(--x)'))->toBeFalse();
});

it('denies a gradient that itself wraps var() calls', function () {
    expect(kotlinskidev_allow_gradient_var_css(false, 'linear-gradient(var(--a), var(--b))'))->toBeFalse();
});

it('denies unrelated function calls like calc()', function () {
    expect(kotlinskidev_allow_gradient_var_css(false, 'calc(1px + 2px)'))->toBeFalse();
});
