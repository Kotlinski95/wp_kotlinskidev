<?php

use Brain\Monkey\Functions;

function kotlinskidev_button_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/button/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ($extra['class'] ?? '') . '"'
    );
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('wp_kses_post')->alias(fn ($t) => $t);
});

it('renders nothing when the text is empty', function () {
    expect(kotlinskidev_button_render(['text' => '', 'url' => 'https://example.test']))->toBe('');
});

it('renders nothing when the url is empty', function () {
    expect(kotlinskidev_button_render(['text' => 'Click me', 'url' => '']))->toBe('');
});

it('renders the wrapper, link, and label for a minimal button', function () {
    $html = kotlinskidev_button_render(['text' => 'Click me', 'url' => 'https://example.test']);

    expect($html)->toContain('class="kt-button"');
    expect($html)->toContain('href="https://example.test"');
    expect($html)->toContain('class="kt-button__link"');
    expect($html)->toContain('>Click me</span>');
});

it('renders the label span without a style attribute when no text colors are set', function () {
    $html = kotlinskidev_button_render(['text' => 'Click me', 'url' => 'https://example.test']);

    preg_match('/<span[^>]*class="kt-button__label"[^>]*>/', $html, $matches);

    expect($matches[0])->not->toContain('style=');
});

it('applies the flat background color as a css custom property', function () {
    $html = kotlinskidev_button_render([
        'text' => 'Click me',
        'url' => 'https://example.test',
        'backgroundColor' => '#111111',
    ]);

    expect($html)->toContain('--kt-btn-bg:#111111;');
});

it('prefers the background gradient over the flat color', function () {
    $html = kotlinskidev_button_render([
        'text' => 'Click me',
        'url' => 'https://example.test',
        'backgroundColor' => '#111111',
        'backgroundGradient' => 'linear-gradient(red, blue)',
    ]);

    expect($html)->toContain('--kt-btn-bg:linear-gradient(red, blue);');
    expect($html)->not->toContain('--kt-btn-bg:#111111');
});

it('defaults the border width to 2px', function () {
    $html = kotlinskidev_button_render(['text' => 'Click me', 'url' => 'https://example.test']);

    expect($html)->toContain('--kt-btn-border-width:2px;');
});

it('uses a custom border width when provided', function () {
    $html = kotlinskidev_button_render([
        'text' => 'Click me',
        'url' => 'https://example.test',
        'borderWidth' => 5,
    ]);

    expect($html)->toContain('--kt-btn-border-width:5px;');
});

it('adds target=_blank and noopener/noreferrer rel tokens when opening in a new tab', function () {
    $html = kotlinskidev_button_render([
        'text' => 'Click me',
        'url' => 'https://example.test',
        'opensInNewTab' => true,
    ]);

    expect($html)->toContain('target="_blank"');
    expect($html)->toContain('rel="noopener noreferrer"');
});

it('merges custom rel tokens with the automatic ones, without duplicates', function () {
    $html = kotlinskidev_button_render([
        'text' => 'Click me',
        'url' => 'https://example.test',
        'opensInNewTab' => true,
        'rel' => 'nofollow noopener',
    ]);

    expect($html)->toContain('rel="nofollow noopener noreferrer"');
});

it('omits the rel attribute entirely when there are no tokens', function () {
    $html = kotlinskidev_button_render(['text' => 'Click me', 'url' => 'https://example.test']);

    expect($html)->not->toContain('rel=');
});

it('applies the text color to the label as a css custom property', function () {
    $html = kotlinskidev_button_render([
        'text' => 'Click me',
        'url' => 'https://example.test',
        'textColor' => '#ffffff',
    ]);

    expect($html)->toContain('--kt-btn-color:#ffffff;');
});

it('escapes the button text through wp_kses_post', function () {
    Functions\when('wp_kses_post')->alias(fn ($t) => str_replace('<script>', '', $t));

    $html = kotlinskidev_button_render([
        'text' => '<script>bad</script>Click',
        'url' => 'https://example.test',
    ]);

    expect($html)->not->toContain('<script>');
    expect($html)->toContain('Click');
});
