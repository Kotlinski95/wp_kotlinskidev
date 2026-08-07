<?php

uses(Tests\Integration\TestCase::class);

it('declares custom-logo theme support with flexible dimensions', function () {
    expect(current_theme_supports('custom-logo'))->toBeTrue();

    $args = get_theme_support('custom-logo')[0];

    expect($args['width'])->toBe(200);
    expect($args['height'])->toBe(100);
    expect($args['flex-width'])->toBeTrue();
    expect($args['flex-height'])->toBeTrue();
});

it('adds an aria-label to the site logo link when one is missing', function () {
    update_option('blogname', 'Kotlinski Dev');

    $html = kotlinskidev_add_site_logo_aria_label('<a href="/" class="custom-logo-link">logo</a>');

    expect($html)->toContain('aria-label="Kotlinski Dev home"');
});

it('leaves the site logo markup untouched when it already has an aria-label', function () {
    $html = '<a href="/" class="custom-logo-link" aria-label="Existing label">logo</a>';

    expect(kotlinskidev_add_site_logo_aria_label($html))->toBe($html);
});

it('leaves non-logo block content untouched', function () {
    $html = '<div class="wp-block-paragraph">Hello</div>';

    expect(kotlinskidev_add_site_logo_aria_label($html))->toBe($html);
});
