<?php

uses(Tests\Integration\TestCase::class);

it('leaves the block untouched when there is no groupLinkUrl attribute', function () {
    $blocks = parse_blocks('<!-- wp:group --><div class="wp-block-group">x</div><!-- /wp:group -->');

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('kt-group-link');
});

it('wraps the group as a real anchor when there is no nested link', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"groupLinkUrl":"/contact/"} -->'
        . '<div class="wp-block-group">x</div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toStartWith('<a');
    expect($html)->toEndWith('</a>');
    expect($html)->toContain('kt-group-link');
    expect($html)->toContain('href="/contact/"');
    expect($html)->not->toContain('data-kt-group-link-url');
    expect($html)->not->toContain('role="link"');
    expect($html)->not->toContain('tabindex="0"');
});

it('preserves the wp-block-group class and inner content when wrapping as an anchor', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"groupLinkUrl":"/contact/"} -->'
        . '<div class="wp-block-group has-background">'
        . '<h2>Title</h2><p>Body</p>'
        . '</div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('wp-block-group');
    expect($html)->toContain('has-background');
    expect($html)->toContain('kt-group-link');
    expect($html)->toContain('<h2>Title</h2>');
    expect($html)->toContain('<p>Body</p>');
});

it('adds target and rel on the real anchor when groupLinkOpensInNewTab is set', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"groupLinkUrl":"/contact/","groupLinkOpensInNewTab":true} -->'
        . '<div class="wp-block-group">x</div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('target="_blank"');
    expect($html)->toContain('rel="noopener"');
});

it('escapes the url on the real anchor href', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"groupLinkUrl":"/contact/?a=1&b=2"} -->'
        . '<div class="wp-block-group">x</div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('href="/contact/?a=1&#038;b=2"');
});

it('falls back to the data-attribute + role=link approach when the group contains a nested link', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"groupLinkUrl":"/contact/"} -->'
        . '<div class="wp-block-group"><a href="/other/">Other link</a></div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toStartWith('<div');
    expect($html)->toContain('kt-group-link');
    expect($html)->toContain('data-kt-group-link-url="/contact/"');
    expect($html)->toContain('role="link"');
    expect($html)->toContain('tabindex="0"');
    expect($html)->toContain('href="/other/"');
});

it('adds the data-attribute new-tab target in the fallback path', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"groupLinkUrl":"/contact/","groupLinkOpensInNewTab":true} -->'
        . '<div class="wp-block-group"><a href="/other/">Other link</a></div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('data-kt-group-link-target="_blank"');
});

it('escapes the url in the fallback data attribute', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"groupLinkUrl":"/contact/?a=1&b=2"} -->'
        . '<div class="wp-block-group"><a href="/other/">Other link</a></div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('data-kt-group-link-url="/contact/?a=1&amp;b=2"');
});

it('leaves other blocks untouched even with a groupLinkUrl attribute', function () {
    $html = kotlinskidev_apply_group_link(
        '<div class="wp-block-columns">x</div>',
        ['blockName' => 'core/columns', 'attrs' => ['groupLinkUrl' => '/contact/']]
    );

    expect($html)->not->toContain('kt-group-link');
});
