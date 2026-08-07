<?php

require_once __DIR__ . '/../../functions/svg-support.php';

it('returns an empty string for empty input', function () {
    expect(kotlinskidev_sanitize_svg(''))->toBe('');
    expect(kotlinskidev_sanitize_svg('   '))->toBe('');
});

it('returns an empty string for non-SVG XML', function () {
    expect(kotlinskidev_sanitize_svg('<root><child/></root>'))->toBe('');
});

it('returns an empty string for malformed XML', function () {
    expect(kotlinskidev_sanitize_svg('<svg><unclosed></svg>'))->toBe('');
});

it('strips script tags', function () {
    $result = kotlinskidev_sanitize_svg('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><circle r="5"/></svg>');

    expect($result)->not->toContain('script');
    expect($result)->toContain('circle');
});

it('strips foreignObject, iframe, embed, object, link, meta, base, and style tags', function () {
    $disallowed = ['foreignObject', 'iframe', 'embed', 'object', 'link', 'meta', 'base', 'style'];

    foreach ($disallowed as $tag) {
        $result = kotlinskidev_sanitize_svg("<svg xmlns=\"http://www.w3.org/2000/svg\"><{$tag}></{$tag}><circle r=\"5\"/></svg>");

        expect(strtolower($result))->not->toContain(strtolower($tag));
    }
});

it('strips on* event handler attributes', function () {
    $result = kotlinskidev_sanitize_svg('<svg xmlns="http://www.w3.org/2000/svg"><circle r="5" onclick="alert(1)" onmouseover="evil()"/></svg>');

    expect($result)->not->toContain('onclick');
    expect($result)->not->toContain('onmouseover');
});

it('strips unsafe href/xlink:href/src values but keeps fragment and data:image URLs', function () {
    $result = kotlinskidev_sanitize_svg(
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
            . '<a href="javascript:alert(1)"><circle r="1"/></a>'
            . '<a href="#safe-fragment"><circle r="2"/></a>'
            . '<image xlink:href="data:image/png;base64,AAAA"/>'
            . '</svg>'
    );

    expect($result)->not->toContain('javascript:');
    expect($result)->toContain('#safe-fragment');
    expect($result)->toContain('data:image/png;base64,AAAA');
});

it('preserves safe structural markup and attributes', function () {
    $result = kotlinskidev_sanitize_svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="currentColor"/></svg>');

    expect($result)->toContain('viewBox="0 0 24 24"');
    expect($result)->toContain('fill="currentColor"');
});
