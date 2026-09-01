<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/svg-support.php';
require_once __DIR__ . '/../../functions/blocks.php';
require_once __DIR__ . '/../../functions/scroll-top-top.php';

it('renders the migrated arrow icon svg instead of the icomoon font class', function () {
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');

    $html = kotlinskidev_scroll_to_top_shortcode();

    expect($html)->toContain('<span class="kt-icon" style="--kt-icon-size:2rem;">');
    expect($html)->toContain('fill="currentColor"');
    expect($html)->not->toContain('icon-arrow-up');
});

it('always renders the fixed-arrow variant from the shortcode', function () {
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');

    $html = kotlinskidev_scroll_to_top_shortcode();

    expect($html)->toContain('id="scroll-to-top"');
    expect($html)->toContain('class="progress-ring"');
});

it('renders the bar variant without the fixed-arrow markup', function () {
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);

    $html = kotlinskidev_scroll_to_top_markup('bar');

    expect($html)->toContain('kt-scroll-to-top__trigger');
    expect($html)->not->toContain('id="scroll-to-top"');
    expect($html)->not->toContain('progress-ring');
});

it('falls back to the plain translated default label when Polylang is not active', function () {
    Functions\when('__')->justReturn('Scroll to Top');

    expect(kotlinskidev_scroll_to_top_default_label())->toBe('Scroll to Top');
});

it('resolves the label through pll__ when Polylang is active', function () {
    Functions\when('pll__')->alias(fn ($t) => 'Przewiń do góry');

    expect(kotlinskidev_scroll_to_top_default_label())->toBe('Przewiń do góry');
});

it('registers the button label as a Polylang string when Polylang is active', function () {
    $registered = [];
    Functions\when('pll_register_string')->alias(function ($name, $string, $group) use (&$registered) {
        $registered = [$name, $string, $group];
    });

    kotlinskidev_scroll_to_top_register_string();

    expect($registered)->toBe(['Scroll To Top Button Label', 'Scroll to Top', 'kotlinskidev']);
});
