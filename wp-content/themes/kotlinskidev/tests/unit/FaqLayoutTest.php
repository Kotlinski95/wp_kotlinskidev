<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/faq-layout.php';

beforeEach(function () {
    Functions\when('absint')->alias('abs');
});

it('returns an empty class when the layout is not independent', function () {
    expect(kotlinskidev_faq_layout_class(['layout' => 'stacked']))->toBe('');
    expect(kotlinskidev_faq_layout_class([]))->toBe('');
});

it('defaults to 2 columns when none is specified', function () {
    expect(kotlinskidev_faq_layout_class(['layout' => 'independent']))->toBe('kt-faq-independent-columns-2');
});

it('accepts 3 and 4 as valid column counts', function () {
    expect(kotlinskidev_faq_layout_class(['layout' => 'independent', 'columns' => 3]))
        ->toBe('kt-faq-independent-columns-3');
    expect(kotlinskidev_faq_layout_class(['layout' => 'independent', 'columns' => 4]))
        ->toBe('kt-faq-independent-columns-4');
});

it('falls back to 2 columns for an unsupported column count', function () {
    expect(kotlinskidev_faq_layout_class(['layout' => 'independent', 'columns' => 5]))
        ->toBe('kt-faq-independent-columns-2');
});

it('leaves non-group blocks untouched', function () {
    $content = '<div class="wp-block-group">Hi</div>';

    expect(kotlinskidev_apply_faq_layout($content, ['blockName' => 'core/paragraph']))->toBe($content);
});

it('leaves group blocks untouched when there is no independent faq layout', function () {
    $content = '<div class="wp-block-group">Hi</div>';
    $block = ['blockName' => 'core/group', 'attrs' => ['faqLayout' => ['layout' => 'stacked']]];

    expect(kotlinskidev_apply_faq_layout($content, $block))->toBe($content);
});
