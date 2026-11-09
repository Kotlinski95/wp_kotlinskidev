<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/project-card.php';

beforeEach(function () {
    Functions\when('esc_url')->returnArg();
    Functions\when('esc_attr')->returnArg();
});

$card = '<h3 class="wp-block-post-title">Lego</h3><div class="wp-block-button kt-project-card__link"><a class="wp-block-button__link">&rarr;</a></div>';

it('adds the project url and a label to the arrow link', function () use ($card) {
    $html = kotlinskidev_link_project_card_elements($card, 'https://example.test/lego/', 'Lego');

    expect($html)->toContain('<a href="https://example.test/lego/" aria-label="Lego" class="wp-block-button__link">&rarr;</a>');
});

it('wraps the post title in a link', function () use ($card) {
    $html = kotlinskidev_link_project_card_elements($card, 'https://example.test/lego/', 'Lego');

    expect($html)->toContain('<h3 class="wp-block-post-title"><a href="https://example.test/lego/">Lego</a></h3>');
});

it('keeps an existing arrow href and an already linked title', function () {
    $html = '<h3 class="wp-block-post-title"><a href="/a/">Lego</a></h3><div class="kt-project-card__link"><a href="/b/" class="wp-block-button__link">x</a></div>';

    expect(kotlinskidev_link_project_card_elements($html, 'https://example.test/lego/', 'Lego'))->toBe($html);
});

it('returns the markup unchanged without a project url', function () use ($card) {
    expect(kotlinskidev_link_project_card_elements($card, '', 'Lego'))->toBe($card);
});
