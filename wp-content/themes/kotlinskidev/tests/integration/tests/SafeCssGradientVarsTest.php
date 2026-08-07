<?php

uses(Tests\Integration\TestCase::class);

it('leaves css already allowed by an earlier filter untouched', function () {
    expect(kotlinskidev_allow_gradient_var_css(true, 'anything'))->toBeTrue();
});

it('rejects css containing a backslash, ampersand, equals sign, closing brace, or comment opener', function () {
    expect(kotlinskidev_allow_gradient_var_css(false, 'red\\'))->toBeFalse();
    expect(kotlinskidev_allow_gradient_var_css(false, 'red&blue'))->toBeFalse();
    expect(kotlinskidev_allow_gradient_var_css(false, 'red=blue'))->toBeFalse();
    expect(kotlinskidev_allow_gradient_var_css(false, 'red}'))->toBeFalse();
    expect(kotlinskidev_allow_gradient_var_css(false, 'red/*comment*/'))->toBeFalse();
});

it('allows a linear-gradient function value', function () {
    expect(kotlinskidev_allow_gradient_var_css(false, 'linear-gradient(red, blue)'))->toBeTrue();
});

it('allows an rgba color function value', function () {
    expect(kotlinskidev_allow_gradient_var_css(false, 'rgba(0,0,0,.5)'))->toBeTrue();
});

it('rejects a css value with unrecognized parentheses (e.g. a url() call)', function () {
    expect(kotlinskidev_allow_gradient_var_css(false, 'url(evil.css)'))->toBeFalse();
});

it('allows a plain css value with no parentheses at all', function () {
    expect(kotlinskidev_allow_gradient_var_css(false, 'red'))->toBeTrue();
});

it('is registered on the safecss_filter_attr_allow_css filter', function () {
    expect(apply_filters('safecss_filter_attr_allow_css', false, 'linear-gradient(red, blue)'))->toBeTrue();
});
