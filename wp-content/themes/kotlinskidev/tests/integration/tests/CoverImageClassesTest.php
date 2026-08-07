<?php

uses(Tests\Integration\TestCase::class);

it('leaves non-cover-and-image blocks untouched by the lazy loading override', function () {
    $output = '<img loading="lazy">';
    $block = ['blockName' => 'core/paragraph', 'attrs' => []];

    expect(control_block_lazy_loading($output, $block))->toBe($output);
});

it('leaves the output untouched when kotlinskidevSkipLazy is not set', function () {
    $output = '<img loading="lazy" class="wp-image">';
    $block = ['blockName' => 'core/image', 'attrs' => []];

    expect(control_block_lazy_loading($output, $block))->toBe($output);
});

it('forces eager loading and appends the configured skip-lazy class to an image', function () {
    set_theme_mod('kotlinskidev_lazy_loading_class', 'skip-lazy');
    $output = '<img loading="lazy" data-src="photo.jpg" class="wp-image">';
    $block = ['blockName' => 'core/image', 'attrs' => ['kotlinskidevSkipLazy' => true]];

    $result = control_block_lazy_loading($output, $block);

    expect($result)->toContain('loading="eager"');
    expect($result)->toContain('fetchpriority="high"');
    expect($result)->toContain('skip-lazy');
    expect($result)->toContain('no-lazy-loading');
    expect($result)->not->toContain('data-src=');
    expect($result)->not->toContain('loading="lazy"');

    remove_theme_mod('kotlinskidev_lazy_loading_class');
});

it('adds a fresh class attribute to a video with no existing class', function () {
    $output = '<video data-src="clip.mp4"></video>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['kotlinskidevSkipLazy' => true]];

    $result = control_block_lazy_loading($output, $block);

    expect($result)->toContain('fetchpriority="high"');
    expect($result)->toContain('class="skip-lazy no-lazy-loading"');
    expect($result)->not->toContain('data-src=');
});

it('sets the global skip-lazy context flag for a cover block with the attribute enabled', function () {
    set_lazy_loading_context('', ['blockName' => 'core/cover', 'attrs' => ['kotlinskidevSkipLazy' => true]]);

    global $current_block_skip_lazy;
    expect($current_block_skip_lazy)->toBeTrue();
});

it('clears the global skip-lazy context flag for a block without the attribute', function () {
    set_lazy_loading_context('', ['blockName' => 'core/image', 'attrs' => []]);

    global $current_block_skip_lazy;
    expect($current_block_skip_lazy)->toBeFalse();
});

it('forces eager loading via the wp_img_tag_add_loading_attr filter when the skip-lazy context is active', function () {
    global $current_block_skip_lazy, $wp_current_filter;
    $current_block_skip_lazy = true;

    $wp_current_filter[] = 'render_block';
    $result = disable_wp_lazy_loading_for_blocks('lazy', '<img>', 'the_content');
    array_pop($wp_current_filter);

    expect($result)->toBe('eager');

    $current_block_skip_lazy = false;
});

it('leaves the loading value untouched outside of block rendering', function () {
    global $current_block_skip_lazy;
    $current_block_skip_lazy = true;

    $result = disable_wp_lazy_loading_for_blocks('lazy', '<img>', 'the_content');

    expect($result)->toBe('lazy');

    $current_block_skip_lazy = false;
});

it('outputs the lazy-loading override script on wp_footer', function () {
    test()->setExpectedDeprecated('the_block_template_skip_link');

    ob_start();
    do_action('wp_footer');
    $html = ob_get_clean();

    expect($html)->toContain('no-lazy-loading');
    expect($html)->toContain('fetchpriority');
});
