<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/active-link-state.php';
require_once __DIR__ . '/../../functions/search-page-dynamic-blocks/origin-redirect.php';

beforeEach(function () {
    Functions\when('add_query_arg')->alias(fn($key, $value, $url) => $url . '?' . $key . '=' . $value);
});

it('redirects a search query on the static home page to the home url', function () {
    expect(kotlinskidev_search_origin_redirect_target('CV', false, true, 'https://example.test/en/', '/en/home/'))
        ->toBe('https://example.test/en/?s=CV');
});

it('url-encodes the search term', function () {
    expect(kotlinskidev_search_origin_redirect_target('a b&c', false, true, 'https://example.test/', '/home/'))
        ->toBe('https://example.test/?s=a%20b%26c');
});

it('does nothing without a search term', function () {
    expect(kotlinskidev_search_origin_redirect_target('', false, true, 'https://example.test/', '/home/'))->toBe('');
});

it('does nothing on a real search request', function () {
    expect(kotlinskidev_search_origin_redirect_target('CV', true, true, 'https://example.test/', '/'))->toBe('');
});

it('does nothing outside the front page', function () {
    expect(kotlinskidev_search_origin_redirect_target('CV', false, false, 'https://example.test/', '/about/'))->toBe('');
});

it('does not loop when already on the target path', function () {
    expect(kotlinskidev_search_origin_redirect_target('CV', false, true, 'https://example.test/en/', '/en'))->toBe('');
    expect(kotlinskidev_search_origin_redirect_target('CV', false, true, 'https://example.test/', '/'))->toBe('');
});
