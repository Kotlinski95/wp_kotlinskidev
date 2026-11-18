<?php

use Brain\Monkey\Functions;

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

require_once __DIR__ . '/../../functions/mobile-parallax.php';

it('adds the kt-mobile-parallax body class by default', function () {
    Functions\when('get_option')->alias(fn ($name, $default = false) => $default);

    expect(kotlinskidev_mobile_parallax_body_class(['home']))->toBe(['home', 'kt-mobile-parallax']);
});

it('leaves the body classes untouched when the option is off', function () {
    Functions\when('get_option')->alias(fn ($name, $default = false) => 'kotlinskidev_mobile_parallax' === $name ? false : $default);

    expect(kotlinskidev_mobile_parallax_body_class(['home']))->toBe(['home']);
});
