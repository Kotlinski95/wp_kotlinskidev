<?php

use Brain\Monkey\Functions;

if (!defined('HOUR_IN_SECONDS')) {
    define('HOUR_IN_SECONDS', 3600);
}
if (!function_exists('add_shortcode')) {
    function add_shortcode(...$args)
    {
        return true;
    }
}

require_once __DIR__ . '/../../functions/blog-topic-manager.php';

beforeEach(function () {
    Functions\when('esc_html')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));
    Functions\when('esc_url')->alias(fn ($u) => $u);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('__')->alias(fn ($t) => $t);
});

it('returns the extended term meta description when present', function () {
    Functions\when('get_term_meta')->justReturn('Custom extended description');

    expect(kotlinskidev_get_category_description(5))->toBe('Custom extended description');
});

it('falls back to the native category description when no extended description is set', function () {
    Functions\when('get_term_meta')->justReturn('');
    Functions\when('get_category')->justReturn((object) ['description' => 'Native description']);

    expect(kotlinskidev_get_category_description(5))->toBe('Native description');
});

it('estimates reading time at 200 words per minute, rounding up', function () {
    Functions\when('get_post_field')->justReturn(implode(' ', array_fill(0, 250, 'word')));

    expect(kotlinskidev_reading_time(1))->toBe('2 min read');
});

it('estimates one minute for very short content', function () {
    Functions\when('get_post_field')->justReturn('a few words only');

    expect(kotlinskidev_reading_time(1))->toBe('1 min read');
});

it('parses "Text|URL" lines into structured links, skipping blank and malformed lines', function () {
    Functions\when('get_term_meta')->justReturn("Home|/\n\nResources|/resources\nno-pipe-here\n  Tutorials  |  /tutorials  ");

    $links = kotlinskidev_get_category_custom_links(5);

    expect($links)->toBe([
        ['text' => 'Home', 'url' => '/'],
        ['text' => 'Resources', 'url' => '/resources'],
        ['text' => 'Tutorials', 'url' => '/tutorials'],
    ]);
});

it('returns an empty array when there are no custom links', function () {
    Functions\when('get_term_meta')->justReturn('');

    expect(kotlinskidev_get_category_custom_links(5))->toBe([]);
});

it('leaves text unchanged when the search query is empty', function () {
    expect(kotlinskidev_highlight_search_terms('Hello world', ''))->toBe('Hello world');
});

it('wraps matched search words longer than 2 characters in a highlight mark', function () {
    $result = kotlinskidev_highlight_search_terms('The quick brown fox', 'quick fox');

    expect($result)->toContain('<mark');
    expect($result)->toContain('>quick<');
    expect($result)->toContain('>fox<');
    expect($result)->toContain('brown');
});

it('does not highlight search words of 2 characters or fewer', function () {
    $result = kotlinskidev_highlight_search_terms('I am ok', 'am');

    expect($result)->not->toContain('<mark');
});

it('escapes html in the source text before highlighting', function () {
    $result = kotlinskidev_highlight_search_terms('<script>alert(1)</script> hello', 'hello');

    expect($result)->not->toContain('<script>');
    expect($result)->toContain('&lt;script&gt;');
});

it('builds a fallback trimmed excerpt when the search term is not found in the content', function () {
    Functions\when('wp_strip_all_tags')->alias('strip_tags');
    Functions\when('strip_shortcodes')->alias(fn ($c) => $c);
    Functions\when('wp_trim_words')->alias(
        fn ($text, $num, $more) => implode(' ', array_slice(explode(' ', $text), 0, $num)) . $more
    );

    $content = implode(' ', array_fill(0, 50, 'lorem'));

    $excerpt = kotlinskidev_get_search_excerpt($content, 'missing-term', 5);

    expect($excerpt)->toBe('lorem lorem lorem lorem lorem...');
});

it('builds a contextual excerpt centered on the matched search term', function () {
    Functions\when('wp_strip_all_tags')->alias('strip_tags');
    Functions\when('strip_shortcodes')->alias(fn ($c) => $c);
    Functions\when('wp_trim_words')->justReturn('unused');

    $content = str_repeat('padding ', 40) . 'the needle is here' . str_repeat(' more', 40);

    $excerpt = kotlinskidev_get_search_excerpt($content, 'needle');

    expect($excerpt)->toContain('<mark');
    expect($excerpt)->toContain('needle');
});

it('shows only the home breadcrumb outside of category or single-post views', function () {
    Functions\when('home_url')->alias(fn ($path = '') => 'https://example.test' . $path);
    Functions\when('is_category')->justReturn(false);
    Functions\when('is_single')->justReturn(false);
    Functions\when('get_locale')->justReturn('en_US');

    ob_start();
    kotlinskidev_blog_breadcrumbs();
    $output = ob_get_clean();

    expect($output)->toBe('');
});

