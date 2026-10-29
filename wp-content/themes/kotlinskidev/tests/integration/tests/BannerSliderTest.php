<?php

uses(Tests\Integration\TestCase::class);

beforeEach(function () {
    $GLOBALS['wp_scripts'] = null;
    $GLOBALS['wp_styles']  = null;
});

it('enqueues swiper and banner-carousel assets only when the block is present on the page', function () {
    $with_block = test()->factory()->post->create([
        'post_content' => '<!-- wp:kotlinskidev/banner-carousel --><div>slides</div><!-- /wp:kotlinskidev/banner-carousel -->',
    ]);
    test()->go_to(get_permalink($with_block));

    do_action('wp_enqueue_scripts');

    expect(wp_script_is('swiper-js', 'enqueued'))->toBeTrue();
    expect(wp_script_is('banner-carousel-init', 'enqueued'))->toBeTrue();
    expect(wp_script_is('kotlinskidev-banner-carousel', 'enqueued'))->toBeTrue();
    expect(wp_style_is('swiper-css', 'enqueued'))->toBeTrue();
});

it('does not enqueue banner-carousel assets on a page without the block', function () {
    $without_block = test()->factory()->post->create(['post_content' => '<p>No carousel here.</p>']);
    test()->go_to(get_permalink($without_block));

    do_action('wp_enqueue_scripts');

    expect(wp_script_is('swiper-js', 'enqueued'))->toBeFalse();
    expect(wp_script_is('kotlinskidev-banner-carousel', 'enqueued'))->toBeFalse();
});

it('enqueues the editor assets for the banner carousel block', function () {
    do_action('enqueue_block_editor_assets');

    expect(wp_script_is('kotlinskidev-banner-carousel-editor', 'enqueued'))->toBeTrue();
    expect(wp_style_is('kotlinskidev-banner-carousel-editor-style', 'enqueued'))->toBeTrue();
});

it('defers the swiper and banner-carousel script tags', function () {
    foreach (['swiper-js', 'banner-carousel-init', 'kotlinskidev-banner-carousel'] as $handle) {
        $tag = apply_filters('script_loader_tag', '<script src="x.js"></script>', $handle);
        expect($tag)->toContain(' defer src');
    }
});

it('leaves an unrelated script tag untouched by the banner-carousel defer filter', function () {
    $tag = apply_filters('script_loader_tag', '<script src="x.js"></script>', 'some-other-handle');

    expect($tag)->toBe('<script src="x.js"></script>');
});

it('injects the configured settings as a data attribute on the banner-carousel block', function () {
    $blocks = parse_blocks(
        '<!-- wp:kotlinskidev/banner-carousel {"showPagination":false,"slidesPerView":3,"enableLoopMode":true} -->'
        . '<div>slides</div>'
        . '<!-- /wp:kotlinskidev/banner-carousel -->'
    );

    $html = render_block($blocks[0]);

    preg_match('/data-banner-carousel-settings="([^"]+)"/', $html, $matches);
    $settings = json_decode(htmlspecialchars_decode($matches[1]), true);

    expect($settings['showPagination'])->toBeFalse();
    expect($settings['slidesPerView'])->toBe(3);
    expect($settings['enableLoopMode'])->toBeTrue();
    expect($settings['showArrows'])->toBeTrue();
});

it('leaves non-banner-carousel block content untouched by the render_block filter', function () {
    $blocks = parse_blocks('<!-- wp:paragraph --><p>content</p><!-- /wp:paragraph -->');

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('data-banner-carousel-settings');
});
