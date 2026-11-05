<?php

use Brain\Monkey\Functions;

function kotlinskidev_button_render(array $attributes, string $content = ''): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/button/render.php',
        $attributes,
        $content
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

it('renders a span (not an anchor) when useInnerBlocks is on and no url is set, to avoid nesting an anchor inside an anchor', function () {
    $html = kotlinskidev_button_render(
        ['url' => '', 'useInnerBlocks' => true],
        '<span class="kt-protected-value"><a href="tel:+15551234567">Call me</a></span>'
    );

    expect(substr_count($html, '<a '))->toBe(1);
    expect($html)->toContain('<span');
    expect($html)->toContain('class="kt-button__link"');
    expect($html)->toContain('<a href="tel:+15551234567">Call me</a>');
});

it('still renders a real anchor when useInnerBlocks is on and a url is set', function () {
    $html = kotlinskidev_button_render(
        ['url' => 'https://example.test', 'useInnerBlocks' => true],
        '<p>Some content</p>'
    );

    expect($html)->toContain('<a');
    expect($html)->toContain('class="kt-button__link"');
    expect($html)->toContain('href="https://example.test"');
    expect($html)->toContain('<p>Some content</p>');
});

it('renders nothing when useInnerBlocks is on and there is no inner content', function () {
    expect(kotlinskidev_button_render(['url' => 'https://example.test', 'useInnerBlocks' => true], ''))
        ->toBe('');
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

it('adds the has-enhanced-hover-glow class to the link when hoverEnhancedGlow is on', function () {
    $html = kotlinskidev_button_render([
        'text' => 'Click me',
        'url' => 'https://example.test',
        'hoverEnhancedGlow' => true,
    ]);

    expect($html)->toContain('class="kt-button__link has-enhanced-hover-glow"');
});

it('sets --kt-glow-spotlight-color from a flat hover text color', function () {
    $html = kotlinskidev_button_render([
        'text' => 'Click me',
        'url' => 'https://example.test',
        'hoverTextColor' => '#ffffff',
        'hoverEnhancedGlow' => true,
    ]);

    expect($html)->toContain('--kt-glow-spotlight-color:#ffffff;');
});

it('does not set --kt-glow-spotlight-color when only a hover text gradient is set, since embedding a gradient string as a radial-gradient color-stop is invalid CSS', function () {
    $html = kotlinskidev_button_render([
        'text' => 'Click me',
        'url' => 'https://example.test',
        'hoverTextGradient' => 'linear-gradient(to left, rgb(184, 150, 255) 0%, rgb(0, 246, 255) 60%)',
        'hoverEnhancedGlow' => true,
    ]);

    expect($html)->not->toContain('--kt-glow-spotlight-color');
    expect($html)->toContain('--kt-btn-hover-color:linear-gradient(to left, rgb(184, 150, 255) 0%, rgb(0, 246, 255) 60%);');
});

it('adds has-kt-btn-hover-gradient to the link when a hover text gradient is set, so hover-glow.scss can pick its gradient-safe branch', function () {
    $html = kotlinskidev_button_render([
        'text' => 'Click me',
        'url' => 'https://example.test',
        'hoverTextGradient' => 'linear-gradient(to left, rgb(184, 150, 255) 0%, rgb(0, 246, 255) 60%)',
        'hoverEnhancedGlow' => true,
    ]);

    expect($html)->toContain('class="kt-button__link has-enhanced-hover-glow has-kt-btn-hover-gradient"');
});

it('does not add has-kt-btn-hover-gradient when only a flat hover text color is set, even an adaptive light-dark() one', function () {
    $html = kotlinskidev_button_render([
        'text' => 'Click me',
        'url' => 'https://example.test',
        'hoverTextColor' => 'light-dark(var(--wp--preset--color--primary-light), var(--wp--preset--color--primary-dark))',
        'hoverEnhancedGlow' => true,
    ]);

    expect($html)->not->toContain('has-kt-btn-hover-gradient');
    expect($html)->toContain(
        '--kt-glow-spotlight-color:light-dark(var(--wp--preset--color--primary-light), var(--wp--preset--color--primary-dark));'
    );
});
