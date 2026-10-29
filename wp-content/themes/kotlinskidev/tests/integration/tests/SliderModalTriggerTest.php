<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_create_slide_modal(string $title = 'Slide Modal'): int
{
    return test()->factory()->post->create([
        'post_type'   => 'kt_modal',
        'post_status' => 'publish',
        'post_title'  => $title,
    ]);
}

function kotlinskidev_render_cover_slide(array $attrs, string $inner_html = '<p>Test</p>'): string
{
    $blocks = parse_blocks(
        '<!-- wp:cover ' . wp_json_encode($attrs) . ' -->'
        . '<div class="wp-block-cover ' . ($attrs['className'] ?? '') . '">'
        . '<span aria-hidden="true" class="wp-block-cover__background"></span>'
        . '<div class="wp-block-cover__inner-container">' . $inner_html . '</div>'
        . '</div>'
        . '<!-- /wp:cover -->'
    );

    return render_block($blocks[0]);
}

it('adds the modal trigger attributes to a swiper-slide cover with a modalId', function () {
    $modal_id = kotlinskidev_create_slide_modal();

    $html = kotlinskidev_render_cover_slide([
        'className' => 'swiper-slide',
        'modalId'   => $modal_id,
    ]);

    expect($html)->toContain('data-kt-modal-target="kt-modal-' . $modal_id . '"');
    expect($html)->toContain('role="button"');
    expect($html)->toContain('tabindex="0"');
});

it('leaves a swiper-slide cover untouched when no modalId is set', function () {
    $html = kotlinskidev_render_cover_slide(['className' => 'swiper-slide']);

    expect($html)->not->toContain('data-kt-modal-target');
    expect($html)->not->toContain('role="button"');
});

it('leaves a cover block untouched when it is not a swiper-slide, even with a modalId', function () {
    $modal_id = kotlinskidev_create_slide_modal();

    $html = kotlinskidev_render_cover_slide([
        'className' => 'is-style-default',
        'modalId'   => $modal_id,
    ]);

    expect($html)->not->toContain('data-kt-modal-target');
});

it('leaves a swiper-slide cover untouched when the modalId does not resolve to a published modal', function () {
    $html = kotlinskidev_render_cover_slide([
        'className' => 'swiper-slide',
        'modalId'   => 999999,
    ]);

    expect($html)->not->toContain('data-kt-modal-target');
});

it('sets an aria-label built from the resolved modal title', function () {
    $modal_id = kotlinskidev_create_slide_modal('Project Case Study');

    $html = kotlinskidev_render_cover_slide([
        'className' => 'swiper-slide',
        'modalId'   => $modal_id,
    ]);

    expect($html)->toContain('aria-label="Open Project Case Study"');
});

it('registers the modal for footer rendering', function () {
    $modal_id = kotlinskidev_create_slide_modal('Footer Registered Slide Modal');

    kotlinskidev_render_cover_slide([
        'className' => 'swiper-slide',
        'modalId'   => $modal_id,
    ]);

    ob_start();
    kotlinskidev_render_modal_shells();
    $footer_html = ob_get_clean();

    expect($footer_html)->toContain('id="kt-modal-' . $modal_id . '"');
    expect($footer_html)->toContain('aria-label="Footer Registered Slide Modal"');
});

it('is registered on the render_block_core/cover filter', function () {
    expect(has_filter('render_block_core/cover', 'kotlinskidev_apply_slider_slide_modal_trigger'))
        ->not->toBeFalse();
});
