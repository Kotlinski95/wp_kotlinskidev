<?php

use Brain\Monkey\Functions;

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
