<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_create_viewed_post(string $title, int $views): int
{
    $post_id = test()->factory()->post->create([
        'post_title'  => $title,
        'post_status' => 'publish',
    ]);
    update_post_meta($post_id, '_kotlinskidev_page_views', $views);

    return $post_id;
}

it('renders nothing when no post has any recorded page views', function () {
    test()->factory()->post->create(['post_title' => 'Unviewed post']);

    $html = render_block(['blockName' => 'kotlinskidev/popular-pages', 'attrs' => []]);

    expect($html)->toBe('');
});

it('lists posts ordered by page view count, most viewed first', function () {
    kotlinskidev_create_viewed_post('Low traffic', 3);
    kotlinskidev_create_viewed_post('High traffic', 50);
    kotlinskidev_create_viewed_post('Mid traffic', 10);

    $html = render_block(['blockName' => 'kotlinskidev/popular-pages', 'attrs' => []]);

    $highPos = strpos($html, 'High traffic');
    $midPos  = strpos($html, 'Mid traffic');
    $lowPos  = strpos($html, 'Low traffic');

    expect($highPos)->not->toBeFalse();
    expect($highPos)->toBeLessThan($midPos);
    expect($midPos)->toBeLessThan($lowPos);
    expect($html)->toContain('kt-popular-pages__list');
});

it('limits the list to the configured count', function () {
    kotlinskidev_create_viewed_post('First', 30);
    kotlinskidev_create_viewed_post('Second', 20);
    kotlinskidev_create_viewed_post('Third', 10);

    $html = render_block(['blockName' => 'kotlinskidev/popular-pages', 'attrs' => ['count' => 2]]);

    expect($html)->toContain('First');
    expect($html)->toContain('Second');
    expect($html)->not->toContain('Third');
});

it('renders the configured title with a custom font size', function () {
    kotlinskidev_create_viewed_post('Viewed page', 5);

    $html = render_block([
        'blockName' => 'kotlinskidev/popular-pages',
        'attrs'     => ['title' => 'Trending', 'titleFontSize' => '18px'],
    ]);

    expect($html)->toContain('<p class="kt-popular-pages__title" style="font-size:18px">Trending</p>');
});

it('renders no title markup when the title attribute is empty', function () {
    kotlinskidev_create_viewed_post('Viewed page', 5);

    $html = render_block(['blockName' => 'kotlinskidev/popular-pages', 'attrs' => ['title' => '']]);

    expect($html)->not->toContain('kt-popular-pages__title');
});

it('links each item to its real permalink', function () {
    $post_id = kotlinskidev_create_viewed_post('Linked page', 7);

    $html = render_block(['blockName' => 'kotlinskidev/popular-pages', 'attrs' => []]);

    expect($html)->toContain(esc_url(get_permalink($post_id)));
});
