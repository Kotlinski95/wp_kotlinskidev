<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/contact-form/default-labels.php';

beforeEach(function () {
    Functions\when('__')->alias(fn ($text) => 'PL:' . $text);
});

it('translates a label equal to the block default', function () {
    expect(kotlinskidev_contact_form_label(['nameLabel' => 'Name'], 'nameLabel', 'Name'))->toBe('PL:Name');
});

it('translates a missing attribute using the default', function () {
    expect(kotlinskidev_contact_form_label([], 'submitLabel', 'Send'))->toBe('PL:Send');
});

it('keeps an edited label untouched', function () {
    expect(kotlinskidev_contact_form_label(['nameLabel' => 'Full name'], 'nameLabel', 'Name'))->toBe('Full name');
});

it('returns the default unchanged when it has no translation entry', function () {
    expect(kotlinskidev_contact_form_label([], 'x', 'Unknown'))->toBe('Unknown');
});

it('covers every block.json default string', function () {
    $block = json_decode(file_get_contents(__DIR__ . '/../../src/blocks/contact-form/block.json'), true);
    $labelAttributes = ['nameLabel', 'namePlaceholder', 'emailLabel', 'emailPlaceholder', 'topicLabel', 'topicPlaceholder', 'messageLabel', 'messagePlaceholder', 'agreeLabel', 'submitLabel', 'successMessage', 'errorMessage'];
    $translations = kotlinskidev_contact_form_default_label_translations();
    foreach ($labelAttributes as $attribute) {
        expect($translations)->toHaveKey($block['attributes'][$attribute]['default']);
    }
});
