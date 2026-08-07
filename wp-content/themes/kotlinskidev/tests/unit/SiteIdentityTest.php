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
