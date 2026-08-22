<?php

require_once __DIR__ . '/../../functions/group-link.php';

it('leaves content untouched when there is no groupLinkUrl set', function () {
    $content = '<div class="wp-block-group">Hi</div>';

    expect(kotlinskidev_apply_group_link($content, ['blockName' => 'core/group', 'attrs' => []]))->toBe($content);
});

it('leaves content untouched when the block content is empty', function () {
    expect(kotlinskidev_apply_group_link('', ['blockName' => 'core/group', 'attrs' => ['groupLinkUrl' => '/contact/']]))->toBe('');
});

it('leaves non-group blocks untouched even with a groupLinkUrl set', function () {
    $content = '<div class="wp-block-columns">Hi</div>';
    $block = ['blockName' => 'core/columns', 'attrs' => ['groupLinkUrl' => '/contact/']];

    expect(kotlinskidev_apply_group_link($content, $block))->toBe($content);
});

it('detects a nested anchor tag', function () {
    expect(kotlinskidev_group_link_has_nested_anchor('<p>Text <a href="/x/">link</a></p>'))->toBeTrue();
});

it('does not false-positive on an unrelated attribute containing "a"', function () {
    expect(kotlinskidev_group_link_has_nested_anchor('<p class="alpha">Text</p>'))->toBeFalse();
});

it('does not detect an anchor when there is none', function () {
    expect(kotlinskidev_group_link_has_nested_anchor('<p>Text <button>Click</button></p>'))->toBeFalse();
});
