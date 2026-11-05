<?php

use Brain\Monkey\Functions;

if (!function_exists('has_filter')) {
    function has_filter(...$args)
    {
        return false;
    }
}

require_once __DIR__ . '/../../functions/feature-toggles.php';
require_once __DIR__ . '/../../functions/polylang-content-resolution.php';
require_once __DIR__ . '/../../functions/canvas/scene.php';

beforeEach(function () {
    Functions\when('__')->returnArg(1);
    Functions\when('sanitize_hex_color')->alias(function ($color) {
        return preg_match('/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/', (string) $color) ? $color : null;
    });
    Functions\when('get_option')->alias(fn ($name, $default) => $default);
});

it('clamps a number below the minimum up to the minimum', function () {
    expect(kotlinskidev_sanitize_canvas_number(-50, 0, 2, 0.2))->toBe(0.0);
});

it('clamps a number above the maximum down to the maximum', function () {
    expect(kotlinskidev_sanitize_canvas_number(999, 0, 2, 0.2))->toBe(2.0);
});

it('passes through a number already inside bounds', function () {
    expect(kotlinskidev_sanitize_canvas_number(1.5, 0, 2, 0.2))->toBe(1.5);
});

it('accepts the exact min and max boundary values unchanged', function () {
    expect(kotlinskidev_sanitize_canvas_number(0, 0, 2, 0.2))->toBe(0.0);
    expect(kotlinskidev_sanitize_canvas_number(2, 0, 2, 0.2))->toBe(2.0);
});

it('falls back to the default for a non-numeric value', function () {
    expect(kotlinskidev_sanitize_canvas_number('not-a-number', 0, 2, 0.2))->toBe(0.2);
    expect(kotlinskidev_sanitize_canvas_number(null, 0, 2, 0.2))->toBe(0.2);
    expect(kotlinskidev_sanitize_canvas_number([1, 2], 0, 2, 0.2))->toBe(0.2);
});

it('falls back to the default for NAN and INF', function () {
    expect(kotlinskidev_sanitize_canvas_number(NAN, 0, 2, 0.2))->toBe(0.2);
    expect(kotlinskidev_sanitize_canvas_number(INF, 0, 2, 0.2))->toBe(0.2);
    expect(kotlinskidev_sanitize_canvas_number(-INF, 0, 2, 0.2))->toBe(0.2);
});

it('accepts a valid 6-digit hex color', function () {
    expect(kotlinskidev_sanitize_canvas_color('#8209d3', 'var(--wp--preset--color--primary)'))->toBe('#8209d3');
});

it('accepts a valid 8-digit hex color with alpha', function () {
    expect(kotlinskidev_sanitize_canvas_color('#8209d3CC', 'var(--wp--preset--color--primary)'))->toBe('#8209d3cc');
});

it('accepts a valid theme preset color var', function () {
    expect(kotlinskidev_sanitize_canvas_color('var(--wp--preset--color--primary-10)', '#ffffff'))->toBe('var(--wp--preset--color--primary-10)');
});

it('falls back to the default for an invalid hex color', function () {
    expect(kotlinskidev_sanitize_canvas_color('#zzzzzz', 'var(--wp--preset--color--primary)'))->toBe('var(--wp--preset--color--primary)');
});

it('falls back to the default for a non-string value', function () {
    expect(kotlinskidev_sanitize_canvas_color(null, 'var(--wp--preset--color--primary)'))->toBe('var(--wp--preset--color--primary)');
    expect(kotlinskidev_sanitize_canvas_color(['#8209d3'], 'var(--wp--preset--color--primary)'))->toBe('var(--wp--preset--color--primary)');
});

it('rejects a malicious value disguised as a CSS var expression', function () {
    $malicious = 'var(--wp--preset--color--primary); background:url(javascript:alert(1))';
    expect(kotlinskidev_sanitize_canvas_color($malicious, '#ffffff'))->toBe('#ffffff');
});

it('rejects an expression() injection attempt', function () {
    expect(kotlinskidev_sanitize_canvas_color('expression(alert(1))', '#ffffff'))->toBe('#ffffff');
});

it('rejects a script tag disguised as a color value', function () {
    expect(kotlinskidev_sanitize_canvas_color('<script>alert(1)</script>', '#ffffff'))->toBe('#ffffff');
});

it('clamps every gradient layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('gradient', [
        'colorStart' => '#invalid',
        'colorEnd' => '#00ff00',
        'angleDeg' => 999,
        'speed' => -5,
    ]);

    expect($params)->toBe([
        'colorStart' => 'var(--wp--preset--color--primary)',
        'colorEnd' => '#00ff00',
        'angleDeg' => 360.0,
        'speed' => 0.0,
    ]);
});

it('clamps every noise layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('noise', [
        'opacity' => 5,
        'jitterAmount' => -1,
        'grainSize' => 999,
    ]);

    expect($params)->toBe([
        'opacity' => 0.3,
        'jitterAmount' => 0.0,
        'grainSize' => 4,
    ]);
});

it('clamps every grid-lines layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('grid-lines', [
        'opacity' => -1,
        'lineCount' => 1,
        'color' => 'not-a-color',
    ]);

    expect($params)->toBe([
        'opacity' => 0.0,
        'lineCount' => 2,
        'color' => 'var(--wp--preset--color--surface)',
    ]);
});

it('clamps every blob layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('blob', [
        'count' => 0,
        'speed' => 100,
        'color' => '#123456',
        'radiusPct' => 1,
    ]);

    expect($params)->toBe([
        'count' => 1,
        'speed' => 1.5,
        'color' => '#123456',
        'radiusPct' => 5.0,
    ]);
});

