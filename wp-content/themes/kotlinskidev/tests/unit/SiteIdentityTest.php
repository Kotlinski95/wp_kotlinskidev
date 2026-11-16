<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/site-identity.php';

beforeEach(function () {
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
});

it('leaves content unchanged when there is no custom-logo-link', function () {
    $content = '<a class="wp-block-site-logo__link"><img src="logo.png"></a>';

    expect(kotlinskidev_add_site_logo_aria_label($content))->toBe($content);
});

it('leaves content unchanged when an aria-label is already present', function () {
    $content = '<a class="custom-logo-link" aria-label="Existing"><img src="logo.png"></a>';

    expect(kotlinskidev_add_site_logo_aria_label($content))->toBe($content);
});

it('adds an aria-label with the site name before the custom-logo-link class', function () {
    Functions\when('get_bloginfo')->justReturn('kotlinski.dev');
    $content = '<a class="custom-logo-link"><img src="logo.png"></a>';

    $result = kotlinskidev_add_site_logo_aria_label($content);

    expect($result)->toBe('<a aria-label="kotlinski.dev home" class="custom-logo-link"><img src="logo.png"></a>');
});

it('labels the get_custom_logo markup the same way', function () {
    Functions\when('get_bloginfo')->justReturn('kotlinski.dev');
    $content = '<a href="/" class="custom-logo-link" rel="home"><img class="custom-logo"></a>';

    expect(kotlinskidev_add_site_logo_aria_label($content))->toContain('aria-label="kotlinski.dev home" class="custom-logo-link"');
});

it('labels the link even when the inline svg carries its own aria-label', function () {
    Functions\when('get_bloginfo')->justReturn('kotlinski.dev');
    $content = '<a href="/" class="custom-logo-link" rel="home"><svg role="img" aria-label="logo"></svg></a>';

    expect(kotlinskidev_add_site_logo_aria_label($content))->toContain('<a href="/" aria-label="kotlinski.dev home" class="custom-logo-link"');
});

it('strips the inline svg title so the visible text matches the accessible name', function () {
    Functions\when('get_bloginfo')->justReturn('kotlinski.dev');
    $content = '<a href="/" class="custom-logo-link"><svg><title>KotlinskiDev</title><text>DEV</text></svg></a>';

    $result = kotlinskidev_add_site_logo_aria_label($content);

    expect($result)->not->toContain('<title>');
    expect($result)->toContain('<text>DEV</text>');
});

it('prefixes the label with the svg logo text when the label does not contain it as a word', function () {
    Functions\when('get_bloginfo')->justReturn('Kotlinskidev Web Development');
    $content = '<a href="/" class="custom-logo-link" rel="home"><svg aria-hidden="true"><text class="logo-dev">DEV</text></svg></a>';

    expect(kotlinskidev_add_site_logo_aria_label($content))->toContain('aria-label="DEV – Kotlinskidev Web Development home"');
});

it('keeps the plain label when it already contains the svg logo text', function () {
    Functions\when('get_bloginfo')->justReturn('Kotlinski Dev');
    $content = '<a href="/" class="custom-logo-link" rel="home"><svg aria-hidden="true"><text>DEV</text></svg></a>';

    expect(kotlinskidev_add_site_logo_aria_label($content))->toContain('aria-label="Kotlinski Dev home"');
});
