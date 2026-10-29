<?php

uses(Tests\Integration\TestCase::class);

it('renders the scroll-to-top button with its trigger id and progress ring', function () {
    $html = do_shortcode('[scroll_to_top]');

    expect($html)->toContain('id="scroll-to-top"');
    expect($html)->toContain('class="progress-ring"');
    expect($html)->toContain('progress-ring__progress');
});

it('exposes an accessible label for the scroll-to-top control', function () {
    $html = do_shortcode('[scroll_to_top]');

    expect($html)->toContain('aria-label="Scroll to Top"');
});

it('renders the fixed-arrow variant by default when inserted as a block', function () {
    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/scroll-to-top /-->')[0]);

    expect($html)->toContain('id="scroll-to-top"');
    expect($html)->toContain('class="progress-ring"');
});

it('renders the full-width bar variant without the fixed-arrow markup when selected', function () {
    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/scroll-to-top {"variant":"bar"} /-->')[0]);

    expect($html)->toContain('kt-scroll-to-top__trigger');
    expect($html)->not->toContain('id="scroll-to-top"');
    expect($html)->not->toContain('progress-ring');
});

function kotlinskidev_seed_scroll_to_top_arrow_attachment(): int
{
    $id = test()->factory()->attachment->create_object('arrow.svg', 0, ['post_mime_type' => 'image/svg+xml']);
    set_transient('kotlinskidev_svg_' . $id, '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>', WEEK_IN_SECONDS);

    return $id;
}

it('renders the arrow after the label on a real bar-variant render when showArrow and an icon are set', function () {
    $icon_id = kotlinskidev_seed_scroll_to_top_arrow_attachment();
    $html = render_block(parse_blocks(
        '<!-- wp:kotlinskidev/scroll-to-top ' . wp_json_encode([
            'variant' => 'bar',
            'showArrow' => true,
            'arrowIconId' => $icon_id,
            'arrowSize' => 20,
        ]) . ' /-->'
    )[0]);

    expect($html)->toContain('kt-scroll-to-top__arrow');
    expect($html)->toContain('--kt-icon-size:20px');
    expect(strpos($html, 'kt-scroll-to-top__arrow'))->toBeGreaterThan(strpos($html, 'Scroll to Top'));
});

it('omits the arrow on a real bar-variant render when showArrow is false', function () {
    $icon_id = kotlinskidev_seed_scroll_to_top_arrow_attachment();
    $html = render_block(parse_blocks(
        '<!-- wp:kotlinskidev/scroll-to-top ' . wp_json_encode([
            'variant' => 'bar',
            'showArrow' => false,
            'arrowIconId' => $icon_id,
        ]) . ' /-->'
    )[0]);

    expect($html)->not->toContain('kt-scroll-to-top__arrow');
});

it('never renders the arrow on the fixed variant even when showArrow and an icon are set', function () {
    $icon_id = kotlinskidev_seed_scroll_to_top_arrow_attachment();
    $html = render_block(parse_blocks(
        '<!-- wp:kotlinskidev/scroll-to-top ' . wp_json_encode([
            'variant' => 'fixed',
            'showArrow' => true,
            'arrowIconId' => $icon_id,
        ]) . ' /-->'
    )[0]);

    expect($html)->not->toContain('kt-scroll-to-top__arrow');
});
