<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/nav-reveal-render.php';

beforeEach(function () {
    Functions\when('sanitize_html_class')->returnArg(1);
});

it('leaves content untouched for a block outside the nav-scoped allow-list', function () {
    $content = '<li class="wp-block-navigation-item">Hi</li>';

    $result = kotlinskidev_apply_nav_reveal_attrs($content, [
        'blockName' => 'core/paragraph',
        'attrs' => ['navRevealAnimation' => 'appear-on-reveal'],
    ]);

    expect($result)->toBe($content);
});

it('leaves content untouched when no animation is set', function () {
    $content = '<li class="wp-block-navigation-item">Hi</li>';

    expect(kotlinskidev_apply_nav_reveal_attrs($content, ['blockName' => 'core/navigation-link', 'attrs' => []]))->toBe($content);
});

it('leaves empty content untouched', function () {
    $result = kotlinskidev_apply_nav_reveal_attrs('', [
        'blockName' => 'core/navigation-link',
        'attrs' => ['navRevealAnimation' => 'appear-on-reveal'],
    ]);

    expect($result)->toBe('');
});

it('appends the animation class to the rendered tag', function () {
    $content = '<li class="wp-block-navigation-item">Hi</li>';

    $result = kotlinskidev_apply_nav_reveal_attrs($content, [
        'blockName' => 'core/navigation-link',
        'attrs' => ['navRevealAnimation' => 'appear-on-reveal'],
    ]);

    expect($result)->toContain('class="wp-block-navigation-item appear-on-reveal"');
});

it('adds the distance class when a translate value is set', function () {
    $content = '<li class="wp-block-navigation-item">Hi</li>';

    $result = kotlinskidev_apply_nav_reveal_attrs($content, [
        'blockName' => 'core/navigation-submenu',
        'attrs' => ['navRevealAnimation' => 'fade-up-on-reveal', 'navRevealTranslate' => 'translate-lg'],
    ]);

    expect($result)->toContain('fade-up-on-reveal translate-lg');
});

it('sets the --reveal-delay custom property when a delay is configured', function () {
    $content = '<li class="wp-block-navigation-item">Hi</li>';

    $result = kotlinskidev_apply_nav_reveal_attrs($content, [
        'blockName' => 'kotlinskidev/nav-link',
        'attrs' => ['navRevealAnimation' => 'appear-on-reveal', 'navRevealDelay' => 120],
    ]);

    expect($result)->toContain('style="--reveal-delay:120ms;"');
});

it('does not add a style attribute when there is no delay', function () {
    $content = '<li class="wp-block-navigation-item">Hi</li>';

    $result = kotlinskidev_apply_nav_reveal_attrs($content, [
        'blockName' => 'core/navigation-link',
        'attrs' => ['navRevealAnimation' => 'appear-on-reveal'],
    ]);

    expect($result)->not->toContain('style=');
});

it('preserves an existing style attribute and appends the delay', function () {
    $content = '<li class="wp-block-navigation-item" style="color:red;">Hi</li>';

    $result = kotlinskidev_apply_nav_reveal_attrs($content, [
        'blockName' => 'core/navigation-link',
        'attrs' => ['navRevealAnimation' => 'appear-on-reveal', 'navRevealDelay' => 60],
    ]);

    expect($result)->toContain('style="color:red;--reveal-delay:60ms;"');
});

it('stagger: leaves content untouched when no animation is set', function () {
    $content = '<li class="kt-popular-pages__item">A</li><li class="kt-popular-pages__item">B</li>';

    expect(kotlinskidev_stagger_reveal_items($content, '', ['kt-popular-pages__item']))->toBe($content);
});

it('stagger: leaves empty content untouched', function () {
    expect(kotlinskidev_stagger_reveal_items('', 'appear-on-reveal', ['kt-popular-pages__item']))->toBe('');
});

it('stagger: only tags the items matching the class marker, not unrelated tags', function () {
    $content = '<p class="kt-popular-pages__title">Popular</p><li class="kt-popular-pages__item">A</li>';

    $result = kotlinskidev_stagger_reveal_items($content, 'appear-on-reveal', ['kt-popular-pages__item']);

    expect($result)->toContain('<p class="kt-popular-pages__title">Popular</p>');
    expect($result)->toContain('class="kt-popular-pages__item appear-on-reveal"');
});

it('stagger: increments the delay per matched item, starting at zero', function () {
    $content = '<li class="kt-popular-pages__item">A</li><li class="kt-popular-pages__item">B</li><li class="kt-popular-pages__item">C</li>';

    $result = kotlinskidev_stagger_reveal_items($content, 'appear-on-reveal', ['kt-popular-pages__item']);

    expect($result)->toContain('class="kt-popular-pages__item appear-on-reveal">A');
    expect($result)->not->toContain('style="--reveal-delay:0ms;"');
    expect($result)->toContain('style="--reveal-delay:60ms;">B');
    expect($result)->toContain('style="--reveal-delay:120ms;">C');
});

it('stagger: does not match an element whose class merely starts with the marker as a substring (BEM modifier false-positive)', function () {
    $content = '<li class="wp-block-navigation-item">'
        . '<a class="wp-block-navigation-item__content">A</a>'
        . '<span class="wp-block-navigation-item__label">A label</span>'
        . '</li>';

    $result = kotlinskidev_stagger_reveal_items($content, 'appear-on-reveal', ['wp-block-navigation-item']);

    expect($result)->toContain('class="wp-block-navigation-item appear-on-reveal"');
    expect($result)->toContain('class="wp-block-navigation-item__content">A<');
    expect($result)->toContain('class="wp-block-navigation-item__label">A label<');
});

it('stagger: respects a custom step', function () {
    $content = '<li class="kt-popular-pages__item">A</li><li class="kt-popular-pages__item">B</li>';

    $result = kotlinskidev_stagger_reveal_items($content, 'appear-on-reveal', ['kt-popular-pages__item'], 25);

    expect($result)->toContain('style="--reveal-delay:25ms;"');
});
