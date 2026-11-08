<?php

uses(Tests\Integration\TestCase::class);

it('outputs the accessibility fix-up script on wp_footer', function () {
    test()->setExpectedDeprecated('the_block_template_skip_link');

    ob_start();
    do_action('wp_footer');
    $html = ob_get_clean();

    expect($html)->toContain('pll_switcher');
    expect($html)->toContain('Language Switcher');
    expect($html)->toContain('screen-reader-text');
});

it('adds an aria-label built from the flag alt text to an unlabelled language link', function () {
    $output = '<a href="/en/"><img alt="English" src="en.png"></a>';

    $result = enhance_polylang_language_links($output, []);

    expect($result)->toContain('aria-label="Switch to English"');
});

it('adds a generic aria-label when the flag image has no alt text', function () {
    $output = '<a href="/en/"><img src="en.png"></a>';

    $result = enhance_polylang_language_links($output, []);

    expect($result)->toContain('aria-label="Language option"');
});

it('does not add an aria-label when the link already has a title', function () {
    $output = '<a href="/en/" title="English"><img alt="English" src="en.png"></a>';

    $result = enhance_polylang_language_links($output, []);

    expect($result)->toBe($output);
});

it('adds an accessible label and screen-reader text to a raw pll_switcher link', function () {
    $content = '<a href="#pll_switcher"></a>';

    $result = fix_pll_switcher_links($content);

    expect($result)->toContain('aria-label="Language Switcher"');
    expect($result)->toContain('role="button"');
    expect($result)->toContain('<span class="screen-reader-text">Language Switcher</span>');
});

it('leaves content with no pll_switcher link untouched', function () {
    $content = '<a href="/somewhere">Link</a>';

    expect(fix_pll_switcher_links($content))->toBe($content);
});
