<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/svg-support.php';
require_once __DIR__ . '/../../functions/blocks.php';
require_once __DIR__ . '/../../functions/icon-extension.php';

function kotlinskidev_mock_icon_svg(string $svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>'): void
{
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn($svg);
}

it('leaves the block content unchanged for a block that is not in the allowlist', function () {
    $content = '<a href="https://example.test">Link</a>';

    $result = kotlinskidev_apply_icon_extension($content, [
        'blockName' => 'core/paragraph',
        'attrs'     => ['iconId' => 5],
    ]);

    expect($result)->toBe($content);
});

it('leaves the block content unchanged when iconId is missing', function () {
    $content = '<a href="https://example.test">Link</a>';

    $result = kotlinskidev_apply_icon_extension($content, [
        'blockName' => 'kotlinskidev/button',
        'attrs'     => [],
    ]);

    expect($result)->toBe($content);
});

it('leaves the block content unchanged when the icon does not resolve', function () {
    Functions\when('get_post_mime_type')->justReturn('image/png');
    $content = '<a href="https://example.test">Link</a>';

    $result = kotlinskidev_apply_icon_extension($content, [
        'blockName' => 'kotlinskidev/button',
        'attrs'     => ['iconId' => 5],
    ]);

    expect($result)->toBe($content);
});

it('splices the icon right after the opening anchor tag', function () {
    kotlinskidev_mock_icon_svg();
    $content = '<a class="kt-nav-link" href="https://example.test">Label</a>';

    $result = kotlinskidev_apply_icon_extension($content, [
        'blockName' => 'kotlinskidev/nav-link',
        'attrs'     => ['iconId' => 5],
    ]);

    expect($result)->toBe(
        '<a class="kt-nav-link" href="https://example.test"><span class="kt-icon kt-icon--inline">'
        . '<svg aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>'
        . '</span>Label</a>'
    );
});

it('splices the icon right after the opening button tag', function () {
    kotlinskidev_mock_icon_svg('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    $content = '<button type="submit">Send</button>';

    $result = kotlinskidev_apply_icon_extension($content, [
        'blockName' => 'kotlinskidev/button',
        'attrs'     => ['iconId' => 5],
    ]);

    expect($result)->toBe(
        '<button type="submit"><span class="kt-icon kt-icon--inline">'
        . '<svg aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg"></svg>'
        . '</span>Send</button>'
    );
});

it('only touches the first tag, leaving a nested child link untouched', function () {
    kotlinskidev_mock_icon_svg('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    $content = '<a href="https://example.test">Parent'
        . '<ul><li><a href="https://child.test">Child</a></li></ul></a>';

    $result = kotlinskidev_apply_icon_extension($content, [
        'blockName' => 'core/navigation-submenu',
        'attrs'     => ['iconId' => 5],
    ]);

    expect($result)->toContain('<a href="https://example.test"><span class="kt-icon kt-icon--inline">');
    expect($result)->toContain('<a href="https://child.test">Child</a>');
    expect(substr_count($result, 'kt-icon--inline'))->toBe(1);
});
