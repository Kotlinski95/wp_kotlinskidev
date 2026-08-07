<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/polylang-accessibility.php';

beforeEach(function () {
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_attr__')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
});

it('adds an aria-label built from the flag image alt text when the link has none', function () {
    $output = '<a href="/pl/"><img src="pl.png" alt="Polski"></a>';

    $result = enhance_polylang_language_links($output, []);

    expect($result)->toContain('aria-label="Switch to Polski"');
});

it('falls back to a generic aria-label when the image has no alt text', function () {
    $output = '<a href="/pl/"><img src="pl.png"></a>';

    $result = enhance_polylang_language_links($output, []);

    expect($result)->toContain('aria-label="Language option"');
});

it('does not add an aria-label when the link already has one', function () {
    $output = '<a href="/pl/" aria-label="Polish"><img src="pl.png" alt="Polski"></a>';

    $result = enhance_polylang_language_links($output, []);

    expect(substr_count($result, 'aria-label='))->toBe(1);
});

it('does not add an aria-label when the link already has a title', function () {
    $output = '<a href="/pl/" title="Polish"><img src="pl.png" alt="Polski"></a>';

    $result = enhance_polylang_language_links($output, []);

    expect($result)->not->toContain('aria-label=');
});

it('adds accessibility attributes to an empty pll_switcher link', function () {
    $content = '<a href="#pll_switcher"></a>';

    $result = fix_pll_switcher_links($content);

    expect($result)->toContain('aria-label="Language Switcher"');
    expect($result)->toContain('role="button"');
    expect($result)->toContain('<span class="screen-reader-text">Language Switcher</span>');
});

it('leaves content without a pll_switcher link unchanged', function () {
    $content = '<a href="/other/">Link</a>';

    expect(fix_pll_switcher_links($content))->toBe($content);
});