it('clamps every sweep layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('sweep', [
        'speed' => -1,
        'angleDeg' => -10,
        'width' => 10,
        'color' => 'javascript:alert(1)',
    ]);

    expect($params)->toBe([
        'speed' => 0.0,
        'angleDeg' => 0.0,
        'width' => 0.5,
        'color' => '#ffffff',
    ]);
});

it('clamps every light-rays layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('light-rays', [
        'rayCount' => 0,
        'speed' => -5,
        'color' => 'expression(alert(1))',
        'opacity' => 5,
    ]);

    expect($params)->toBe([
        'rayCount' => 1,
        'speed' => 0.0,
        'color' => '#ffffff',
        'opacity' => 1.0,
    ]);
});

it('clamps every curved-rays layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('curved-rays', [
        'rayCount' => 999,
        'speed' => -5,
        'color' => 'javascript:alert(1)',
        'opacity' => -1,
    ]);

    expect($params)->toBe([
        'rayCount' => 32,
        'speed' => 0.0,
        'color' => '#cccccc',
        'opacity' => 0.0,
    ]);
});

it('clamps every star-field layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('star-field', [
        'layerCount' => 999,
        'speed' => -5,
        'color' => 'javascript:alert(1)',
        'opacity' => 5,
    ]);

    expect($params)->toBe([
        'layerCount' => 12,
        'speed' => 0.0,
        'color' => '#ffffff',
        'opacity' => 1.0,
    ]);
});

it('clamps every orbit-trails layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('orbit-trails', [
        'speed' => -5,
        'decay' => 5,
        'color' => 'javascript:alert(1)',
        'opacity' => 5,
    ]);

    expect($params)->toBe([
        'speed' => 0.0,
        'decay' => 0.999,
        'color' => 'var(--wp--preset--color--foreground)',
        'opacity' => 1.0,
    ]);
});

it('clamps every warp-field layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('warp-field', [
        'speed' => -5,
        'density' => 999,
        'color' => 'javascript:alert(1)',
        'opacity' => 5,
    ]);

    expect($params)->toBe([
        'speed' => 0.0,
        'density' => 2.5,
        'color' => 'var(--wp--preset--color--foreground)',
        'opacity' => 1.0,
    ]);
});

it('clamps every nebula layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('nebula', [
        'speed' => -5,
        'zoom' => 999,
        'color' => 'javascript:alert(1)',
        'opacity' => 5,
    ]);

    expect($params)->toBe([
        'speed' => 0.0,
        'zoom' => 2.0,
        'color' => '#ffffff',
        'opacity' => 1.0,
    ]);
});

it('clamps every aurora layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('aurora', [
        'speed' => -5,
        'colorStart' => 'javascript:alert(1)',
        'colorEnd' => 'javascript:alert(1)',
        'opacity' => 5,
    ]);

    expect($params)->toBe([
        'speed' => 0.0,
        'colorStart' => '#8066ff',
        'colorEnd' => '#99e6ff',
        'opacity' => 1.0,
    ]);
});

it('clamps every neon-waves layer param to its documented bounds', function () {
    $params = kotlinskidev_sanitize_canvas_layer_params('neon-waves', [
        'speed' => -5,
        'intensity' => 999,
        'color' => 'javascript:alert(1)',
        'opacity' => 5,
    ]);

    expect($params)->toBe([
        'speed' => 0.0,
        'intensity' => 6.0,
        'color' => '#ffffff',
        'opacity' => 1.0,
    ]);
});

it('returns an empty params array for an unrecognized layer type', function () {
    expect(kotlinskidev_sanitize_canvas_layer_params('not-a-real-layer', ['opacity' => 1]))->toBe([]);
});

it('returns an empty recipe when the feature toggle is disabled', function () {
    Functions\when('get_option')->alias(fn ($name, $default) => ['project_cards']);

    expect(kotlinskidev_build_canvas_recipe(123))->toBe([]);
});

it('returns an empty recipe for a scene id of zero', function () {
    expect(kotlinskidev_build_canvas_recipe(0))->toBe([]);
});

it('returns an empty recipe for an unpublished scene', function () {
    Functions\when('get_post_status')->justReturn('draft');
    Functions\when('get_post_type')->justReturn('kt_canvas_scene');

    expect(kotlinskidev_build_canvas_recipe(5))->toBe([]);
});

it('returns an empty recipe when the id does not belong to a kt_canvas_scene post', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('post');

    expect(kotlinskidev_build_canvas_recipe(5))->toBe([]);
});

it('returns the cached recipe without re-parsing blocks when a transient already exists', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_canvas_scene');
    Functions\when('get_transient')->justReturn(['layers' => [['type' => 'cached', 'params' => []]]]);

    expect(kotlinskidev_build_canvas_recipe(5))->toBe(['layers' => [['type' => 'cached', 'params' => []]]]);
});

it('parses allowlisted layer blocks and silently drops anything else', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_canvas_scene');
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_post_field')->justReturn('');
    Functions\when('parse_blocks')->justReturn([
        ['blockName' => 'kotlinskidev/canvas-layer-noise', 'attrs' => ['opacity' => 0.1]],
        ['blockName' => 'core/paragraph', 'attrs' => []],
        ['blockName' => null, 'attrs' => []],
        ['blockName' => 'kotlinskidev/canvas-layer-blob', 'attrs' => ['count' => 2]],
    ]);

    $recipe = kotlinskidev_build_canvas_recipe(5);

    expect($recipe['layers'])->toHaveCount(2);
    expect($recipe['layers'][0]['type'])->toBe('noise');
    expect($recipe['layers'][1]['type'])->toBe('blob');
});
