<?php

uses(Tests\Integration\TestCase::class);

it('registers all four search-page dynamic blocks used by templates/search.html', function () {
    $registry = WP_Block_Type_Registry::get_instance();

    foreach ([
        'kotlinskidev/search-header-dynamic',
        'kotlinskidev/search-form-dynamic',
        'kotlinskidev/search-results-dynamic',
        'kotlinskidev/popular-content-dynamic',
    ] as $block_name) {
        expect($registry->is_registered($block_name))->toBeTrue();
    }
});

it('never references the retired static search patterns from templates/search.html again', function () {
    $content = file_get_contents(get_template_directory() . '/templates/search.html');

    expect($content)->not->toContain('wp:pattern {"slug":"kotlinskidev/search-header"}');
    expect($content)->not->toContain('wp:pattern {"slug":"kotlinskidev/search-form"}');
    expect($content)->not->toContain('wp:pattern {"slug":"kotlinskidev/search-results"}');
    expect($content)->toContain('wp:kotlinskidev/search-header-dynamic');
    expect($content)->toContain('wp:kotlinskidev/search-form-dynamic');
    expect($content)->toContain('wp:kotlinskidev/search-results-dynamic');
});

it('shows the "Search Results" heading through the search-header dynamic block when a query is present', function () {
    test()->go_to('/?s=hello');

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/search-header-dynamic /-->')[0]);

    expect($html)->toContain('Search Results');
    expect($html)->not->toContain('Search Our Content');
});

it('shows the "Search Our Content" heading through the search-header dynamic block when no query is present', function () {
    test()->go_to('/?s=');

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/search-header-dynamic /-->')[0]);

    expect($html)->toContain('Search Our Content');
    expect($html)->not->toContain('Search Results');
});

it('pre-fills the current search term through the search-form dynamic block', function () {
    test()->go_to('/?s=hello+world');

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/search-form-dynamic /-->')[0]);

    expect($html)->toContain('value="hello world"');
});

it('scopes the search-form dynamic block\'s category dropdown to the current Polylang language', function () {
    test()->go_to('/?s=hello');

    $captured_args = null;
    $capture = function ($args, $taxonomies) use (&$captured_args) {
        if (in_array('category', (array) $taxonomies, true) && ($args['orderby'] ?? null) === 'count') {
            $captured_args = $args;
        }
        return $args;
    };
    add_filter('get_terms_args', $capture, 10, 2);

    render_block(parse_blocks('<!-- wp:kotlinskidev/search-form-dynamic /-->')[0]);

    remove_filter('get_terms_args', $capture, 10);

    expect($captured_args)->not->toBeNull();
    expect(array_key_exists('lang', $captured_args))->toBeTrue();
});

it('finds only posts matching the real search term through the search-results dynamic block', function () {
    self::factory()->post->create(['post_title' => 'Unique Findable Elephant Article', 'post_status' => 'publish']);
    self::factory()->post->create(['post_title' => 'Completely Unrelated Post', 'post_status' => 'publish']);
    test()->go_to('/?s=Elephant');

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/search-results-dynamic /-->')[0]);

    expect($html)->toContain('Unique Findable');
    expect($html)->toContain('Elephant');
    expect($html)->not->toContain('Completely Unrelated Post');
});

it('shows a "No results found" message through the search-results dynamic block for a real non-matching term', function () {
    test()->go_to('/?s=zzznonexistentsearchtermzzz');

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/search-results-dynamic /-->')[0]);

    expect($html)->toContain('No results found');
});

it('scopes the search-results dynamic block\'s query to the current Polylang language', function () {
    self::factory()->post->create(['post_title' => 'Findable Giraffe Post', 'post_status' => 'publish']);
    test()->go_to('/?s=Giraffe');

    $captured = null;
    $capture = function ($query) use (&$captured) {
        if ($query->get('s') === 'Giraffe') {
            $captured = $query;
        }
    };
    add_action('pre_get_posts', $capture);

    render_block(parse_blocks('<!-- wp:kotlinskidev/search-results-dynamic /-->')[0]);

    remove_action('pre_get_posts', $capture);

    expect($captured)->not->toBeNull();
    expect(array_key_exists('lang', $captured->query_vars))->toBeTrue();
});

it('embeds the popular-content dynamic block when no search query is present', function () {
    self::factory()->post->create(['post_title' => 'A Popular Post', 'post_status' => 'publish']);
    test()->go_to('/?s=');

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/search-results-dynamic /-->')[0]);

    expect($html)->toContain('Popular Content');
    expect($html)->toContain('A Popular Post');
});

it('scopes the popular-content dynamic block\'s query to the current Polylang language', function () {
    self::factory()->post->create(['post_status' => 'publish']);
    test()->go_to('/?s=');

    $captured = null;
    $capture = function ($query) use (&$captured) {
        if (!$query->is_main_query()) {
            $captured = $query;
        }
    };
    add_action('pre_get_posts', $capture);

    render_block(parse_blocks('<!-- wp:kotlinskidev/popular-content-dynamic /-->')[0]);

    remove_action('pre_get_posts', $capture);

    expect($captured)->not->toBeNull();
    expect(array_key_exists('lang', $captured->query_vars))->toBeTrue();
});
