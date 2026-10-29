<?php

use Brain\Monkey\Functions;

if (!class_exists('WP_Post')) {
    class WP_Post
    {
        public int $ID;
        public string $post_type = 'post';
        public string $post_status = 'publish';
        public string $post_content = '';
        public function __construct(int $id)
        {
            $this->ID = $id;
        }
    }
}

require_once __DIR__ . '/../../functions/modals.php';

function kotlinskidev_modal_post(int $id, string $post_type = 'kt_modal', string $post_status = 'publish'): WP_Post
{
    $post = new WP_Post($id);
    $post->post_type = $post_type;
    $post->post_status = $post_status;
    return $post;
}

it('resolves a published modal by id', function () {
    $post = kotlinskidev_modal_post(9001);
    Functions\when('get_post')->justReturn($post);

    expect(kotlinskidev_resolve_modal_by_id(9001))->toBe($post);
});

it('returns null when no post exists for the given id', function () {
    Functions\when('get_post')->justReturn(null);

    expect(kotlinskidev_resolve_modal_by_id(9002))->toBeNull();
});

it('returns null when the post is not a kt_modal', function () {
    Functions\when('get_post')->justReturn(kotlinskidev_modal_post(9003, 'post'));

    expect(kotlinskidev_resolve_modal_by_id(9003))->toBeNull();
});

it('returns null when the modal is not published', function () {
    Functions\when('get_post')->justReturn(kotlinskidev_modal_post(9004, 'kt_modal', 'draft'));

    expect(kotlinskidev_resolve_modal_by_id(9004))->toBeNull();
});

it('swaps to the polylang-translated post when available', function () {
    $original = kotlinskidev_modal_post(9005);
    $translated = kotlinskidev_modal_post(9006);

    Functions\when('get_post')->alias(fn ($id) => $id === 9005 ? $original : $translated);
    Functions\when('pll_get_post')->justReturn(9006);

    expect(kotlinskidev_resolve_modal_by_id(9005))->toBe($translated);
});

it('leaves the block content unchanged for a block that is not a modal trigger candidate', function () {
    $content = '<a href="https://example.test">Link</a>';

    $result = kotlinskidev_apply_modal_trigger($content, [
        'blockName' => 'core/paragraph',
        'attrs'     => ['opensInModal' => true, 'modalId' => 9007],
    ]);

    expect($result)->toBe($content);
});

it('leaves the block content unchanged when opensInModal is not set', function () {
    $content = '<a href="https://example.test">Link</a>';

    $result = kotlinskidev_apply_modal_trigger($content, [
        'blockName' => 'kotlinskidev/button',
        'attrs'     => ['modalId' => 9008],
    ]);

    expect($result)->toBe($content);
});

it('leaves the block content unchanged when modalId is missing', function () {
    $content = '<a href="https://example.test">Link</a>';

    $result = kotlinskidev_apply_modal_trigger($content, [
        'blockName' => 'kotlinskidev/nav-link',
        'attrs'     => ['opensInModal' => true],
    ]);

    expect($result)->toBe($content);
});

it('leaves the block content unchanged when the referenced modal does not resolve', function () {
    Functions\when('get_post')->justReturn(null);
    $content = '<a href="https://example.test">Link</a>';

    $result = kotlinskidev_apply_modal_trigger($content, [
        'blockName' => 'kotlinskidev/button',
        'attrs'     => ['opensInModal' => true, 'modalId' => 9009],
    ]);

    expect($result)->toBe($content);
});

it('leaves the block content unchanged for core/button when opensInModal is not set', function () {
    $content = '<div class="wp-block-button"><a class="wp-block-button__link" href="https://example.test">Text</a></div>';

    $result = kotlinskidev_apply_modal_trigger($content, [
        'blockName' => 'core/button',
        'attrs'     => ['modalId' => 9013],
    ]);

    expect($result)->toBe($content);
});

it('leaves the block content unchanged for core/navigation-link and core/navigation-submenu when opensInModal is not set', function () {
    $content = '<a href="https://example.test">Label</a>';

    foreach (['core/navigation-link', 'core/navigation-submenu'] as $blockName) {
        $result = kotlinskidev_apply_modal_trigger($content, [
            'blockName' => $blockName,
            'attrs'     => ['modalId' => 9014],
        ]);

        expect($result)->toBe($content);
    }
});

it('deduplicates repeated registrations of the same modal id for the footer', function () {
    kotlinskidev_register_modal_for_footer(9010);
    kotlinskidev_register_modal_for_footer(9010);

    $counts = array_count_values(kotlinskidev_get_modals_for_footer());

    expect($counts[9010])->toBe(1);
});

it('accumulates distinct modal ids registered for the footer', function () {
    kotlinskidev_register_modal_for_footer(9011);
    kotlinskidev_register_modal_for_footer(9012);

    $ids = kotlinskidev_get_modals_for_footer();

    expect($ids)->toContain(9011);
    expect($ids)->toContain(9012);
});
