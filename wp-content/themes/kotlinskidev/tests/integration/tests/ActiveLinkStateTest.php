<?php

uses(Tests\Integration\TestCase::class);

beforeEach(function () {
    $this->originalRequestUri = $_SERVER['REQUEST_URI'] ?? '';
    delete_option('kotlinskidev_active_link_state_enabled');
    delete_option('kotlinskidev_active_link_state_block_clicks');
});

afterEach(function () {
    $_SERVER['REQUEST_URI'] = $this->originalRequestUri;
    delete_option('kotlinskidev_active_link_state_enabled');
    delete_option('kotlinskidev_active_link_state_block_clicks');
});

it('treats an empty or hash-only url as not current', function () {
    expect(kotlinskidev_is_current_link_url(''))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('#'))->toBeFalse();
});

it('treats javascript, mailto, and tel links as never current', function () {
    expect(kotlinskidev_is_current_link_url('javascript:void(0)'))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('mailto:test@example.com'))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('tel:+15551234567'))->toBeFalse();
});

it('treats a link to a different host as not current', function () {
    expect(kotlinskidev_is_current_link_url('https://not-this-site.example/some-page'))->toBeFalse();
});

it('treats a link matching the current request path as current', function () {
    $_SERVER['REQUEST_URI'] = '/some-page/';

    expect(kotlinskidev_is_current_link_url(home_url('/some-page/')))->toBeTrue();
});

it('treats a link to a different path as not current', function () {
    $_SERVER['REQUEST_URI'] = '/some-page/';

    expect(kotlinskidev_is_current_link_url(home_url('/other-page/')))->toBeFalse();
});

it('ignores a trailing slash difference when comparing paths', function () {
    $_SERVER['REQUEST_URI'] = '/some-page';

    expect(kotlinskidev_is_current_link_url(home_url('/some-page/')))->toBeTrue();
});

it('leaves block content untouched when it contains no anchor tags', function () {
    $_SERVER['REQUEST_URI'] = '/some-page/';

    $html = kotlinskidev_mark_active_link_state('<p>no links here</p>', ['attrs' => []]);

    expect($html)->toBe('<p>no links here</p>');
});

it('leaves links untouched when the feature is disabled via option', function () {
    add_option('kotlinskidev_active_link_state_enabled', false);
    $_SERVER['REQUEST_URI'] = '/some-page/';
    $link = home_url('/some-page/');

    $html = kotlinskidev_mark_active_link_state("<a href=\"{$link}\">Some page</a>", ['attrs' => []]);

    expect($html)->not->toContain('kt-link-current');
});

it('leaves links untouched when the block explicitly disables active state', function () {
    $_SERVER['REQUEST_URI'] = '/some-page/';
    $link = home_url('/some-page/');
    $block = ['attrs' => ['activeLinkState' => ['disableActiveState' => true]]];

    $html = kotlinskidev_mark_active_link_state("<a href=\"{$link}\">Some page</a>", $block);

    expect($html)->not->toContain('kt-link-current');
});

it('marks a link matching the current page with the current class and aria-current', function () {
    $_SERVER['REQUEST_URI'] = '/some-page/';
    $link = home_url('/some-page/');

    $html = kotlinskidev_mark_active_link_state("<a href=\"{$link}\">Some page</a>", ['attrs' => []]);

    expect($html)->toContain('kt-link-current');
    expect($html)->toContain('aria-current="page"');
});

it('leaves a non-matching link without the current class', function () {
    $_SERVER['REQUEST_URI'] = '/some-page/';
    $link = home_url('/other-page/');

    $html = kotlinskidev_mark_active_link_state("<a href=\"{$link}\">Other page</a>", ['attrs' => []]);

    expect($html)->not->toContain('kt-link-current');
});

it('skips a link that already carries the current or no-gradient class', function () {
    $_SERVER['REQUEST_URI'] = '/some-page/';
    $link = home_url('/some-page/');

    $html = kotlinskidev_mark_active_link_state(
        "<a href=\"{$link}\" class=\"kt-hover-no-link-gradient\">Some page</a>",
        ['attrs' => []]
    );

    expect($html)->not->toContain('aria-current');
});

it('disables pointer interaction on the current link when click-blocking is enabled (default)', function () {
    $_SERVER['REQUEST_URI'] = '/some-page/';
    $link = home_url('/some-page/');

    $html = kotlinskidev_mark_active_link_state("<a href=\"{$link}\">Some page</a>", ['attrs' => []]);

    expect($html)->toContain('aria-disabled="true"');
    expect($html)->toContain('tabindex="-1"');
    expect($html)->toContain('pointer-events:none');
});

it('leaves the current link fully clickable when click-blocking is disabled via option', function () {
    add_option('kotlinskidev_active_link_state_block_clicks', false);
    $_SERVER['REQUEST_URI'] = '/some-page/';
    $link = home_url('/some-page/');

    $html = kotlinskidev_mark_active_link_state("<a href=\"{$link}\">Some page</a>", ['attrs' => []]);

    expect($html)->toContain('kt-link-current');
    expect($html)->not->toContain('aria-disabled');
    expect($html)->not->toContain('pointer-events:none');
});

it('does not block clicks on a current mega-panel trigger unless linkNavigatesOnClick is set', function () {
    $_SERVER['REQUEST_URI'] = '/some-page/';
    $link = home_url('/some-page/');

    $html = kotlinskidev_mark_active_link_state(
        "<a href=\"{$link}\" aria-haspopup=\"true\">Some page</a>",
        ['attrs' => []]
    );

    expect($html)->toContain('kt-link-current');
    expect($html)->not->toContain('aria-disabled');
    expect($html)->not->toContain('pointer-events:none');
});
