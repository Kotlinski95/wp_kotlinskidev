<?php

use Brain\Monkey\Functions;

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

require_once __DIR__ . '/../../functions/feature-toggles.php';
require_once __DIR__ . '/../../functions/settings-page.php';
require_once __DIR__ . '/../../functions/in-view-hover.php';

beforeEach(function () {
    Functions\when('absint')->alias(fn ($value) => abs((int) $value));
});

it('returns the enabled, centre 50 and size 30 defaults when nothing is saved', function () {
    Functions\when('get_option')->alias(fn ($name, $default = false) => $default);

    expect(kotlinskidev_get_in_view_band_config())->toBe(['enabled' => true, 'center' => 50, 'size' => 30, 'links' => false]);
});

it('clamps saved centre and size into range', function () {
    $saved = [
        'kotlinskidev_in_view_hover_enabled' => false,
        'kotlinskidev_in_view_band_center' => 400,
        'kotlinskidev_in_view_band_size' => 0,
        'kotlinskidev_in_view_hover_links' => true,
    ];
    Functions\when('get_option')->alias(fn ($name, $default = false) => $saved[$name] ?? $default);

    expect(kotlinskidev_get_in_view_band_config())->toBe(['enabled' => false, 'center' => 100, 'size' => 1, 'links' => true]);
});

it('exposes the band config under the inViewBand key of the kotlinskiTheme localization', function () {
    $source = (string) file_get_contents(__DIR__ . '/../../functions/enqueue-scripts.php');

    expect($source)->toContain("'inViewBand' => kotlinskidev_get_in_view_band_config()");
    expect($source)->toContain("'kotlinskiTheme'");
});
