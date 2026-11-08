<?php

uses(Tests\Integration\TestCase::class);

it('delegates to the same popular-pages markup when used inside a navigation panel', function () {
    $post_id = test()->factory()->post->create(['post_title' => 'Nav popular page']);
    update_post_meta($post_id, '_kotlinskidev_page_views', 12);

    $html = render_block(['blockName' => 'kotlinskidev/nav-popular-pages', 'attrs' => ['title' => 'Trending']]);

    expect($html)->toContain('kt-popular-pages__list');
    expect($html)->toContain('Nav popular page');
    expect($html)->toContain('Trending');
});

it('renders nothing when no post has any recorded page views', function () {
    test()->factory()->post->create(['post_title' => 'Unviewed nav post']);

    $html = render_block(['blockName' => 'kotlinskidev/nav-popular-pages', 'attrs' => []]);

    expect($html)->toBe('');
});
