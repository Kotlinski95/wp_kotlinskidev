<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/block-styles.php';

beforeEach(function () {
    kotlinskidev_block_style_collected(null, true);
    Functions\when('apply_filters')->alias(fn ($tag, $default) => $default);
    Functions\when('is_admin')->justReturn(false);
    Functions\when('get_template_directory')->justReturn(dirname(__DIR__, 2));
    Functions\when('is_singular')->justReturn(false);
    Functions\when('is_home')->justReturn(false);
    Functions\when('is_archive')->justReturn(false);
    Functions\when('is_search')->justReturn(false);
    Functions\when('is_page')->justReturn(false);
    Functions\when('is_404')->justReturn(false);
});

it('ships a registry whose sources and dependencies exist', function () {
    $registry = kotlinskidev_get_block_style_registry();

    expect($registry)->not->toBeEmpty();
    foreach ($registry as $definition) {
        foreach ((array) $definition['src'] as $source) {
            expect(file_exists(dirname(__DIR__, 2) . '/' . $source))->toBeTrue();
        }
        foreach ($definition['deps'] ?? array() as $dependency) {
            expect($registry)->toHaveKey($dependency);
        }
    }
});

it('collects a style by block name', function () {
    kotlinskidev_collect_block_styles('<div></div>', array('blockName' => 'kotlinskidev/device-frame', 'attrs' => array()));

    expect(kotlinskidev_get_active_block_style_keys())->toBe(array('panels', 'device-frame'));
});

it('collects a style by className token', function () {
    kotlinskidev_collect_block_styles('<div></div>', array('blockName' => 'core/group', 'attrs' => array('className' => 'foo career-timeline')));

    expect(kotlinskidev_get_active_block_style_keys())->toBe(array('panels', 'timeline'));
});

it('collects a style by className prefix', function () {
    kotlinskidev_collect_block_styles('<div></div>', array('blockName' => 'core/group', 'attrs' => array('className' => 'kt-bg-fx-aurora')));

    expect(kotlinskidev_get_active_block_style_keys())->toBe(array('panels', 'background-effects'));
});

it('collects a style by truthy attribute', function () {
    kotlinskidev_collect_block_styles('<div></div>', array('blockName' => 'core/group', 'attrs' => array('loadMore' => array('enabled' => true))));

    expect(kotlinskidev_get_active_block_style_keys())->toBe(array('panels', 'post-card', 'load-more'));
});

it('ignores empty block output and unrelated blocks', function () {
    kotlinskidev_collect_block_styles('  ', array('blockName' => 'kotlinskidev/device-frame', 'attrs' => array()));
    kotlinskidev_collect_block_styles('<p></p>', array('blockName' => 'core/paragraph', 'attrs' => array('className' => 'plain')));

    expect(kotlinskidev_get_active_block_style_keys())->toBe(array('panels'));
});

it('adds dependencies and keeps registry order', function () {
    kotlinskidev_collect_block_styles('<div></div>', array('blockName' => 'kotlinskidev/project-card', 'attrs' => array()));

    expect(kotlinskidev_get_active_block_style_keys())->toBe(array('panels', 'image-hover-overlay', 'project-card'));
});

it('activates styles from template conditionals', function () {
    Functions\when('is_404')->justReturn(true);
    Functions\when('is_singular')->alias(fn ($type) => 'kt_certificate' === $type);

    expect(kotlinskidev_get_active_block_style_keys())->toBe(array('panels', 'certificate', 'not-found'));
});

it('names handles and files from the registry key', function () {
    expect(kotlinskidev_block_style_handle('cover'))->toBe('kotlinskidev-block-cover');
    expect(kotlinskidev_block_style_file('cover'))->toBe('blocks/cover.css');
    expect(kotlinskidev_get_block_style_link_handles())->toContain('kotlinskidev-block-cover');
});

it('inlines styles flagged inline whenever they are active', function () {
    Functions\when('get_queried_object')->justReturn(null);
    Functions\when('is_singular')->justReturn(false);
    require_once __DIR__ . '/../../functions/deferred-block-assets.php';
    kotlinskidev_collect_block_styles('<div></div>', array('blockName' => 'kotlinskidev/device-frame', 'attrs' => array()));
    kotlinskidev_collect_block_styles('<div></div>', array('blockName' => 'kotlinskidev/contact-card', 'attrs' => array()));

    expect(kotlinskidev_get_above_fold_block_style_keys())->toBe(array('device-frame'));
});

it('always activates the panels style', function () {
    expect(kotlinskidev_get_active_block_style_keys())->toBe(array('panels'));
});

it('inlines the post-card and search-results-grid styles on search templates', function () {
    Functions\when('is_search')->justReturn(true);
    require_once __DIR__ . '/../../functions/deferred-block-assets.php';

    expect(kotlinskidev_get_above_fold_block_style_keys())->toBe(array('post-card', 'search-results-grid'));
});