it('renders home, topics, and category breadcrumbs on a category archive', function () {
    Functions\when('home_url')->alias(fn ($path = '') => 'https://example.test' . $path);
    Functions\when('is_category')->justReturn(true);
    Functions\when('get_locale')->justReturn('en_US');
    Functions\when('get_queried_object')->justReturn((object) ['name' => 'PHP']);

    ob_start();
    kotlinskidev_blog_breadcrumbs();
    $output = ob_get_clean();

    expect($output)->toContain('https://example.test/blog-topics/');
    expect($output)->toContain('PHP');
});

it('uses the polish topics url on a category archive under the pl_PL locale', function () {
    Functions\when('home_url')->alias(fn ($path = '') => 'https://example.test' . $path);
    Functions\when('is_category')->justReturn(true);
    Functions\when('get_locale')->justReturn('pl_PL');
    Functions\when('get_queried_object')->justReturn((object) ['name' => 'PHP']);

    ob_start();
    kotlinskidev_blog_breadcrumbs();
    $output = ob_get_clean();

    expect($output)->toContain('https://example.test/tematy-bloga/');
});

it('renders home, topics, category, and post breadcrumbs on a single post', function () {
    Functions\when('home_url')->alias(fn ($path = '') => 'https://example.test' . $path);
    Functions\when('is_category')->justReturn(false);
    Functions\when('is_single')->justReturn(true);
    Functions\when('get_post_type')->justReturn('post');
    Functions\when('get_locale')->justReturn('en_US');
    Functions\when('get_the_category')->justReturn([(object) ['term_id' => 3, 'name' => 'PHP']]);
    Functions\when('get_category_link')->justReturn('https://example.test/category/php/');
    Functions\when('get_the_title')->justReturn('My Post Title');

    ob_start();
    kotlinskidev_blog_breadcrumbs();
    $output = ob_get_clean();

    expect($output)->toContain('My Post Title');
    expect($output)->toContain('category/php');
});

it('adds a post state for the english blog topics page', function () {
    $post = (object) ['post_name' => 'blog-topics'];

    $states = kotlinskidev_display_post_states([], $post);

    expect($states)->toBe(['blog_topics' => 'Blog Topics Page']);
});

it('adds a post state for the polish blog topics page', function () {
    $post = (object) ['post_name' => 'tematy-bloga'];

    $states = kotlinskidev_display_post_states([], $post);

    expect($states)->toBe(['blog_topics_pl' => 'Blog Topics Page (PL)']);
});

it('leaves post states untouched for unrelated pages', function () {
    $post = (object) ['post_name' => 'about-us'];

    expect(kotlinskidev_display_post_states(['existing' => 'X'], $post))->toBe(['existing' => 'X']);
});

it('marks a page using the polish search template', function () {
    Functions\when('get_page_template_slug')->justReturn('search_pl.html');

    $states = kotlinskidev_display_polish_search_states([], (object) ['ID' => 1]);

    expect($states)->toBe(['polish_search' => 'Polish Search Page']);
});

it('leaves post states untouched for pages not using the polish search template', function () {
    Functions\when('get_page_template_slug')->justReturn('page.html');

    expect(kotlinskidev_display_polish_search_states(['existing' => 'X'], (object) ['ID' => 1]))->toBe(['existing' => 'X']);
});

it('returns the url unchanged when not on the polish locale', function () {
    Functions\when('get_locale')->justReturn('en_US');

    $url = kotlinskidev_redirect_to_polish_search('https://example.test/?s=hello');

    expect($url)->toBe('https://example.test/?s=hello');
});

it('returns the url unchanged when the search url has no ?s= query', function () {
    Functions\when('get_locale')->justReturn('pl_PL');

    $url = kotlinskidev_redirect_to_polish_search('https://example.test/blog/');

    expect($url)->toBe('https://example.test/blog/');
});

it('redirects a polish-locale search to the cached polish search page, preserving the term', function () {
    Functions\when('get_locale')->justReturn('pl_PL');
    Functions\when('wp_cache_get')->justReturn(42);
    Functions\when('get_permalink')->justReturn('https://example.test/szukaj/');
    Functions\when('add_query_arg')->alias(
        fn ($key, $value, $url) => $url . '?' . $key . '=' . $value
    );
    Functions\expect('get_pages')->never();

    $url = kotlinskidev_redirect_to_polish_search('/?s=hello');

    expect($url)->toBe('https://example.test/szukaj/?s=hello');
});

it('looks up and caches the polish search page id on a cache miss', function () {
    Functions\when('get_locale')->justReturn('pl_PL');
    Functions\when('wp_cache_get')->justReturn(false);
    Functions\when('get_pages')->justReturn([(object) ['ID' => 7]]);
    Functions\expect('wp_cache_set')->once()->with('kotlinskidev_polish_search_page_id', 7, '', HOUR_IN_SECONDS);
    Functions\when('get_permalink')->justReturn('https://example.test/szukaj/');
    Functions\when('add_query_arg')->alias(fn ($key, $value, $url) => $url . '?' . $key . '=' . $value);

    $url = kotlinskidev_redirect_to_polish_search('/?s=hello');

    expect($url)->toBe('https://example.test/szukaj/?s=hello');
});

