<?php

require_once __DIR__ . '/../../functions/scroll-section-pin-boundary-render.php';

it('leaves content untouched when the attribute is not set', function () {
    $content = '<div class="wp-block-group">Hi</div>';

    expect(kotlinskidev_apply_scroll_section_pin_boundary_class($content, ['attrs' => []]))
        ->toBe($content);
});

it('leaves content untouched when the attribute is explicitly false', function () {
    $content = '<div class="wp-block-group">Hi</div>';

    $result = kotlinskidev_apply_scroll_section_pin_boundary_class($content, [
        'attrs' => ['scrollSectionPinBoundary' => false],
    ]);

    expect($result)->toBe($content);
});

it('leaves empty content untouched', function () {
    $result = kotlinskidev_apply_scroll_section_pin_boundary_class('', [
        'attrs' => ['scrollSectionPinBoundary' => true],
    ]);

    expect($result)->toBe('');
});

it('appends the pin-boundary class onto the rendered root tag of a dynamic block', function () {
    $content = '<div class="wp-block-group">Hi</div>';

    $result = kotlinskidev_apply_scroll_section_pin_boundary_class($content, [
        'attrs' => ['scrollSectionPinBoundary' => true],
    ]);

    expect($result)->toContain('class="wp-block-group scroll-section-pin-boundary"');
});

it('does not duplicate the class when the saved static markup already carries it', function () {
    $content = '<div class="wp-block-group scroll-section-pin-boundary">Hi</div>';

    $result = kotlinskidev_apply_scroll_section_pin_boundary_class($content, [
        'attrs' => ['scrollSectionPinBoundary' => true],
    ]);

    expect(substr_count($result, 'scroll-section-pin-boundary'))->toBe(1);
});
