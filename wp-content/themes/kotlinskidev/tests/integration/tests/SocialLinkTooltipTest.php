<?php

uses(Tests\Integration\TestCase::class);

it('adds the tooltip class and data attribute using the screen-reader label text', function () {
    $html = '<li class="wp-social-link wp-social-link-facebook wp-block-social-link">'
        . '<a href="https://www.facebook.com/adrian.kotlinski.9/" class="wp-block-social-link-anchor">'
        . '<svg aria-hidden="true" focusable="false"></svg>'
        . '<span class="wp-block-social-link-label screen-reader-text">Facebook</span>'
        . '</a></li>';

    $result = kotlinskidev_add_social_link_tooltip($html, ['blockName' => 'core/social-link']);

    expect($result)->toContain('class="wp-block-social-link-anchor kt-tooltip"');
    expect($result)->toContain('data-tooltip="Facebook"');
});

it('leaves the markup untouched when the label is visible (not screen-reader-only)', function () {
    $html = '<li class="wp-social-link wp-social-link-facebook wp-block-social-link">'
        . '<a href="https://www.facebook.com/adrian.kotlinski.9/" class="wp-block-social-link-anchor">'
        . '<svg aria-hidden="true" focusable="false"></svg>'
        . '<span class="wp-block-social-link-label">Facebook</span>'
        . '</a></li>';

    expect(kotlinskidev_add_social_link_tooltip($html, ['blockName' => 'core/social-link']))->toBe($html);
});

it('leaves markup with no label span untouched', function () {
    $html = '<li class="wp-social-link wp-social-link-facebook wp-block-social-link">'
        . '<a href="https://www.facebook.com/adrian.kotlinski.9/" class="wp-block-social-link-anchor">'
        . '<svg aria-hidden="true" focusable="false"></svg>'
        . '</a></li>';

    expect(kotlinskidev_add_social_link_tooltip($html, ['blockName' => 'core/social-link']))->toBe($html);
});

it('is registered on the render_block_core/social-link filter', function () {
    $html = '<li class="wp-social-link wp-social-link-x wp-block-social-link">'
        . '<a href="https://x.com/AdiKotlinski" class="wp-block-social-link-anchor">'
        . '<svg aria-hidden="true" focusable="false"></svg>'
        . '<span class="wp-block-social-link-label screen-reader-text">X</span>'
        . '</a></li>';

    $result = apply_filters('render_block_core/social-link', $html, ['blockName' => 'core/social-link']);

    expect($result)->toContain('data-tooltip="X"');
});
