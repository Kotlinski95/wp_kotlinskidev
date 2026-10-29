<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_create_marquee_modal(string $title = 'Marquee Modal'): int
{
    return test()->factory()->post->create([
        'post_type'   => 'kt_modal',
        'post_status' => 'publish',
        'post_title'  => $title,
    ]);
}

function kotlinskidev_render_marquee_item(array $attrs = [], string $inner = '<!-- wp:paragraph --><p>React</p><!-- /wp:paragraph -->'): string
{
    $blocks = parse_blocks(
        '<!-- wp:kotlinskidev/marquee-item ' . wp_json_encode((object) $attrs) . ' -->'
        . $inner
        . '<!-- /wp:kotlinskidev/marquee-item -->'
    );

    return render_block($blocks[0]);
}

it('renders the inner blocks content inside a swiper-slide wrapper', function () {
    $html = kotlinskidev_render_marquee_item();

    expect($html)->toContain('kt-marquee__item');
    expect($html)->toContain('swiper-slide');
    expect($html)->toContain('>React</p>');
});

it('is not clickable when no modalId is set', function () {
    $html = kotlinskidev_render_marquee_item();

    expect($html)->not->toContain('data-kt-modal-target');
    expect($html)->not->toContain('role="button"');
});

it('adds the modal trigger attributes when a published modalId is set', function () {
    $modal_id = kotlinskidev_create_marquee_modal();

    $html = kotlinskidev_render_marquee_item(['modalId' => $modal_id]);

    expect($html)->toContain('data-kt-modal-target="kt-modal-' . $modal_id . '"');
    expect($html)->toContain('role="button"');
    expect($html)->toContain('tabindex="0"');
});

it('sets an aria-label built from the resolved modal title', function () {
    $modal_id = kotlinskidev_create_marquee_modal('React impact summary');

    $html = kotlinskidev_render_marquee_item(['modalId' => $modal_id]);

    expect($html)->toContain('aria-label="Open React impact summary"');
});

it('leaves the item non-clickable when the modalId does not resolve to a published modal', function () {
    $html = kotlinskidev_render_marquee_item(['modalId' => 999999]);

    expect($html)->not->toContain('data-kt-modal-target');
});

it('registers the modal for footer rendering', function () {
    $modal_id = kotlinskidev_create_marquee_modal('Footer Registered Marquee Modal');

    kotlinskidev_render_marquee_item(['modalId' => $modal_id]);

    ob_start();
    kotlinskidev_render_modal_shells();
    $footer_html = ob_get_clean();

    expect($footer_html)->toContain('id="kt-modal-' . $modal_id . '"');
    expect($footer_html)->toContain('aria-label="Footer Registered Marquee Modal"');
});

it('renders nothing for an item left completely empty', function () {
    $html = kotlinskidev_render_marquee_item([], '');

    expect($html)->toBe('');
});
