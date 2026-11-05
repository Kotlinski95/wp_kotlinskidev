<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/responsive-order.php';

beforeEach(function () {
    Functions\when('esc_attr')->alias(fn ($t) => $t);
});

it('leaves content unchanged when there is no responsiveOrder attribute', function () {
    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_add_responsive_order_attributes($content, ['attrs' => []]))->toBe($content);
});

it('leaves content unchanged when every device value is zero', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['responsiveOrder' => ['desktop' => 0, 'tablet' => 0, 'mobile' => 0]]];

    expect(kotlinskidev_add_responsive_order_attributes($content, $block))->toBe($content);
});

it('appends an order class to an existing class attribute', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['responsiveOrder' => ['desktop' => 2]]];

    $result = kotlinskidev_add_responsive_order_attributes($content, $block);

    expect($result)->toBe('<div class="wp-block order-desktop-2">Hi</div>');
});

it('combines classes for every device that has a non-zero value', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['responsiveOrder' => ['desktop' => 2, 'tablet' => -1, 'mobile' => 5]]];

    $result = kotlinskidev_add_responsive_order_attributes($content, $block);

    expect($result)->toBe('<div class="wp-block order-desktop-2 order-tablet--1 order-mobile-5">Hi</div>');
});

it('adds a fresh class attribute when the element has none', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['responsiveOrder' => ['desktop' => 3]]];

    $result = kotlinskidev_add_responsive_order_attributes($content, $block);

    expect($result)->toBe('<div class="order-desktop-3">Hi</div>');
});

it('excludes a device value above the allowed range', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['responsiveOrder' => ['desktop' => 21]]];

    expect(kotlinskidev_add_responsive_order_attributes($content, $block))->toBe($content);
});

it('excludes a device value below the allowed range', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['responsiveOrder' => ['desktop' => -2]]];

    expect(kotlinskidev_add_responsive_order_attributes($content, $block))->toBe($content);
});

it('accepts the boundary value -1', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['responsiveOrder' => ['desktop' => -1]]];

    $result = kotlinskidev_add_responsive_order_attributes($content, $block);

    expect($result)->toBe('<div class="wp-block order-desktop--1">Hi</div>');
});
