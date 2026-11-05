<?php

uses(Tests\Integration\TestCase::class);

it('leaves a non-group block untouched even with a valid faqLayout attribute', function () {
    $html = kotlinskidev_apply_faq_layout(
        '<div class="wp-block">x</div>',
        ['blockName' => 'core/paragraph', 'attrs' => ['faqLayout' => ['layout' => 'independent']]]
    );

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('leaves a group block untouched when the layout is not independent', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"faqLayout":{"layout":"stacked"}} --><div class="wp-block-group">x</div><!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('kt-faq-independent-columns');
});

it('adds the independent-columns class with the configured column count', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"faqLayout":{"layout":"independent","columns":3}} --><div class="wp-block-group">x</div><!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('kt-faq-independent-columns-3');
});

it('falls back to 2 columns for an unsupported column count', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"faqLayout":{"layout":"independent","columns":7}} --><div class="wp-block-group">x</div><!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('kt-faq-independent-columns-2');
});
