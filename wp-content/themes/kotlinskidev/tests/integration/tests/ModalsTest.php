<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_create_test_modal(string $title = ''): int
{
    return test()->factory()->post->create([
        'post_type'   => 'kt_modal',
        'post_status' => 'publish',
        'post_title'  => $title,
    ]);
}

it('preserves the kotlinskidev/button link real href and adds the modal target attribute', function () {
    $modal_id = kotlinskidev_create_test_modal();
    $blocks = parse_blocks(
        '<!-- wp:kotlinskidev/button ' . wp_json_encode([
            'text'         => 'Text',
            'url'          => 'https://example.test',
            'opensInModal' => true,
            'modalId'      => $modal_id,
        ]) . ' /-->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('href="https://example.test"');
    expect($html)->toContain('data-kt-modal-target="kt-modal-' . $modal_id . '"');
});

it('preserves a core/button link real href and adds the modal target attribute', function () {
    $modal_id = kotlinskidev_create_test_modal();
    $blocks = parse_blocks(
        '<!-- wp:button ' . wp_json_encode(['opensInModal' => true, 'modalId' => $modal_id]) . ' -->'
        . '<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://example.test">Text</a></div>'
        . '<!-- /wp:button -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('href="https://example.test"');
    expect($html)->toContain('data-kt-modal-target="kt-modal-' . $modal_id . '"');
});

it('preserves a core/navigation-link real href and adds the modal target attribute', function () {
    $modal_id = kotlinskidev_create_test_modal();
    $blocks = parse_blocks(
        '<!-- wp:navigation-link ' . wp_json_encode(['label' => 'Label', 'url' => 'https://example.test', 'opensInModal' => true, 'modalId' => $modal_id]) . ' /-->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('href="https://example.test"');
    expect($html)->toContain('data-kt-modal-target="kt-modal-' . $modal_id . '"');
});

it('preserves a core/navigation-submenu top-level real href while leaving nested child links untouched', function () {
    $modal_id = kotlinskidev_create_test_modal();
    $blocks = parse_blocks(
        '<!-- wp:navigation-submenu ' . wp_json_encode(['label' => 'Parent', 'url' => 'https://example.test', 'opensInModal' => true, 'modalId' => $modal_id]) . ' -->'
        . '<!-- wp:navigation-link ' . wp_json_encode(['label' => 'Child', 'url' => 'https://child.test']) . ' /-->'
        . '<!-- /wp:navigation-submenu -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('href="https://example.test"');
    expect($html)->toContain('data-kt-modal-target="kt-modal-' . $modal_id . '"');
    expect($html)->toContain('href="https://child.test"');
});

it('falls back to a #kt-modal-{id} href when the trigger has no real destination url', function () {
    $modal_id = kotlinskidev_create_test_modal();
    $blocks = parse_blocks(
        '<!-- wp:kotlinskidev/nav-link ' . wp_json_encode([
            'label'        => 'Label',
            'url'          => '#',
            'opensInModal' => true,
            'modalId'      => $modal_id,
        ]) . ' /-->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('href="#kt-modal-' . $modal_id . '"');
    expect($html)->toContain('data-kt-modal-target="kt-modal-' . $modal_id . '"');
});

it('leaves an unrelated block untouched even with opensInModal/modalId attrs present', function () {
    $modal_id = kotlinskidev_create_test_modal();
    $blocks = parse_blocks(
        '<!-- wp:paragraph ' . wp_json_encode(['opensInModal' => true, 'modalId' => $modal_id]) . ' -->'
        . '<p>Just text</p>'
        . '<!-- /wp:paragraph -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('kt-modal');
});

it('is registered on the render_block filter', function () {
    expect(has_filter('render_block', 'kotlinskidev_apply_modal_trigger'))->not->toBeFalse();
});

it('renders the modal shell with an aria-label matching the modal post title', function () {
    $modal_id = kotlinskidev_create_test_modal('Newsletter Signup');
    $blocks = parse_blocks(
        '<!-- wp:kotlinskidev/button ' . wp_json_encode([
            'text'         => 'Text',
            'url'          => 'https://example.test',
            'opensInModal' => true,
            'modalId'      => $modal_id,
        ]) . ' /-->'
    );
    render_block($blocks[0]);

    ob_start();
    kotlinskidev_render_modal_shells();
    $footer_html = ob_get_clean();

    expect($footer_html)->toContain('id="kt-modal-' . $modal_id . '"');
    expect($footer_html)->toContain('aria-label="Newsletter Signup"');
});
