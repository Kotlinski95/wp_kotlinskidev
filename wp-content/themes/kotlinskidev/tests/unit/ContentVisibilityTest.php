<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/deferred-block-assets.php';
require_once __DIR__ . '/../../functions/content-visibility.php';

function kt_cv_block(string $name, array $attrs = [], array $inner = []): array
{
    return ['blockName' => $name, 'attrs' => $attrs, 'innerBlocks' => $inner];
}

beforeEach(function () {
    Functions\when('is_admin')->justReturn(false);
    Functions\when('is_feed')->justReturn(false);
    Functions\when('is_customize_preview')->justReturn(false);
    Functions\when('wp_is_json_request')->justReturn(false);
    Functions\when('is_singular')->justReturn(true);
    Functions\when('apply_filters')->alias(fn ($hook, $value) => $value);
    Functions\when('get_option')->justReturn(true);
});

it('is off until the kotlinskidev_content_visibility option is switched on', function () {
    Functions\when('get_option')->justReturn(false);
    expect(kotlinskidev_content_visibility_enabled())->toBeFalse();
});

it('is enabled on the front end of a singular page', function () {
    expect(kotlinskidev_content_visibility_enabled())->toBeTrue();
});

it('is disabled in admin, feeds, customizer preview, json requests and non singular views', function () {
    Functions\when('is_admin')->justReturn(true);
    expect(kotlinskidev_content_visibility_enabled())->toBeFalse();
    Functions\when('is_admin')->justReturn(false);
    Functions\when('is_customize_preview')->justReturn(true);
    expect(kotlinskidev_content_visibility_enabled())->toBeFalse();
    Functions\when('is_customize_preview')->justReturn(false);
    Functions\when('is_singular')->justReturn(false);
    expect(kotlinskidev_content_visibility_enabled())->toBeFalse();
});

it('lets the kotlinskidev_content_visibility_enabled filter override the result', function () {
    Functions\when('apply_filters')->alias(fn ($hook, $value) => 'kotlinskidev_content_visibility_enabled' === $hook ? false : $value);
    expect(kotlinskidev_content_visibility_enabled())->toBeFalse();
});

it('adds the class to a plain below the fold block', function () {
    $block = kt_cv_block('core/group');
    expect(kotlinskidev_content_visibility_should_skip($block, '<div class="a">x</div>', [], ''))->toBeFalse();
    expect(kotlinskidev_content_visibility_add_class('<div class="a">x</div>'))->toContain('kt-cv-auto');
});

it('skips blocks that are or contain above the fold blocks', function () {
    $block = kt_cv_block('core/group', [], [kt_cv_block('core/cover')]);
    expect(kotlinskidev_content_visibility_should_skip($block, '<div>x</div>', ['core/cover'], ''))->toBeTrue();
});

it('skips scroll sections, parallax, scroll animations, hero and sticky markup', function (string $html) {
    expect(kotlinskidev_content_visibility_should_skip(kt_cv_block('core/group'), $html, [], ''))->toBeTrue();
})->with([
    '<div class="scroll-section">x</div>',
    '<div class="kt-parallax-bg">x</div>',
    '<div class="fade-in-on-scroll">x</div>',
    '<div class="kt-hero">x</div>',
    '<div style="position: sticky;top:0">x</div>',
    '<div style="position:fixed">x</div>',
]);

it('skips headings and anchored subtrees', function () {
    $heading = kt_cv_block('core/group', [], [kt_cv_block('core/heading')]);
    expect(kotlinskidev_content_visibility_should_skip($heading, '<div>x</div>', [], ''))->toBeTrue();
    $anchored = kt_cv_block('core/group', [], [kt_cv_block('core/group', ['anchor' => 'contact'])]);
    expect(kotlinskidev_content_visibility_should_skip($anchored, '<div>x</div>', [], ''))->toBeTrue();
});

it('skips elements whose id is linked as a fragment in the post content', function () {
    $block = kt_cv_block('core/group');
    expect(kotlinskidev_content_visibility_should_skip($block, '<div id="pricing">x</div>', [], '<a href="#pricing">go</a>'))->toBeTrue();
    expect(kotlinskidev_content_visibility_should_skip($block, '<div id="pricing">x</div>', [], 'nothing'))->toBeFalse();
});

it('skips empty or non element output', function () {
    expect(kotlinskidev_content_visibility_should_skip(kt_cv_block('core/group'), '  ', [], ''))->toBeTrue();
    expect(kotlinskidev_content_visibility_should_skip(kt_cv_block('core/group'), 'text', [], ''))->toBeTrue();
});

it('tags only the footer top group of the footer template part', function () {
    $html = '<footer><div class="kotlinskidev-footer"><div class="kotlinskidev-footer__top">a</div></div></footer>';
    $out  = kotlinskidev_content_visibility_filter_block($html, kt_cv_block('core/template-part', ['slug' => 'footer']));
    expect($out)->toContain('kotlinskidev-footer__top kt-cv-auto');
    expect($out)->not->toContain('<footer class');
});

it('ignores other template parts and nested blocks', function () {
    Functions\when('doing_filter')->justReturn(true);
    $html = '<header>x</header>';
    expect(kotlinskidev_content_visibility_filter_block($html, kt_cv_block('core/template-part', ['slug' => 'header'])))->toBe($html);
    $instance = new class { public $parent = 'p'; };
    expect(kotlinskidev_content_visibility_filter_block('<div>x</div>', kt_cv_block('core/group'), $instance))->toBe('<div>x</div>');
});

it('leaves the first top level block untouched and tags the following ones', function () {
    Functions\when('doing_filter')->justReturn(true);
    Functions\when('get_the_ID')->justReturn(5);
    Functions\when('get_queried_object_id')->justReturn(5);
    Functions\when('get_post')->justReturn(null);
    Functions\when('get_queried_object')->justReturn(null);
    kotlinskidev_content_visibility_reset();
    $block = kt_cv_block('core/group');
    expect(kotlinskidev_content_visibility_filter_block('<div>a</div>', $block))->toBe('<div>a</div>');
    expect(kotlinskidev_content_visibility_filter_block('<div>b</div>', $block))->toContain('kt-cv-auto');
});
