<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/blog-topic-manager.php';
require_once __DIR__ . '/../../functions/breadcrumbs.php';

beforeEach(function () {
    Functions\when('esc_html')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));
    Functions\when('esc_url')->alias(fn ($u) => $u);
    Functions\when('esc_url_raw')->alias(fn ($u) => $u);
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('wp_json_encode')->alias('json_encode');
    Functions\when('home_url')->alias(fn ($path = '/') => 'https://example.test' . $path);
    $_SERVER['REQUEST_URI'] = '/category/php/';
    Functions\when('get_option')->alias(fn ($key, $default = null) => $key === 'kotlinskidev_breadcrumb_settings' ? [] : $default);
    Functions\when('get_locale')->justReturn('en_US');
    Functions\when('is_front_page')->justReturn(false);
    Functions\when('is_category')->justReturn(false);
    Functions\when('is_tag')->justReturn(false);
    Functions\when('is_single')->justReturn(false);
    Functions\when('is_page')->justReturn(false);
    Functions\when('is_search')->justReturn(false);
    Functions\when('is_home')->justReturn(false);
    Functions\when('is_post_type_archive')->justReturn(false);
});

function breadcrumbSettings(): array
{
    return kotlinskidev_get_breadcrumb_settings('en_US');
}

it('returns only the home and fallback title crumbs when no view matches', function () {
    Functions\when('get_the_title')->justReturn('Custom Template');
    $settings = breadcrumbSettings();

    expect(kotlinskidev_get_breadcrumb_trail())->toBe([
        ['label' => $settings['home_text'], 'url' => 'https://example.test/'],
        ['label' => 'Custom Template', 'url' => null],
    ]);
});

it('builds home, topics, and category crumbs on a category archive', function () {
    Functions\when('is_category')->justReturn(true);
    Functions\when('get_queried_object')->justReturn((object) ['name' => 'PHP']);
    $settings = breadcrumbSettings();

    expect(kotlinskidev_get_breadcrumb_trail())->toBe([
        ['label' => $settings['home_text'], 'url' => 'https://example.test/'],
        ['label' => $settings['topics_text'], 'url' => $settings['topics_url']],
        ['label' => 'PHP', 'url' => null],
    ]);
});

it('builds home and tag crumbs on a tag archive', function () {
    Functions\when('is_tag')->justReturn(true);
    Functions\when('get_queried_object')->justReturn((object) ['name' => 'WordPress']);
    $settings = breadcrumbSettings();

    expect(kotlinskidev_get_breadcrumb_trail())->toBe([
        ['label' => $settings['home_text'], 'url' => 'https://example.test/'],
        ['label' => 'WordPress', 'url' => null],
    ]);
});

it('builds home, topics, category, and post crumbs on a single post', function () {
    Functions\when('is_single')->justReturn(true);
    Functions\when('get_post_type')->justReturn('post');
    Functions\when('get_the_category')->justReturn([(object) ['term_id' => 3, 'name' => 'PHP']]);
    Functions\when('get_category_link')->justReturn('https://example.test/category/php/');
    Functions\when('get_the_title')->justReturn('My Post Title');
    $settings = breadcrumbSettings();

    expect(kotlinskidev_get_breadcrumb_trail())->toBe([
        ['label' => $settings['home_text'], 'url' => 'https://example.test/'],
        ['label' => $settings['topics_text'], 'url' => $settings['topics_url']],
        ['label' => 'PHP', 'url' => 'https://example.test/category/php/'],
        ['label' => 'My Post Title', 'url' => null],
    ]);
});

it('omits the topics/category crumbs on a single post with no category', function () {
    Functions\when('is_single')->justReturn(true);
    Functions\when('get_post_type')->justReturn('post');
    Functions\when('get_the_category')->justReturn([]);
    Functions\when('get_the_title')->justReturn('Uncategorized Post');
    $settings = breadcrumbSettings();

    expect(kotlinskidev_get_breadcrumb_trail())->toBe([
        ['label' => $settings['home_text'], 'url' => 'https://example.test/'],
        ['label' => 'Uncategorized Post', 'url' => null],
    ]);
});

it('does not treat a single view of a non-post post type as a blog post', function () {
    Functions\when('is_single')->justReturn(true);
    Functions\when('get_post_type')->justReturn('product');
    Functions\when('get_the_title')->justReturn('A Product');
    $settings = breadcrumbSettings();

    expect(kotlinskidev_get_breadcrumb_trail())->toBe([
        ['label' => $settings['home_text'], 'url' => 'https://example.test/'],
        ['label' => 'A Product', 'url' => null],
    ]);
});

