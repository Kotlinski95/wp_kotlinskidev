<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/nav-reveal-render.php';

function kotlinskidev_search_panel_render(array $attributes, string $content = ''): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/search-panel/render.php',
        $attributes,
        $content
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ($extra['class'] ?? '') . '"'
    );
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('wp_unique_id')->justReturn('7');
    Functions\when('sanitize_html_class')->returnArg(1);
});

it('defaults the aria-label to Search and shows no visible label when none is configured', function () {
    $html = kotlinskidev_search_panel_render(['label' => '']);

    expect($html)->toContain('aria-label="Search"');
    expect($html)->not->toContain('kt-search-panel__label');
});

it('uses the configured label for the aria-label and shows a visible label span', function () {
    $html = kotlinskidev_search_panel_render(['label' => 'Find Anything']);

    expect($html)->toContain('aria-label="Find Anything"');
    expect($html)->toContain('<span class="kt-search-panel__label">Find Anything</span>');
});

it('ties the trigger button and modal together via a shared unique id', function () {
    $html = kotlinskidev_search_panel_render(['label' => '']);

    expect($html)->toContain('aria-controls="kt-search-modal-7"');
    expect($html)->toContain('id="kt-search-modal-7"');
});

it('renders the inner block content inside the modal', function () {
    $html = kotlinskidev_search_panel_render(['label' => ''], '<form>Search form</form>');

    expect($html)->toContain('<form>Search form</form>');
});

it('leaves the modal class untouched when no reveal animation is configured', function () {
    $html = kotlinskidev_search_panel_render(['label' => '']);

    expect($html)->toContain('class="kt-search-panel__modal"');
});

it('adds the reveal animation class directly onto the modal element', function () {
    $html = kotlinskidev_search_panel_render([
        'label' => '',
        'navRevealAnimation' => 'appear-on-reveal',
    ]);

    expect($html)->toContain('class="kt-search-panel__modal appear-on-reveal"');
});

it('adds the --reveal-delay style onto the modal element when a delay is configured', function () {
    $html = kotlinskidev_search_panel_render([
        'label' => '',
        'navRevealAnimation' => 'appear-on-reveal',
        'navRevealDelay' => 150,
    ]);

    expect($html)->toContain('style="--reveal-delay:150ms;"');
});

it('staggers each kt-popular-pages__item with an increasing delay when a reveal animation is configured', function () {
    $content = '<div class="kt-popular-pages"><ul class="kt-popular-pages__list">'
        . '<li class="kt-popular-pages__item"><a>A</a></li>'
        . '<li class="kt-popular-pages__item"><a>B</a></li>'
        . '</ul></div>';

    $html = kotlinskidev_search_panel_render(['label' => '', 'navRevealAnimation' => 'appear-on-reveal'], $content);

    expect($html)->toContain('class="kt-popular-pages__item appear-on-reveal"><a>A');
    expect($html)->toContain('class="kt-popular-pages__item appear-on-reveal" style="--reveal-delay:60ms;"><a>B');
});

it('staggers the search form and the popular-pages title in the same sequence as the items', function () {
    $content = '<form class="wp-block-search"><input/></form>'
        . '<div class="kt-popular-pages"><p class="kt-popular-pages__title">Frequently visited pages</p>'
        . '<ul class="kt-popular-pages__list">'
        . '<li class="kt-popular-pages__item"><a>A</a></li>'
        . '</ul></div>';

    $html = kotlinskidev_search_panel_render(['label' => '', 'navRevealAnimation' => 'appear-on-reveal'], $content);

    expect($html)->toContain('class="wp-block-search appear-on-reveal"');
    expect($html)->toContain('class="kt-popular-pages__title appear-on-reveal" style="--reveal-delay:60ms;"');
    expect($html)->toContain('class="kt-popular-pages__item appear-on-reveal" style="--reveal-delay:120ms;"');
});

it('does not stagger popular-pages items when no reveal animation is configured', function () {
    $content = '<li class="kt-popular-pages__item"><a>A</a></li>';

    $html = kotlinskidev_search_panel_render(['label' => ''], $content);

    expect($html)->toContain('<li class="kt-popular-pages__item"><a>A</a></li>');
});
