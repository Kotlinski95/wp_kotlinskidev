<?php

uses(Tests\Integration\TestCase::class);

it('applies a plain hex text color through core\'s own style engine without duplicating the declaration maliciously', function () {
    $html = render_block([
        'blockName' => 'kotlinskidev/protected-content',
        'attrs' => ['content' => 'Hello', 'style' => ['color' => ['text' => '#ff00aa']]],
        'innerBlocks' => [],
        'innerHTML' => '',
        'innerContent' => [],
    ]);

    expect($html)->toContain('color:#ff00aa');
    expect($html)->not->toMatch('/#ff00aa#ff00aa/');
});

it('applies a light-dark() text color that core\'s own style engine silently drops on its own', function () {
    $html = render_block([
        'blockName' => 'kotlinskidev/protected-content',
        'attrs' => [
            'content' => 'Hello',
            'style' => ['color' => ['text' => 'light-dark(var(--wp--preset--color--foreground-dark), var(--wp--preset--color--foreground-light))']],
        ],
        'innerBlocks' => [],
        'innerHTML' => '',
        'innerContent' => [],
    ]);

    expect($html)->toContain('style="color:light-dark(var(--wp--preset--color--foreground-dark), var(--wp--preset--color--foreground-light));"');
});

it('keeps the merged style attribute valid CSS when core\'s own engine already produced a style with no trailing semicolon', function () {
    $html = render_block([
        'blockName' => 'kotlinskidev/protected-content',
        'attrs' => ['content' => 'Hello', 'style' => ['color' => ['text' => 'var(--wp--preset--color--foreground-contrast)']]],
        'innerBlocks' => [],
        'innerHTML' => '',
        'innerContent' => [],
    ]);

    preg_match('/style="([^"]*)"/', $html, $matches);
    $style = $matches[1] ?? '';

    foreach (explode(';', rtrim($style, ';')) as $declaration) {
        expect($declaration)->toMatch('/^[a-z-]+:[^:]+$/');
    }
});
