<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/button-style-variants.php';

function kotlinskidev_render_google_maps_fixture(array $attributes): string
{
    Functions\when('esc_attr')->returnArg();
    Functions\when('get_template_directory')->justReturn(dirname(__DIR__, 2));
    Functions\when('esc_url')->returnArg();
    Functions\when('esc_html')->alias(fn ($t) => htmlspecialchars($t, ENT_QUOTES));
    Functions\when('wp_strip_all_tags')->alias(fn ($t) => strip_tags($t));
    Functions\when('__')->returnArg();
    Functions\when('get_site_icon_url')->justReturn('https://example.test/site-icon-128.webp');
    Functions\when('esc_html__')->returnArg();
    Functions\when('esc_js')->returnArg();
    Functions\when('wp_kses_post')->returnArg();
    Functions\when('wp_json_encode')->alias(fn ($value) => json_encode($value));
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-googlemaps-google-maps-block"');
    $attributes = $attributes;
    ob_start();
    include __DIR__ . '/../../src/blocks/google-maps/render.php';
    return (string) ob_get_clean();
}

it('renders the consent placeholder in static html with the expected strings', function () {
    $html = kotlinskidev_render_google_maps_fixture([
        'apiKey' => 'KEY',
        'lat' => '50.1',
        'lng' => '19.9',
        'showResetViewButton' => true,
    ]);

    expect($html)
        ->toContain('role="status"')
        ->toContain('data-kt-google-maps-placeholder')
        ->toContain('This map is provided by Google and needs your consent to marketing cookies before it can load.')
        ->toContain('<button type="button" class="kt-google-maps__consent is-style-fill-adaptive" data-kt-google-maps-consent>Cookie settings</button>');
    expect(strpos($html, 'data-kt-google-maps-placeholder'))->toBeLessThan(strpos($html, '<script'));
});

it('hides the reset view button until the map loads', function () {
    $html = kotlinskidev_render_google_maps_fixture([
        'apiKey' => 'KEY',
        'lat' => '50.1',
        'lng' => '19.9',
        'showResetViewButton' => true,
    ]);

    expect($html)->toMatch('/<button type="button" class="kt-google-maps__reset is-style-fill-adaptive" hidden id="reset-view-btn-google_maps_block_/');
});

it('keeps the map container and the inline loader script', function () {
    $html = kotlinskidev_render_google_maps_fixture([
        'apiKey' => 'KEY',
        'lat' => '50.1',
        'lng' => '19.9',
    ]);

    expect($html)
        ->toMatch('/<div id="google_maps_block_[a-z0-9]+" style="width:100%;height:100%;"><\/div>/')
        ->toContain('<script type="text/javascript">')
        ->toContain('https://maps.googleapis.com/maps/api/js?key=KEY')
        ->toContain("consentPlaceholder.remove()");
});

it('shows no placeholder when the block is not configured', function () {
    $html = kotlinskidev_render_google_maps_fixture([]);

    expect($html)->not->toContain('data-kt-google-maps-placeholder');
});

it('renders the marker card with name, tagline, directions link and decorative logo', function () {
    $html = kotlinskidev_render_google_maps_fixture([
        'apiKey' => 'KEY',
        'lat' => '50.284570',
        'lng' => '19.014725',
        'markerLabel' => 'Kotlinskidev - Adrian',
        'markerTooltip' => 'KotlinskiDev -websites development',
        'markerLogoUrl' => 'https://example.test/logo.webp',
    ]);

    expect($html)
        ->toContain('class="kt-google-maps__marker has-background has-text-color"')
        ->toContain('href="https://www.google.com/maps/search/?api=1&query=50.284570%2C19.014725"')
        ->toContain('target="_blank" rel="noopener noreferrer"')
        ->toContain('aria-label="Kotlinskidev - Adrian KotlinskiDev -websites development, opens in Google Maps in a new tab"')
        ->toContain('<strong class="kt-google-maps__marker-name">Kotlinskidev - Adrian</strong>')
        ->toContain('<span class="kt-google-maps__marker-tagline">KotlinskiDev -websites development</span>')
        ->toContain('src="https://example.test/logo.webp" alt="" width="40" height="40" loading="lazy" decoding="async"')
        ->toContain('OverlayView')
        ->not->toContain('new google.maps.Marker')
        ->not->toContain('InfoWindow');
});

