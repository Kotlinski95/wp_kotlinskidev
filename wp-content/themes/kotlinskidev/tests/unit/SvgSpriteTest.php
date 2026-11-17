<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/svg-support.php';
require_once __DIR__ . '/../../functions/svg-sprite.php';

function kt_sprite_context(bool $front_end, int $body_open_count): void
{
    Functions\when('is_admin')->justReturn(!$front_end);
    Functions\when('wp_doing_ajax')->justReturn(false);
    Functions\when('is_feed')->justReturn(false);
    Functions\when('did_action')->alias(fn ($hook) => 'wp_body_open' === $hook ? $body_open_count : 0);
    Functions\when('apply_filters')->alias(fn ($hook, $value) => $value);
    Functions\when('esc_attr')->returnArg();
}

const KT_SPRITE_SVG = '<svg aria-hidden="true" class="logo" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0z"/></svg>';

it('replaces an inline svg with a use reference and registers the symbol', function () {
    kt_sprite_context(true, 0);

    $out = kotlinskidev_svg_sprite_reference(9001, KT_SPRITE_SVG);

    expect($out)->toStartWith('<svg aria-hidden="true" class="logo" fill="currentColor"><use href="#kt-svg-9001-');
    expect($out)->not->toContain('<path');
    $symbols = kotlinskidev_svg_sprite_symbols();
    $id      = array_key_last($symbols);
    expect($id)->toStartWith('kt-svg-9001-');
    expect($symbols[$id]['view_box'])->toBe('0 0 24 24');
    expect($symbols[$id]['inner'])->toBe('<path d="M0 0h24v24H0z"/>');
});

it('drops the outer viewBox so a non-zero-origin symbol is not offset', function () {
    kt_sprite_context(true, 0);

    $out = kotlinskidev_svg_sprite_reference(9005, '<svg viewBox="4.5 5 14.6 14.6" width="24"><path d="M5 6h1"/></svg>');

    expect($out)->not->toContain('viewBox');
    expect(array_values(kotlinskidev_svg_sprite_symbols())[count(kotlinskidev_svg_sprite_symbols()) - 1]['view_box'])->toBe('4.5 5 14.6 14.6');
});

it('keeps full inline output once wp_body_open has fired', function () {
    kt_sprite_context(true, 1);

    expect(kotlinskidev_svg_sprite_reference(9002, KT_SPRITE_SVG))->toBeNull();
});

it('keeps full inline output in admin, REST and AJAX contexts', function () {
    kt_sprite_context(false, 0);

    expect(kotlinskidev_svg_sprite_reference(9003, KT_SPRITE_SVG))->toBeNull();
});

it('keeps full inline output when the svg has no viewBox', function () {
    kt_sprite_context(true, 0);

    expect(kotlinskidev_svg_sprite_reference(9004, '<svg width="4"><path d="M0 0"/></svg>'))->toBeNull();
});

it('renders the sprite as one hidden svg with a symbol per id', function () {
    kt_sprite_context(true, 0);

    $markup = kotlinskidev_render_svg_sprite_markup(['kt-svg-1-abc' => ['view_box' => '0 0 1 1', 'inner' => '<path d="M0 0"/>']]);

    expect($markup)->toContain('position:absolute;width:0;height:0');
    expect($markup)->toContain('<symbol id="kt-svg-1-abc" viewBox="0 0 1 1"><path d="M0 0"/></symbol>');
    expect(kotlinskidev_render_svg_sprite_markup([]))->toBe('');
});

it('inlines small or currentColor svg and leaves large plain svg as image', function () {
    kt_sprite_context(true, 0);

    expect(kotlinskidev_should_inline_svg('<svg fill="currentColor">' . str_repeat('a', 5000) . '</svg>'))->toBeTrue();
    expect(kotlinskidev_should_inline_svg('<svg>' . str_repeat('a', 100) . '</svg>'))->toBeTrue();
    expect(kotlinskidev_should_inline_svg('<svg>' . str_repeat('a', 5000) . '</svg>'))->toBeFalse();
});

it('uses a versioned cache key', function () {
    expect(kotlinskidev_svg_cache_key(12))->toBe('kotlinskidev_svg_v2_12');
});
