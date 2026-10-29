<?php

uses(Tests\Integration\TestCase::class);

it('returns the default critical css fragment registry', function () {
    $registry = kotlinskidev_get_critical_css_fragments();

    expect($registry)->toHaveKey('kotlinskidev/certificate');
    expect($registry['kotlinskidev/certificate'])->toBe('critical-certificate.css');
});

it('is filterable through the real WordPress hook system', function () {
    add_filter('kotlinskidev_critical_css_fragments', function (array $registry) {
        $registry['kotlinskidev/test-block'] = 'critical-test-block.css';

        return $registry;
    });

    $registry = kotlinskidev_get_critical_css_fragments();

    expect($registry)->toHaveKey('kotlinskidev/test-block');

    remove_all_filters('kotlinskidev_critical_css_fragments');
});

it('activates the certificate critical css fragment only on a page that actually contains the block', function () {
    $with_block = test()->factory()->post->create([
        'post_type' => 'page',
        'post_content' => '<!-- wp:kotlinskidev/certificate {"certificateId":1} /-->',
    ]);
    test()->go_to(get_permalink($with_block));

    expect(kotlinskidev_get_active_critical_css_fragments())->toBe(['critical-certificate.css']);
});

it('activates no critical css fragments on a page without the block', function () {
    $without_block = test()->factory()->post->create([
        'post_type' => 'page',
        'post_content' => '<!-- wp:paragraph --><p>Hello</p><!-- /wp:paragraph -->',
    ]);
    test()->go_to(get_permalink($without_block));

    expect(kotlinskidev_get_active_critical_css_fragments())->toBe([]);
});

it('activates the search critical css fragment on the search results page, driven by templates/search.html rather than any post content', function () {
    test()->go_to(home_url('/?s=test'));

    expect(kotlinskidev_get_active_critical_css_fragments())->toBe(['critical-search.css']);
});

it('returns no active fragments on a non-singular, non-search context', function () {
    test()->go_to(home_url('/'));

    expect(kotlinskidev_get_active_critical_css_fragments())->toBe([]);
});