it('leaves the url unchanged when no polish search page exists', function () {
    Functions\when('get_locale')->justReturn('pl_PL');
    Functions\when('wp_cache_get')->justReturn(0);

    $url = kotlinskidev_redirect_to_polish_search('https://example.test/?s=hello');

    expect($url)->toBe('https://example.test/?s=hello');
});

it('falls back to defaults and the english topics url when no breadcrumb settings are saved', function () {
    Functions\when('get_option')->justReturn([]);
    Functions\when('home_url')->alias(fn ($path = '') => 'https://example.test' . $path);

    $settings = kotlinskidev_get_breadcrumb_settings('en_US-defaults');

    expect($settings)->toBe([
        'home_text' => 'Home',
        'topics_text' => 'Topics',
        'topics_url' => 'https://example.test/blog-topics/',
    ]);
});

it('uses saved polish breadcrumb settings and normalizes a relative topics url', function () {
    Functions\when('get_option')->justReturn([
        'home_text_pl' => 'Strona główna',
        'topics_text_pl' => 'Tematy',
        'topics_url_pl' => 'moje-tematy',
    ]);
    Functions\when('home_url')->alias(fn ($path = '') => 'https://example.test' . $path);

    $settings = kotlinskidev_get_breadcrumb_settings('pl_PL');

    expect($settings)->toBe([
        'home_text' => 'Strona główna',
        'topics_text' => 'Tematy',
        'topics_url' => 'https://example.test/moje-tematy',
    ]);
});

it('preserves an already-absolute custom topics url', function () {
    Functions\when('get_option')->justReturn(['topics_url_en' => 'https://cdn.example.test/topics']);
    Functions\when('home_url')->alias(fn ($path = '') => 'https://example.test' . $path);

    $settings = kotlinskidev_get_breadcrumb_settings('en_US-absolute');

    expect($settings['topics_url'])->toBe('https://cdn.example.test/topics');
});

it('returns nothing when the category custom column is not one we handle', function () {
    expect(kotlinskidev_category_column_content('existing', 'other_column', 5))->toBe('existing');
});

it('shows the article count for the post_count column', function () {
    Functions\when('get_category')->justReturn((object) ['count' => 12]);

    expect(kotlinskidev_category_column_content('', 'post_count', 5))->toBe('12 articles');
});

it('shows an em-dash for last_updated when the category has no published posts', function () {
    Functions\when('get_posts')->justReturn([]);

    expect(kotlinskidev_category_column_content('', 'last_updated', 5))->toBe('—');
});

it('shows a human time diff for last_updated when the category has a recent post', function () {
    Functions\when('get_posts')->justReturn([(object) ['ID' => 9]]);
    Functions\when('get_the_time')->justReturn(1000);
    Functions\when('current_time')->justReturn(1500);
    Functions\when('human_time_diff')->justReturn('8 minutes');

    expect(kotlinskidev_category_column_content('', 'last_updated', 5))->toBe('8 minutes ago');
});

it('returns an empty array of related posts when the source post has no categories', function () {
    Functions\when('get_the_category')->justReturn([]);

    expect(kotlinskidev_get_related_posts(1))->toBe([]);
});

it('returns an empty array of related posts when no candidates are found in category', function () {
    Functions\when('get_the_category')->justReturn([(object) ['term_id' => 3]]);
    Functions\when('get_posts')->justReturn([]);

    expect(kotlinskidev_get_related_posts(1))->toBe([]);
});

it('fetches up to the requested limit of related posts from the same categories', function () {
    Functions\when('get_the_category')->justReturn([(object) ['term_id' => 3]]);
    Functions\when('get_posts')->alias(function ($args) {
        if (isset($args['fields']) && $args['fields'] === 'ids') {
            return [10, 20, 30, 40];
        }
        return array_map(fn ($id) => (object) ['ID' => $id], $args['post__in']);
    });

    $related = kotlinskidev_get_related_posts(1, 2);

    expect($related)->toHaveCount(2);
});

it('does not suppress language filters when fetching related post candidates, so foreign-language posts are excluded', function () {
    Functions\when('get_the_category')->justReturn([(object) ['term_id' => 3]]);
    $capturedArgs = null;
    Functions\when('get_posts')->alias(function ($args) use (&$capturedArgs) {
        if (isset($args['fields']) && $args['fields'] === 'ids') {
            $capturedArgs = $args;
            return [10];
        }
        return array_map(fn ($id) => (object) ['ID' => $id], $args['post__in']);
    });

    kotlinskidev_get_related_posts(1);

    expect($capturedArgs['suppress_filters'])->toBeFalse();
});
