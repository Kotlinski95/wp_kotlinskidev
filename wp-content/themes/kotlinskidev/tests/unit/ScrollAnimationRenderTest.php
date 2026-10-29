<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/scroll-animation-render.php';

beforeEach(function () {
    Functions\when('sanitize_html_class')->returnArg(1);
});

it('leaves content untouched when no animation is set', function () {
    $content = '<div class="wp-block-kotlinskidev-holder">Hi</div>';

    expect(kotlinskidev_apply_scroll_animation_classes($content, ['attrs' => []]))->toBe($content);
});

it('leaves empty content untouched', function () {
    $result = kotlinskidev_apply_scroll_animation_classes('', [
        'attrs' => ['scrollAnimation' => 'fade-up-on-scroll'],
    ]);

    expect($result)->toBe('');
});

it('appends the animation class onto the rendered root tag of a dynamic block', function () {
    $content = '<div class="wp-block-kotlinskidev-holder">Hi</div>';

    $result = kotlinskidev_apply_scroll_animation_classes($content, [
        'attrs' => ['scrollAnimation' => 'fade-up-on-scroll'],
    ]);

    expect($result)->toContain('class="wp-block-kotlinskidev-holder fade-up-on-scroll"');
});

it('appends the delay and distance classes too', function () {
    $content = '<div class="wp-block-kotlinskidev-holder">Hi</div>';

    $result = kotlinskidev_apply_scroll_animation_classes($content, [
        'attrs' => [
            'scrollAnimation' => 'fade-up-on-scroll',
            'scrollAnimationDelay' => 'delay-300',
            'scrollAnimationTranslate' => 'translate-lg',
        ],
    ]);

    expect($result)->toContain('fade-up-on-scroll delay-300 translate-lg');
});

it('does not duplicate the class when the saved static markup already carries it', function () {
    $content = '<p class="fade-up-on-scroll delay-300 wp-block-paragraph">Hi</p>';

    $result = kotlinskidev_apply_scroll_animation_classes($content, [
        'attrs' => ['scrollAnimation' => 'fade-up-on-scroll', 'scrollAnimationDelay' => 'delay-300'],
    ]);

    expect(substr_count($result, 'fade-up-on-scroll'))->toBe(1);
});
