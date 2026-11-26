<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/protection-helpers.php';
require_once __DIR__ . '/../../../functions/contact-card.php';

beforeEach(function () {
    Functions\when('get_option')->alias(fn ($name, $default = false) => match ($name) {
        'kotlinskidev_contact_address' => '40-143 Katowice, ul. Dekerta',
        'kotlinskidev_contact_phone' => '+48 608 418 911',
        'kotlinskidev_contact_email' => 'kotlinskidev@gmail.com',
        'kotlinskidev_contact_hours' => 'Pon.-Pt. 8:00-17:00',
        default => $default,
    });
    Functions\when('esc_html__')->alias(fn ($t) => $t);
    Functions\when('esc_html_e')->alias(function ($t) {
        echo $t;
    });
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_attr__')->alias(fn ($t) => $t);
    Functions\when('update_option')->justReturn(true);
});

it('renders nothing when no contact info is configured', function () {
    Functions\when('get_option')->justReturn('');

    expect(kotlinskidev_render_contact_card_block())->toBe('');
});

it('renders address, hours, phone, and email, protecting the sensitive fields', function () {
    $html = kotlinskidev_render_contact_card_block();

    expect($html)->toContain('kt-contact-card');
    expect($html)->toContain('Pon.-Pt. 8:00-17:00');
    expect($html)->toContain('protected-content--address');
    expect($html)->toContain('protected-content--phone');
    expect($html)->toContain('protected-content--email');
    expect($html)->not->toContain('40-143 Katowice, ul. Dekerta');
    expect($html)->not->toContain('+48 608 418 911');
    expect($html)->not->toContain('kotlinskidev@gmail.com');
});

it('defaults the grid gap custom property to 1.5rem when no gridGap attribute is passed', function () {
    $html = kotlinskidev_render_contact_card_block();

    expect($html)->toContain('--kt-contact-card-gap: 1.5rem');
});

it('reflects a custom gridGap attribute as the grid gap custom property', function () {
    $html = kotlinskidev_render_contact_card_block(['gridGap' => 0.75]);

    expect($html)->toContain('--kt-contact-card-gap: 0.75rem');
});

it('falls back to the default gap for a non-numeric gridGap attribute', function () {
    $html = kotlinskidev_render_contact_card_block(['gridGap' => 'not-a-number']);

    expect($html)->toContain('--kt-contact-card-gap: 1.5rem');
});

it('omits a row entirely when its option is empty', function () {
    Functions\when('get_option')->alias(fn ($name, $default = false) => match ($name) {
        'kotlinskidev_contact_email' => 'kotlinskidev@gmail.com',
        default => '',
    });

    $html = kotlinskidev_render_contact_card_block();

    expect($html)->toContain('protected-content--email');
    expect($html)->not->toContain('protected-content--address');
    expect($html)->not->toContain('protected-content--phone');
});

it('no longer emits a standalone business schema script', function () {
    expect(function_exists('kotlinskidev_output_service_location_business_schema'))->toBeFalse();
});
