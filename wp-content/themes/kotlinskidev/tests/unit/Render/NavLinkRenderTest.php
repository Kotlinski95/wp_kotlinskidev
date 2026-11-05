<?php

use Brain\Monkey\Functions;

function kotlinskidev_nav_link_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/nav-link/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(function ($extra = []) {
        $out = [];
        foreach ($extra as $k => $v) {
            $out[] = $k . '="' . $v . '"';
        }
        return implode(' ', $out);
    });
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('wp_kses_post')->alias(fn ($t) => $t);
});

it('renders nothing when the label is empty', function () {
    expect(kotlinskidev_nav_link_render(['label' => '', 'url' => 'https://example.test']))->toBe('');
});

it('renders nothing when the url is empty', function () {
    expect(kotlinskidev_nav_link_render(['label' => 'About', 'url' => '']))->toBe('');
});

it('renders a minimal link with its label', function () {
    $html = kotlinskidev_nav_link_render(['label' => 'About', 'url' => 'https://example.test/about']);

    expect(trim($html))->toBe('<a class="kt-nav-link" href="https://example.test/about">About</a>');
});

it('opens in a new tab with noopener/noreferrer rel tokens', function () {
    $html = kotlinskidev_nav_link_render([
        'label' => 'About',
        'url' => 'https://example.test',
        'opensInNewTab' => true,
    ]);

    expect($html)->toContain('rel="noopener noreferrer"');
    expect($html)->toContain('target="_blank"');
});

it('merges custom rel tokens with the automatic ones', function () {
    $html = kotlinskidev_nav_link_render([
        'label' => 'About',
        'url' => 'https://example.test',
        'opensInNewTab' => true,
        'rel' => 'nofollow',
    ]);

    expect($html)->toContain('rel="nofollow noopener noreferrer"');
});

it('marks a "#" placeholder link as disabled and non-interactive', function () {
    $html = kotlinskidev_nav_link_render(['label' => 'Placeholder', 'url' => '#']);

    expect($html)->toContain('aria-disabled="true"');
    expect($html)->toContain('tabindex="-1"');
    expect($html)->toContain('style="pointer-events:none"');
});

it('does not mark a real url as a placeholder', function () {
    $html = kotlinskidev_nav_link_render(['label' => 'About', 'url' => 'https://example.test']);

    expect($html)->not->toContain('aria-disabled');
});

it('renders the description as a separate span', function () {
    $html = kotlinskidev_nav_link_render([
        'label' => 'About',
        'url' => 'https://example.test',
        'description' => 'Learn about us',
    ]);

    expect($html)->toContain('<span class="wp-block-navigation-item__description">Learn about us</span>');
});

it('wraps the label in a colored span when a text color is set', function () {
    $html = kotlinskidev_nav_link_render([
        'label' => 'About',
        'url' => 'https://example.test',
        'textColor' => '#ff0000',
    ]);

    expect($html)->toContain('<span style="color:#ff0000">About</span>');
});

it('prefers the gradient over the flat text color', function () {
    $html = kotlinskidev_nav_link_render([
        'label' => 'About',
        'url' => 'https://example.test',
        'textColor' => '#ff0000',
        'textGradient' => 'linear-gradient(red, blue)',
    ]);

    expect($html)->toContain('background-image:linear-gradient(red, blue)');
    expect($html)->not->toContain('color:#ff0000');
});
