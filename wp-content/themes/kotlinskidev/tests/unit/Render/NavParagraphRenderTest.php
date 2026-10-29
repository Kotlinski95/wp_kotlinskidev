<?php

use Brain\Monkey\Functions;

function kotlinskidev_nav_paragraph_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/nav-paragraph/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-nav-paragraph"');
    Functions\when('esc_html')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));
    Functions\when('esc_attr')->alias(fn ($t) => $t);
});

it('renders nothing for empty content', function () {
    expect(kotlinskidev_nav_paragraph_render(['content' => '']))->toBe('');
});

it('renders plain content with line breaks converted', function () {
    $html = kotlinskidev_nav_paragraph_render(['content' => "Line one\nLine two"]);

    expect(trim($html))->toBe('<p class="wp-block-kotlinskidev-nav-paragraph">Line one<br />
Line two</p>');
});

it('wraps content in a colored span when a text color is set', function () {
    $html = kotlinskidev_nav_paragraph_render(['content' => 'Hello', 'textColor' => '#ff0000']);

    expect($html)->toContain('<span style="color:#ff0000">Hello</span>');
});

it('prefers the gradient style over the flat color', function () {
    $html = kotlinskidev_nav_paragraph_render([
        'content' => 'Hello',
        'textColor' => '#ff0000',
        'textGradient' => 'linear-gradient(red, blue)',
    ]);

    expect($html)->toContain('background-image:linear-gradient(red, blue)');
    expect($html)->not->toContain('color:#ff0000');
});
