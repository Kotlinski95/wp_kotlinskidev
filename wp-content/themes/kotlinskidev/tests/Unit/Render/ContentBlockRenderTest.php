<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/polylang-content-resolution.php';

function kotlinskidev_content_block_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-block/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-content-block"');
});

it('renders nothing when there is no content slug', function () {
    expect(kotlinskidev_content_block_render(['contentSlug' => '']))->toBe('');
});

it('renders nothing when the slug does not resolve to a post', function () {
    Functions\when('get_page_by_path')->justReturn(null);

    expect(kotlinskidev_content_block_render(['contentSlug' => 'render-content-missing']))->toBe('');
});

it('renders the resolved reusable block content, run through do_blocks', function () {
    $post = new WP_Post(101);
    $post->post_content = '<!-- wp:paragraph --><p>Reused content</p><!-- /wp:paragraph -->';
    Functions\when('get_page_by_path')->justReturn($post);
    Functions\when('do_blocks')->alias(fn ($content) => '[rendered]' . $content . '[/rendered]');

    $html = kotlinskidev_content_block_render(['contentSlug' => 'render-content-found']);

    expect($html)->toBe(
        '<div class="wp-block-kotlinskidev-content-block">[rendered]<!-- wp:paragraph --><p>Reused content</p><!-- /wp:paragraph -->[/rendered]</div>'
    );
});
