<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/search-page-styles.php';

beforeEach(function () {
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
    unset($_SERVER['REQUEST_URI']);
});

it('is a search page when is_search returns true', function () {
    Functions\when('is_search')->justReturn(true);

    expect(kotlinskidev_is_search_page())->toBeTrue();
});

it('is a search page when it is a page with the "search" slug', function () {
    Functions\when('is_search')->justReturn(false);
    Functions\when('is_page')->justReturn(true);
    Functions\when('get_post_field')->justReturn('search');
    Functions\when('is_page_template')->justReturn(false);

    expect(kotlinskidev_is_search_page())->toBeTrue();
});

it('is a search page when the request uri contains /search/', function () {
    Functions\when('is_search')->justReturn(false);
    Functions\when('is_page')->justReturn(true);
    Functions\when('get_post_field')->justReturn('contact');
    Functions\when('is_page_template')->justReturn(false);
    $_SERVER['REQUEST_URI'] = '/en/search/?s=hello';

    expect(kotlinskidev_is_search_page())->toBeTrue();
});

it('is a search page when the page template slug contains "search"', function () {
    Functions\when('is_search')->justReturn(false);
    Functions\when('is_page')->justReturn(false);
    Functions\when('is_page_template')->justReturn(true);
    Functions\when('get_page_template_slug')->justReturn('templates/search_pl.html');

    expect(kotlinskidev_is_search_page())->toBeTrue();
});

it('is not a search page when none of the checks match', function () {
    Functions\when('is_search')->justReturn(false);
    Functions\when('is_page')->justReturn(true);
    Functions\when('get_post_field')->justReturn('about');
    Functions\when('is_page_template')->justReturn(true);
    Functions\when('get_page_template_slug')->justReturn('templates/about.html');
    $_SERVER['REQUEST_URI'] = '/about/';

    expect(kotlinskidev_is_search_page())->toBeFalse();
});
