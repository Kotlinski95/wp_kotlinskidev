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

it('adds a default xmlns to a root svg tag that lacks one', function () {
    $result = kotlinskidev_add_svg_xmlns('<svg viewBox="0 0 256 256" width="20" height="20"><path d="M0 0"/></svg>');

    expect($result)->toBe('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20"><path d="M0 0"/></svg>');
});

it('leaves an svg with an existing xmlns unchanged', function () {
    $original = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0"/></svg>';

    expect(kotlinskidev_add_svg_xmlns($original))->toBe($original);
});

function kotlinskidev_write_temp_svg(string $contents): string
{
    $path = tempnam(sys_get_temp_dir(), 'kt-svg-');
    file_put_contents($path, $contents);
    return $path;
}

it('reads dimensions from explicit width/height attributes', function () {
    $path = kotlinskidev_write_temp_svg('<svg width="20" height="24" viewBox="0 0 256 256"><path d="M0 0"/></svg>');

    expect(kotlinskidev_get_svg_dimensions($path))->toBe(['width' => 20, 'height' => 24]);

    unlink($path);
});

it('falls back to viewBox dimensions when width/height attributes are absent', function () {
    $path = kotlinskidev_write_temp_svg('<svg viewBox="0 0 256 128"><path d="M0 0"/></svg>');

    expect(kotlinskidev_get_svg_dimensions($path))->toBe(['width' => 256, 'height' => 128]);

    unlink($path);
});

it('returns null when neither width/height nor viewBox are present', function () {
    $path = kotlinskidev_write_temp_svg('<svg><path d="M0 0"/></svg>');

    expect(kotlinskidev_get_svg_dimensions($path))->toBeNull();

    unlink($path);
});

it('rounds fractional width/height values', function () {
    $path = kotlinskidev_write_temp_svg('<svg width="19.6px" height="20.4px"><path d="M0 0"/></svg>');

    expect(kotlinskidev_get_svg_dimensions($path))->toBe(['width' => 20, 'height' => 20]);

    unlink($path);
});