it('falls back to the site icon when no marker logo is set', function () {
    $html = kotlinskidev_render_google_maps_fixture(['apiKey' => 'KEY', 'lat' => '1', 'lng' => '2', 'markerLabel' => 'X']);

    expect($html)->toContain('src="https://example.test/site-icon-128.webp"');
});

it('escapes the name and strips tags from the tagline', function () {
    $html = kotlinskidev_render_google_maps_fixture([
        'apiKey' => 'KEY',
        'lat' => '1',
        'lng' => '2',
        'markerLabel' => '<script>alert(1)</script>',
        'markerTooltip' => '<b>Bold</b> tag',
    ]);

    expect($html)
        ->toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
        ->toContain('>Bold tag</span>');
});

it('builds the directions link from the address when there are no coordinates', function () {
    expect(kotlinskidev_google_maps_directions_url('', '', '1 Infinite Loop & Co'))
        ->toBe('https://www.google.com/maps/search/?api=1&query=1%20Infinite%20Loop%20%26%20Co');
});

it('repairs backslash-n artifacts that lost their backslash in stored custom css', function () {
    $broken = '.marker-position {n margin-top: 55px;n padding: 3px;nborder: 1px solid black;n}n.gm-style-cc { display: none; }';

    $fixed = kotlinskidev_sanitize_map_css($broken);

    expect($fixed)->toBe(".marker-position {\n margin-top: 55px;\n padding: 3px;\nborder: 1px solid black;\n}\n.gm-style-cc { display: none; }");
});

it('leaves valid custom css untouched', function () {
    $css = ".a { margin: 0; }\n.b { color: red; }";

    expect(kotlinskidev_sanitize_map_css($css))->toBe($css);
});

it('renders both buttons with the default fill-adaptive style and default labels', function () {
    $html = kotlinskidev_render_google_maps_fixture(['apiKey' => 'KEY', 'lat' => '1', 'lng' => '2', 'showResetViewButton' => true]);

    expect($html)
        ->toContain('class="kt-google-maps__consent is-style-fill-adaptive"')
        ->toContain('class="kt-google-maps__reset is-style-fill-adaptive" hidden id="reset-view-btn-')
        ->toContain('>Cookie settings</button>')
        ->toContain('Reset View');
});

it('applies the chosen button style and escaped custom labels to both buttons', function () {
    $html = kotlinskidev_render_google_maps_fixture([
        'apiKey' => 'KEY',
        'lat' => '1',
        'lng' => '2',
        'showResetViewButton' => true,
        'buttonStyle' => 'outline-primary-dark',
        'consentButtonLabel' => '<b>Zgoda</b>',
        'resetViewLabel' => 'Wróć "tu"',
    ]);

    expect($html)
        ->toContain('class="kt-google-maps__consent is-style-outline-primary-dark"')
        ->toContain('class="kt-google-maps__reset is-style-outline-primary-dark"')
        ->toContain('&lt;b&gt;Zgoda&lt;/b&gt;')
        ->toContain('Wróć &quot;tu&quot;');
});

it('falls back to fill-adaptive for an unknown button style', function () {
    Functions\when('get_template_directory')->justReturn(dirname(__DIR__, 2));
    expect(kotlinskidev_resolve_button_style('gradient-nonsense'))->toBe('fill-adaptive');
    expect(kotlinskidev_resolve_button_style(null))->toBe('fill-adaptive');
    expect(kotlinskidev_resolve_button_style('fill-dark'))->toBe('fill-dark');

    $html = kotlinskidev_render_google_maps_fixture(['apiKey' => 'KEY', 'lat' => '1', 'lng' => '2', 'buttonStyle' => '"><script>']);

    expect($html)->toContain('kt-google-maps__consent is-style-fill-adaptive"');
});