it('builds an ancestor chain on a nested page', function () {
    Functions\when('is_page')->justReturn(true);
    Functions\when('get_the_ID')->justReturn(42);
    Functions\when('get_post_ancestors')->justReturn([2, 1]);
    Functions\when('get_the_title')->alias(fn ($id = null) => match ($id) {
        1 => 'Grandparent',
        2 => 'Parent',
        default => 'Current Page',
    });
    Functions\when('get_permalink')->alias(fn ($id) => "https://example.test/page-{$id}/");
    $settings = breadcrumbSettings();

    expect(kotlinskidev_get_breadcrumb_trail())->toBe([
        ['label' => $settings['home_text'], 'url' => 'https://example.test/'],
        ['label' => 'Grandparent', 'url' => 'https://example.test/page-1/'],
        ['label' => 'Parent', 'url' => 'https://example.test/page-2/'],
        ['label' => 'Current Page', 'url' => null],
    ]);
});

it('builds a top-level page crumb with no ancestors', function () {
    Functions\when('is_page')->justReturn(true);
    Functions\when('get_the_ID')->justReturn(7);
    Functions\when('get_post_ancestors')->justReturn([]);
    Functions\when('get_the_title')->justReturn('About');
    $settings = breadcrumbSettings();

    expect(kotlinskidev_get_breadcrumb_trail())->toBe([
        ['label' => $settings['home_text'], 'url' => 'https://example.test/'],
        ['label' => 'About', 'url' => null],
    ]);
});

it('builds a search-results crumb', function () {
    Functions\when('is_search')->justReturn(true);
    Functions\when('get_search_query')->justReturn('hello world');
    $settings = breadcrumbSettings();

    expect(kotlinskidev_get_breadcrumb_trail())->toBe([
        ['label' => $settings['home_text'], 'url' => 'https://example.test/'],
        ['label' => 'Search results for "hello world"', 'url' => null],
    ]);
});

it('builds an articles crumb on the posts archive', function () {
    Functions\when('is_home')->justReturn(true);
    $settings = breadcrumbSettings();

    expect(kotlinskidev_get_breadcrumb_trail())->toBe([
        ['label' => $settings['home_text'], 'url' => 'https://example.test/'],
        ['label' => 'Articles', 'url' => null],
    ]);
});

it('builds an articles crumb on a post type archive', function () {
    Functions\when('is_post_type_archive')->justReturn(true);
    $settings = breadcrumbSettings();

    expect(kotlinskidev_get_breadcrumb_trail())->toBe([
        ['label' => $settings['home_text'], 'url' => 'https://example.test/'],
        ['label' => 'Articles', 'url' => null],
    ]);
});

it('renders nothing for a trail with fewer than two items', function () {
    expect(kotlinskidev_render_breadcrumb_trail([
        ['label' => 'Home', 'url' => 'https://example.test/'],
    ]))->toBe('');
});

it('renders linked crumbs and a plain span for the current crumb', function () {
    $html = kotlinskidev_render_breadcrumb_trail([
        ['label' => 'Home', 'url' => 'https://example.test/'],
        ['label' => 'Current', 'url' => null],
    ]);

    expect($html)->toBe(
        '<nav class="kt-breadcrumbs__list">'
        . '<a class="kt-breadcrumbs__item" href="https://example.test/">Home</a>'
        . '<span class="kt-breadcrumbs__separator">→</span>'
        . '<span class="kt-breadcrumbs__current">Current</span>'
        . '</nav>'
    );
});

it('escapes crumb labels when rendering', function () {
    $html = kotlinskidev_render_breadcrumb_trail([
        ['label' => 'Home', 'url' => 'https://example.test/'],
        ['label' => '<script>alert(1)</script>', 'url' => null],
    ]);

    expect($html)->not->toContain('<script>');
    expect($html)->toContain('&lt;script&gt;');
});

it('leaves the yoast crumbs untouched on the front page', function () {
    Functions\when('is_front_page')->justReturn(true);

    $original = [['text' => 'Whatever']];

    expect(kotlinskidev_filter_yoast_breadcrumb_links($original))->toBe($original);
});

it('replaces the yoast crumbs with our own trail, mapping label/url to text/url', function () {
    Functions\when('is_category')->justReturn(true);
    Functions\when('get_queried_object')->justReturn((object) ['name' => 'PHP']);
    $settings = breadcrumbSettings();

    expect(kotlinskidev_filter_yoast_breadcrumb_links([['text' => 'Ignored']]))->toBe([
        ['text' => $settings['home_text'], 'url' => 'https://example.test/'],
        ['text' => $settings['topics_text'], 'url' => $settings['topics_url']],
        ['text' => 'PHP', 'url' => 'https://example.test/category/php/'],
    ]);
});
