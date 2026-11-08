<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_image_render(array $attrs): string
{
    $blocks = parse_blocks(
        '<!-- wp:image ' . wp_json_encode($attrs) . ' -->'
        . '<figure class="wp-block-image"><img src="https://example.com/logo.svg" alt=""/></figure>'
        . '<!-- /wp:image -->'
    );

    return render_block($blocks[0]);
}

function kotlinskidev_paragraph_render(array $attrs): string
{
    $blocks = parse_blocks(
        '<!-- wp:paragraph ' . wp_json_encode($attrs) . ' -->'
        . '<p>content</p>'
        . '<!-- /wp:paragraph -->'
    );

    return render_block($blocks[0]);
}

it('leaves a supported block untouched when there is no customCssVars attribute', function () {
    $html = kotlinskidev_image_render([]);

    expect($html)->not->toContain('--logo-icon-bg');
});

it('injects sanitized custom css variables as inline style on a supported block', function () {
    $html = kotlinskidev_image_render([
        'customCssVars' => [
            ['name' => '--logo-icon-bg', 'value' => '#1c1d18'],
            ['name' => '--logo-icon-mark', 'value' => '#00f6ff'],
        ],
    ]);

    expect($html)->toContain('--logo-icon-bg:#1c1d18');
    expect($html)->toContain('--logo-icon-mark:#00f6ff');
});

it('does not apply customCssVars to a block that is not in the supported list, even with the attribute manually present', function () {
    $html = kotlinskidev_paragraph_render([
        'customCssVars' => [
            ['name' => '--logo-icon-bg', 'value' => '#1c1d18'],
        ],
    ]);

    expect($html)->not->toContain('--logo-icon-bg');
});

it('drops an entry that fails sanitization while keeping a valid sibling entry', function () {
    $html = kotlinskidev_image_render([
        'customCssVars' => [
            ['name' => '--logo-icon-bg', 'value' => 'url(javascript:alert(1))'],
            ['name' => '--logo-icon-mark', 'value' => '#00f6ff'],
        ],
    ]);

    expect($html)->not->toContain('url(');
    expect($html)->toContain('--logo-icon-mark:#00f6ff');
});

it('applies customCssVars to core/site-logo, cascading onto its auto-inlined SVG through the existing home-link wrapper', function () {
    $svg_path = __DIR__ . '/../fixtures/sample-logo.svg';
    $attachment_id = wp_insert_attachment(
        [
            'post_mime_type' => 'image/svg+xml',
            'post_title' => 'Sample Logo',
            'post_status' => 'inherit',
        ],
        $svg_path
    );
    update_attached_file($attachment_id, $svg_path);
    set_theme_mod('custom_logo', $attachment_id);

    $blocks = parse_blocks(
        '<!-- wp:site-logo {"customCssVars":[{"name":"--logo-icon-bg","value":"#1c1d18"}]} /-->'
    );
    $html = render_block($blocks[0]);

    remove_theme_mod('custom_logo');

    expect($html)->toContain('<svg');
    expect($html)->toContain('--logo-icon-bg:#1c1d18');
});
