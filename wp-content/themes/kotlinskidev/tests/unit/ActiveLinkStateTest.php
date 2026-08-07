<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/active-link-state.php';

beforeEach(function () {
    Functions\when('wp_parse_url')->alias('parse_url');
    Functions\when('untrailingslashit')->alias(fn ($s) => rtrim((string) $s, '/'));
    Functions\when('sanitize_text_field')->alias(fn ($s) => $s);
    Functions\when('wp_unslash')->alias(fn ($s) => $s);
    Functions\when('home_url')->alias(fn ($path = '') => 'https://example.test' . $path);

    $_SERVER['REQUEST_URI'] = '/current-page/';
});

afterEach(function () {
    unset($_SERVER['REQUEST_URI']);
});

it('rejects an empty url or a bare fragment placeholder', function () {
    expect(kotlinskidev_is_current_link_url(''))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('   '))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('#'))->toBeFalse();
});

it('rejects javascript, mailto, and tel pseudo-protocol urls', function () {
    expect(kotlinskidev_is_current_link_url('javascript:alert(1)'))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('mailto:someone@example.test'))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('tel:+1234567890'))->toBeFalse();
});

it('rejects an absolute url on a different host', function () {
    expect(kotlinskidev_is_current_link_url('https://other-site.test/current-page/'))->toBeFalse();
});

it('matches a relative path equal to the current request path', function () {
    expect(kotlinskidev_is_current_link_url('/current-page/'))->toBeTrue();
});

it('matches regardless of a trailing slash on either side', function () {
    expect(kotlinskidev_is_current_link_url('/current-page'))->toBeTrue();
});

it('matches an absolute same-host url with the current path', function () {
    expect(kotlinskidev_is_current_link_url('https://example.test/current-page/'))->toBeTrue();
});

it('does not match a different path', function () {
    expect(kotlinskidev_is_current_link_url('/other-page/'))->toBeFalse();
});

it('matches the home path when the request uri is the site root', function () {
    $_SERVER['REQUEST_URI'] = '/';

    expect(kotlinskidev_is_current_link_url('/'))->toBeTrue();
});
