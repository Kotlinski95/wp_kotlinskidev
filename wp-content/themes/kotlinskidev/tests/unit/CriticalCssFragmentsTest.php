<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/critical-css-fragments.php';
require_once __DIR__ . '/../../functions/deferred-block-assets.php';
require_once __DIR__ . '/../../functions/block-styles.php';

beforeEach(function () {
    Functions\when('apply_filters')->alias(fn ($tag, $default) => $default);
    Functions\when('is_search')->justReturn(false);
    Functions\when('is_page')->justReturn(false);
    Functions\when('is_404')->justReturn(false);
    Functions\when('is_home')->justReturn(false);
    Functions\when('is_archive')->justReturn(false);
    Functions\when('is_singular')->justReturn(true);
    Functions\when('get_queried_object')->justReturn(Mockery::mock('WP_Post'));
});

function kotlinskidev_stub_hero_on_page(bool $has_hero, string $css = '.hero{}'): void
{
    Functions\when('has_block')->alias(fn ($name) => $has_hero && 'kotlinskidev/hero-carousel' === $name);
    Functions\when('kotlinskidev_read_cached_critical_css')->justReturn($css);
}

it('maps the hero-carousel block to its style fragment', function () {
    expect(kotlinskidev_get_critical_css_fragments())->toHaveKey('kotlinskidev/hero-carousel', 'style-hero-carousel.css');
});

it('activates the hero fragment on a singular page that contains the block', function () {
    kotlinskidev_stub_hero_on_page(true);

    expect(kotlinskidev_get_active_critical_css_fragments())->toContain('style-hero-carousel.css');
});

it('drops the hero style link when the fragment is inlined', function () {
    kotlinskidev_stub_hero_on_page(true);

    expect(kotlinskidev_filter_inlined_and_deferred_styles('<link rel="stylesheet">', 'kotlinskidev-hero-carousel-style'))->toBe('');
});

it('keeps the hero style link when the page has no hero block', function () {
    kotlinskidev_stub_hero_on_page(false);
    $link = '<link rel="stylesheet">';

    expect(kotlinskidev_filter_inlined_and_deferred_styles($link, 'kotlinskidev-hero-carousel-style'))->toBe($link);
});

it('keeps the hero style link when the fragment file is empty', function () {
    kotlinskidev_stub_hero_on_page(true, '');
    $link = '<link rel="stylesheet">';

    expect(kotlinskidev_filter_inlined_and_deferred_styles($link, 'kotlinskidev-hero-carousel-style'))->toBe($link);
});

it('defers the hero view style with media print and an onload swap', function () {
    $html = kotlinskidev_filter_inlined_and_deferred_styles("<link rel='stylesheet' media='all' href='x.css'>", 'kotlinskidev-hero-carousel-view-style');

    expect($html)->toContain("media='print'");
    expect($html)->toContain("onload=\"this.media='all'\"");
    expect($html)->toContain('data-no-defer="1"');
});

it('does not re-defer a tag that already has an onload handler', function () {
    $link = "<link media='print' onload=\"this.media='all'\">";

    expect(kotlinskidev_filter_inlined_and_deferred_styles($link, 'kotlinskidev-hero-carousel-view-style'))->toBe($link);
});

it('leaves unrelated handles untouched', function () {
    $link = '<link rel="stylesheet">';

    expect(kotlinskidev_filter_inlined_and_deferred_styles($link, 'something-else'))->toBe($link);
});

it('maps core/cover to the wp-block-cover handle', function () {
    expect(kotlinskidev_get_inlined_core_block_styles())->toHaveKey('core/cover', 'wp-block-cover');
});

it('leaves the cover link alone when core/cover is not above the fold', function () {
    $link = '<link rel="stylesheet">';

    expect(kotlinskidev_filter_inlined_and_deferred_styles($link, 'wp-block-cover'))->toBe($link);
});

it('returns an empty string for an unregistered style handle', function () {
    Functions\when('wp_styles')->justReturn((object) ['registered' => []]);

    expect(kotlinskidev_read_registered_style_css('missing'))->toBe('');
});
