<?php

use Brain\Monkey\Functions;

function kotlinskidev_model_viewer_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/model-viewer/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ($extra['class'] ?? '') . '" style="' . ($extra['style'] ?? '') . '"'
    );
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('sanitize_textarea_field')->alias(fn ($t) => $t);
    Functions\when('__')->alias(fn ($t) => $t);
});

it('renders nothing when modelUrl is missing', function () {
    $html = kotlinskidev_model_viewer_render(['posterUrl' => 'https://example.test/poster.jpg']);

    expect($html)->toBe('');
});

it('renders nothing when posterUrl is missing', function () {
    $html = kotlinskidev_model_viewer_render(['modelUrl' => 'https://example.test/model.glb']);

    expect($html)->toBe('');
});

it('renders the trigger button with both urls set', function () {
    $html = kotlinskidev_model_viewer_render([
        'modelUrl'  => 'https://example.test/model.glb',
        'posterUrl' => 'https://example.test/poster.jpg',
    ]);

    expect($html)->toContain('data-model-url="https://example.test/model.glb"');
    expect($html)->toContain('src="https://example.test/poster.jpg"');
    expect($html)->toContain('<canvas class="model-viewer__canvas" aria-hidden="true">');
    expect($html)->toContain('aria-pressed="false"');
});

it('falls back to a default aria-label when none is set', function () {
    $html = kotlinskidev_model_viewer_render([
        'modelUrl'  => 'https://example.test/model.glb',
        'posterUrl' => 'https://example.test/poster.jpg',
    ]);

    expect($html)->toContain('aria-label="Interactive 3D model — click to open or close"');
});

it('uses a custom aria-label when set', function () {
    $html = kotlinskidev_model_viewer_render([
        'modelUrl'  => 'https://example.test/model.glb',
        'posterUrl' => 'https://example.test/poster.jpg',
        'ariaLabel' => 'Interactive laptop model',
    ]);

    expect($html)->toContain('aria-label="Interactive laptop model"');
});

it('defaults clipName to "open" when unset', function () {
    $html = kotlinskidev_model_viewer_render([
        'modelUrl'  => 'https://example.test/model.glb',
        'posterUrl' => 'https://example.test/poster.jpg',
    ]);

    expect($html)->toContain('data-clip-name="open"');
});

it('uses a custom clipName when set', function () {
    $html = kotlinskidev_model_viewer_render([
        'modelUrl'  => 'https://example.test/model.glb',
        'posterUrl' => 'https://example.test/poster.jpg',
        'clipName'  => 'reveal',
    ]);

    expect($html)->toContain('data-clip-name="reveal"');
});

it('emits the aspect ratio and background color as css custom properties', function () {
    $html = kotlinskidev_model_viewer_render([
        'modelUrl'        => 'https://example.test/model.glb',
        'posterUrl'       => 'https://example.test/poster.jpg',
        'aspectRatio'     => '1/1',
        'backgroundColor' => '#111111',
    ]);

    expect($html)->toContain('--model-viewer-aspect-ratio: 1/1');
    expect($html)->toContain('--model-viewer-bg: #111111');
});

it('defaults the aspect ratio to 16/9 and omits the background variable when unset', function () {
    $html = kotlinskidev_model_viewer_render([
        'modelUrl'  => 'https://example.test/model.glb',
        'posterUrl' => 'https://example.test/poster.jpg',
    ]);

    expect($html)->toContain('--model-viewer-aspect-ratio: 16/9');
    expect($html)->not->toContain('--model-viewer-bg');
});

it('omits data-enable-orbit when orbit controls are not enabled', function () {
    $html = kotlinskidev_model_viewer_render([
        'modelUrl'  => 'https://example.test/model.glb',
        'posterUrl' => 'https://example.test/poster.jpg',
    ]);

    expect($html)->not->toContain('data-enable-orbit');
});

it('emits data-enable-orbit="true" when orbit controls are enabled', function () {
    $html = kotlinskidev_model_viewer_render([
        'modelUrl'            => 'https://example.test/model.glb',
        'posterUrl'           => 'https://example.test/poster.jpg',
        'enableOrbitControls' => true,
    ]);

    expect($html)->toContain('data-enable-orbit="true"');
});

it('omits data-screen-text when no screen text is set', function () {
    $html = kotlinskidev_model_viewer_render([
        'modelUrl'  => 'https://example.test/model.glb',
        'posterUrl' => 'https://example.test/poster.jpg',
    ]);

    expect($html)->not->toContain('data-screen-text');
});

it('emits data-screen-text when screen text is set', function () {
    $html = kotlinskidev_model_viewer_render([
        'modelUrl'   => 'https://example.test/model.glb',
        'posterUrl'  => 'https://example.test/poster.jpg',
        'screenText' => "adrian@kotlinskidev.com\n+48 608 418 911",
    ]);

    expect($html)->toContain('data-screen-text="adrian@kotlinskidev.com');
});
