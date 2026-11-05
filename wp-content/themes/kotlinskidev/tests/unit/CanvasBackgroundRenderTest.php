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
require_once __DIR__ . '/../../functions/canvas/render.php';

beforeEach(function () {
    Functions\when('__')->returnArg(1);
    Functions\when('get_option')->alias(fn ($name, $default) => $default);
    Functions\when('esc_attr')->alias('htmlspecialchars');
    Functions\when('wp_json_encode')->alias('json_encode');
    Functions\when('sanitize_hex_color')->alias(function ($color) {
        return preg_match('/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/', (string) $color) ? $color : null;
    });
});

it('leaves the block content unchanged when canvasSceneId is missing', function () {
    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_apply_canvas_background($content, ['attrs' => []]))->toBe($content);
});

it('leaves the block content unchanged when canvasSceneId is zero', function () {
    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_apply_canvas_background($content, ['attrs' => ['canvasSceneId' => 0]]))->toBe($content);
});

it('leaves empty block content unchanged', function () {
    expect(kotlinskidev_apply_canvas_background('', ['attrs' => ['canvasSceneId' => 5]]))->toBe('');
});

it('leaves the block content unchanged when the scene does not resolve to a non-empty recipe', function () {
    Functions\when('get_post_status')->justReturn('draft');
    Functions\when('get_post_type')->justReturn('kt_canvas_scene');

    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_apply_canvas_background($content, ['attrs' => ['canvasSceneId' => 5]]))->toBe($content);
});

it('injects the canvas background markup right after the opening div tag', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_canvas_scene');
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_post_field')->justReturn('');
    Functions\when('parse_blocks')->justReturn([
        ['blockName' => 'kotlinskidev/canvas-layer-noise', 'attrs' => ['opacity' => 0.1]],
    ]);

    $content = '<div class="wp-block-group">Hi</div>';

    $result = kotlinskidev_apply_canvas_background($content, ['attrs' => ['canvasSceneId' => 5]]);

    expect($result)->toStartWith('<div class="wp-block-group kt-has-canvas-bg"><div class="kt-canvas-bg" data-canvas-recipe="');
    expect($result)->toEndWith('"></div>Hi</div>');
});

it('injects correctly regardless of the wrapper tag name', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_canvas_scene');
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_post_field')->justReturn('');
    Functions\when('parse_blocks')->justReturn([
        ['blockName' => 'kotlinskidev/canvas-layer-blob', 'attrs' => []],
    ]);

    foreach (['section', 'figure', 'ul'] as $tag) {
        $content = "<$tag class=\"wrapper\">content</$tag>";
        $result = kotlinskidev_apply_canvas_background($content, ['attrs' => ['canvasSceneId' => 9]]);

        expect($result)->toStartWith("<$tag class=\"wrapper kt-has-canvas-bg\"><div class=\"kt-canvas-bg\"");
        expect(substr_count($result, 'kt-canvas-bg'))->toBe(1);
    }
});

it('only injects into the first (outermost) tag, not a nested child', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_canvas_scene');
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_post_field')->justReturn('');
    Functions\when('parse_blocks')->justReturn([
        ['blockName' => 'kotlinskidev/canvas-layer-noise', 'attrs' => []],
    ]);

    $content = '<div class="outer"><div class="inner">Nested</div></div>';

    $result = kotlinskidev_apply_canvas_background($content, ['attrs' => ['canvasSceneId' => 9]]);

    expect(substr_count($result, 'kt-canvas-bg'))->toBe(1);
    expect($result)->toStartWith('<div class="outer kt-has-canvas-bg"><div class="kt-canvas-bg"');
});

it('adds the kt-has-canvas-bg positioning class to a wrapper with no existing class attribute', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_canvas_scene');
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_post_field')->justReturn('');
    Functions\when('parse_blocks')->justReturn([
        ['blockName' => 'kotlinskidev/canvas-layer-noise', 'attrs' => []],
    ]);

    $content = '<div>Hi</div>';

    $result = kotlinskidev_apply_canvas_background($content, ['attrs' => ['canvasSceneId' => 9]]);

    expect($result)->toStartWith('<div class="kt-has-canvas-bg"><div class="kt-canvas-bg"');
});

it('does not duplicate the kt-has-canvas-bg class if the wrapper already has it', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_canvas_scene');
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_post_field')->justReturn('');
    Functions\when('parse_blocks')->justReturn([
        ['blockName' => 'kotlinskidev/canvas-layer-noise', 'attrs' => []],
    ]);

    $content = '<div class="kt-has-canvas-bg">Hi</div>';

    $result = kotlinskidev_apply_canvas_background($content, ['attrs' => ['canvasSceneId' => 9]]);

    expect(substr_count($result, 'kt-has-canvas-bg'))->toBe(1);
});

it('does not render a scrim when canvasScrim is not set', function () {
    expect(kotlinskidev_render_canvas_scrim_markup([]))->toBe('');
});

it('does not render a scrim when canvasScrim is false', function () {
    expect(kotlinskidev_render_canvas_scrim_markup(['canvasScrim' => false]))->toBe('');
});

it('renders a scrim with sanitized color and opacity when canvasScrim is true', function () {
    $markup = kotlinskidev_render_canvas_scrim_markup([
        'canvasScrim' => true,
        'canvasScrimColor' => '#112233',
        'canvasScrimOpacity' => 0.75,
    ]);

    expect($markup)->toBe('<div class="kt-canvas-scrim" style="background-color:#112233;opacity:0.750;" aria-hidden="true"></div>');
});

it('falls back to defaults when scrim color/opacity are invalid', function () {
    $markup = kotlinskidev_render_canvas_scrim_markup([
        'canvasScrim' => true,
        'canvasScrimColor' => 'javascript:alert(1)',
        'canvasScrimOpacity' => 5,
    ]);

    expect($markup)->toBe('<div class="kt-canvas-scrim" style="background-color:#000000;opacity:1.000;" aria-hidden="true"></div>');
});

it('appends the scrim markup after the canvas background markup when both are present', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_canvas_scene');
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_post_field')->justReturn('');
    Functions\when('parse_blocks')->justReturn([
        ['blockName' => 'kotlinskidev/canvas-layer-noise', 'attrs' => []],
    ]);

    $content = '<div class="wp-block-group">Hi</div>';

    $result = kotlinskidev_apply_canvas_background($content, [
        'attrs' => [
            'canvasSceneId' => 5,
            'canvasScrim' => true,
            'canvasScrimColor' => '#112233',
            'canvasScrimOpacity' => 0.75,
        ],
    ]);

    expect($result)->toEndWith('<div class="kt-canvas-scrim" style="background-color:#112233;opacity:0.750;" aria-hidden="true"></div>Hi</div>');
});
