<?php

require_once __DIR__ . '/../../functions/accessibility-plugin.php';

it('sets the dark and light selectors to the theme mode classes', function () {
    $selectors = kotlinskidev_a11y_default_selectors([]);

    expect($selectors['darkSelector'])->toBe('html.dark-mode, body.dark-mode');
    expect($selectors['lightSelector'])->toBe('html.light-mode, body.light-mode');
});

it('keeps unrelated selector keys untouched', function () {
    $selectors = kotlinskidev_a11y_default_selectors(['other' => 'value']);

    expect($selectors['other'])->toBe('value');
});

it('recovers from a non-array filter value', function () {
    expect(kotlinskidev_a11y_default_selectors(null))->toHaveKeys(['darkSelector', 'lightSelector']);
});
