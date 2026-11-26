<?php

uses(Tests\Integration\TestCase::class);

function kt_search_normalized(string $html): string
{
    return preg_replace(['/wp-container-[a-z0-9-]+/', '/wp-elements-\d+/', '/\s+/'], ['wp-container-X', 'wp-elements-X', ' '], trim($html));
}

it('hooks the search page redirect on template_redirect at default priority', function () {
    expect(has_action('template_redirect', 'kotlinskidev_redirect_search_page_query'))->toBe(10);
});

it('builds style vars only from non-empty color attributes', function () {
    expect(kotlinskidev_build_search_results_style_vars([]))->toBe('');
    expect(kotlinskidev_build_search_results_style_vars([
        'cardTextColor' => ' #111 ',
        'buttonBackgroundColor' => '#222',
        'cardBorderColor' => '',
        'blurAmount' => '4px',
    ]))->toBe('--kt-search-results-grid-card-text-color:#111;--kt-search-results-grid-button-bg:#222;');
    expect(kotlinskidev_build_search_results_style_vars([
        'cardHoverBackgroundColor' => '#333',
        'blurOtherCards' => true,
        'blurAmount' => '4px',
    ]))->toBe('--kt-search-results-grid-card-hover-bg:#333;--kt-blur-amount:4px;');
});

it('resolves the search form action url from the request path language prefix', function () {
    $original = $_SERVER['REQUEST_URI'] ?? null;

    $_SERVER['REQUEST_URI'] = '/en/some/page/';
    expect(kotlinskidev_search_action_url_for_current_language())->toBe(home_url('/en/'));

    $_SERVER['REQUEST_URI'] = '/pt_br/page/';
    expect(kotlinskidev_search_action_url_for_current_language())->toBe(home_url('/pt_br/'));

    $_SERVER['REQUEST_URI'] = '/some/page/';
    expect(kotlinskidev_search_action_url_for_current_language())->toBe(home_url('/'));

    if (null === $original) {
        unset($_SERVER['REQUEST_URI']);
    } else {
        $_SERVER['REQUEST_URI'] = $original;
    }
});

it('renders the recently viewed shell with and without blur siblings', function () {
    $plain = kotlinskidev_render_recently_viewed_shell();
    $blurred = kotlinskidev_render_recently_viewed_shell(true);

    expect($plain)->toContain('id="kt-recently-viewed"');
    expect($plain)->toContain('Recently Viewed');
    expect($plain)->not->toContain('has-blur-siblings');
    expect($blurred)->toContain('kt-post-card-grid has-blur-siblings');
    expect(md5(kt_search_normalized($plain)))->toBe('fdf9d544f571065a6a66e08d98101abb');
    expect(md5(kt_search_normalized($blurred)))->toBe('a5f9017b108757033ed2f0b198748354');
});

it('renders a fixed search header for an empty and a present query', function () {
    test()->go_to('/?s=');
    $empty = kotlinskidev_render_search_header_fresh_per_language();
    test()->go_to('/?s=hello');
    $present = kotlinskidev_render_search_header_fresh_per_language();

    expect(md5(kt_search_normalized($empty)))->toBe('8e9b6e96045cfab81540dde8aee65194');
    expect(md5(kt_search_normalized($present)))->toBe('51bde8bb3c5ea28ef054d395aa330b78');
});

it('renders a fixed search form for default and overridden colors', function () {
    $_SERVER['REQUEST_URI'] = '/en/';
    test()->go_to('/?s=hello');
    $_GET['search_type'] = 'post';
    $_GET['search_category'] = 'uncategorized';
    $default = kotlinskidev_render_search_form_fresh_per_language();
    $colored = kotlinskidev_render_search_form_fresh_per_language('#010203', '#040506', '#070809');
    unset($_GET['search_type'], $_GET['search_category'], $_SERVER['REQUEST_URI']);

    expect($colored)->toContain('background-color:#010203;');
    expect($colored)->toContain('border-color:#040506');
    expect($colored)->toContain('color:#070809');
    expect(md5(kt_search_normalized($default)))->toBe('4f42afeb82c18260eda84b6090fd0169');
    expect(md5(kt_search_normalized($colored)))->toBe('edf8034c477fe27cd90c9aa304c1226a');
});

it('renders the no results state with the active filter note', function () {
    test()->go_to('/?s=zzznothingzzz');
    $_GET['search_type'] = 'post';
    $html = kotlinskidev_render_search_results_fresh_per_language();
    unset($_GET['search_type']);

    expect(md5(kt_search_normalized($html)))->toBe('15173dcdf7d354356bfabc3ecbbf0caa');
});

it('forwards hover and blur attributes to the popular content fallback on an empty query', function () {
    test()->go_to('/?s=');

    $html = kotlinskidev_render_search_results_fresh_per_language(true, '#abc', '6px');

    expect($html)->toContain('Popular Content');
});

it('renders search results with cards, badges, tags and pagination from fixed posts', function () {
    $category_id = self::factory()->category->create(['name' => 'Zebra Topic', 'slug' => 'zebra-topic']);
    self::factory()->post->create_many(12, [
        'post_title' => 'Okapi Finding Post',
        'post_content' => 'Some okapi content here for the excerpt.',
        'post_status' => 'publish',
        'post_date' => '2020-01-02 03:04:05',
        'post_category' => [$category_id],
    ]);
    test()->go_to('/?s=Okapi');

    $html = kotlinskidev_render_search_results_fresh_per_language(true);

    expect($html)->toContain('Found 12 results');
    expect($html)->toContain('Page 1 of 2');
    expect($html)->toContain('has-blur-siblings');
    expect($html)->toContain('Zebra Topic');
    expect($html)->toContain('search-results-pagination');
    expect($html)->toContain('page-numbers current');
    expect(substr_count($html, 'kt-search-results-grid__card"'))->toBe(10);
    $stable = preg_replace('/(href|src)="[^"]*"/', '$1=""', $html);
    expect(md5(kt_search_normalized($stable)))->toBe('de3de546f29fb93193a1f922ffa66c5e');
});
