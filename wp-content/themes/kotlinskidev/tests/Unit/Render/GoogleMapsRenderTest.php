<?php

use Brain\Monkey\Functions;

function kotlinskidev_google_maps_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/google-maps/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-google-maps"');
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('esc_html__')->alias(fn ($t) => $t);
    Functions\when('esc_js')->alias(fn ($t) => $t);
    Functions\when('wp_kses_post')->alias(fn ($t) => $t);
    Functions\when('wp_json_encode')->alias(fn ($t, $flags = 0) => json_encode($t, $flags));
});

it('shows the setup placeholder when there is no api key', function () {
    $html = kotlinskidev_google_maps_render(['address' => '1 Infinite Loop']);

    expect($html)->toContain('Please provide a Google Maps API key');
    expect($html)->not->toContain('google.maps.Map');
});

it('shows the setup placeholder when there is an api key but no address or coordinates', function () {
    $html = kotlinskidev_google_maps_render(['apiKey' => 'key']);

    expect($html)->toContain('Please provide a Google Maps API key');
});

it('renders the map container when an api key and address are both set', function () {
    $html = kotlinskidev_google_maps_render(['apiKey' => 'key', 'address' => '1 Infinite Loop']);

    expect($html)->not->toContain('Please provide a Google Maps API key');
    expect($html)->toContain('google.maps.Map');
    expect($html)->toContain("geocoder.geocode({ address:");
});

it('renders the map container when coordinates are set instead of an address', function () {
    $html = kotlinskidev_google_maps_render(['apiKey' => 'key', 'lat' => '1.0', 'lng' => '2.0']);

    expect($html)->toContain('map.setCenter(position)');
    expect($html)->not->toContain('geocoder.geocode');
});

it('applies the configured width and height to the map container', function () {
    $html = kotlinskidev_google_maps_render([
        'apiKey' => 'key',
        'address' => '1 Infinite Loop',
        'width' => '50%',
        'height' => '20rem',
    ]);

    expect($html)->toContain('width:50%;height:20rem;');
});

it('shows the reset view button only when enabled', function () {
    $withoutButton = kotlinskidev_google_maps_render(['apiKey' => 'key', 'address' => 'x']);
    $withButton = kotlinskidev_google_maps_render([
        'apiKey' => 'key',
        'address' => 'x',
        'showResetViewButton' => true,
    ]);

    expect($withoutButton)->not->toContain('Reset View');
    expect($withButton)->toContain('Reset View');
});

it('scopes custom css selectors to the generated map id', function () {
    $html = kotlinskidev_google_maps_render([
        'apiKey' => 'key',
        'address' => 'x',
        'customCSS' => '.gm-style-cc { display: none; }',
    ]);

    expect($html)->toMatch('/<style id="marker-label-css-google_maps_block_[a-z0-9.]+">#google_maps_block_[a-z0-9.]+ \.gm-style-cc/');
});

it('strips @import rules from custom map css', function () {
    kotlinskidev_google_maps_render(['apiKey' => 'key', 'address' => 'x']);

    expect(kotlinskidev_sanitize_map_css('@import url("evil.css"); .a { color: red; }'))
        ->toBe(' .a { color: red; }');
});

it('strips url() references from custom map css', function () {
    kotlinskidev_google_maps_render(['apiKey' => 'key', 'address' => 'x']);

    expect(kotlinskidev_sanitize_map_css('.a { background: url(evil.png); }'))
        ->toBe('.a { background: ; }');
});
