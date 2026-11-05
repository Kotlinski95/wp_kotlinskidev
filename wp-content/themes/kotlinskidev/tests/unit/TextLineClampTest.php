<?php

require_once __DIR__ . '/../../functions/text-line-clamp.php';

use Brain\Monkey\Functions;

beforeEach(function () {
    Functions\when('esc_html__')->alias(fn ($text) => $text);
});

it('leaves content untouched when line clamp is disabled', function () {
    $content = '<p class="wp-block">Hello</p>';
    $block = ['blockName' => 'core/paragraph', 'attrs' => ['kotlinskidevLineClampEnabled' => false]];

    expect(kotlinskidev_apply_line_clamp($content, $block))->toBe($content);
});

it('leaves content untouched when there are no attrs at all', function () {
    $content = '<p class="wp-block">Hello</p>';

    expect(kotlinskidev_apply_line_clamp($content, []))->toBe($content);
});

it('leaves content untouched when enabled but lines is zero', function () {
    $content = '<p class="wp-block">Hello</p>';
    $block = [
        'blockName' => 'core/paragraph',
        'attrs' => ['kotlinskidevLineClampEnabled' => true, 'kotlinskidevLineClampLines' => 0],
    ];

    expect(kotlinskidev_apply_line_clamp($content, $block))->toBe($content);
});

it('leaves empty content untouched', function () {
    $block = [
        'blockName' => 'core/paragraph',
        'attrs' => ['kotlinskidevLineClampEnabled' => true, 'kotlinskidevLineClampLines' => 3],
    ];

    expect(kotlinskidev_apply_line_clamp('', $block))->toBe('');
});

it('adds the clamp class and css variable to the paragraph tag', function () {
    $content = '<p class="wp-block-paragraph">Hello</p>';
    $block = [
        'blockName' => 'core/paragraph',
        'attrs' => ['kotlinskidevLineClampEnabled' => true, 'kotlinskidevLineClampLines' => 3],
    ];

    $html = kotlinskidev_apply_line_clamp($content, $block);

    expect($html)->toContain('kt-line-clamp');
    expect($html)->toContain('wp-block-paragraph');
    expect($html)->toContain('--kt-line-clamp-lines:3');
});

it('appends the read-more toggle button after the paragraph', function () {
    $content = '<p class="wp-block-paragraph">Hello</p>';
    $block = [
        'blockName' => 'core/paragraph',
        'attrs' => ['kotlinskidevLineClampEnabled' => true, 'kotlinskidevLineClampLines' => 4],
    ];

    $html = kotlinskidev_apply_line_clamp($content, $block);

    expect($html)->toContain('kt-line-clamp-toggle');
    expect($html)->toContain('aria-expanded="false"');
    expect($html)->toContain('Read more');
    expect(strpos($html, '</p>'))->toBeLessThan(strpos($html, 'kt-line-clamp-toggle'));
});

it('preserves an existing style attribute on the paragraph', function () {
    $content = '<p class="wp-block-paragraph" style="color:red;">Hello</p>';
    $block = [
        'blockName' => 'core/paragraph',
        'attrs' => ['kotlinskidevLineClampEnabled' => true, 'kotlinskidevLineClampLines' => 2],
    ];

    $html = kotlinskidev_apply_line_clamp($content, $block);

    expect($html)->toContain('color:red');
    expect($html)->toContain('--kt-line-clamp-lines:2');
});
