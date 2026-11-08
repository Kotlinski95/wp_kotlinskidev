<?php

uses(Tests\Integration\TestCase::class);

it('finds a top-level contact-form-ts/form block', function () {
    $blocks = parse_blocks('<!-- wp:contact-form-ts/form {"title":"Contact us"} /-->');

    $found = kotlinskidev_contact_form_find_block($blocks);

    expect($found)->not->toBeNull();
    expect($found['blockName'])->toBe('contact-form-ts/form');
    expect($found['attrs']['title'])->toBe('Contact us');
});

it('finds a contact-form-ts/form block nested inside other blocks', function () {
    $blocks = parse_blocks(
        '<!-- wp:group -->'
        . '<div class="wp-block-group">'
        . '<!-- wp:column --><!-- wp:contact-form-ts/form {"enableCaptcha":true} /--><!-- /wp:column -->'
        . '</div>'
        . '<!-- /wp:group -->'
    );

    $found = kotlinskidev_contact_form_find_block($blocks);

    expect($found)->not->toBeNull();
    expect($found['attrs']['enableCaptcha'])->toBeTrue();
});

it('returns null when no contact-form-ts/form block is present', function () {
    $blocks = parse_blocks('<!-- wp:paragraph --><p>Hello</p><!-- /wp:paragraph -->');

    expect(kotlinskidev_contact_form_find_block($blocks))->toBeNull();
});

it('returns null for an empty block list', function () {
    expect(kotlinskidev_contact_form_find_block([]))->toBeNull();
});
