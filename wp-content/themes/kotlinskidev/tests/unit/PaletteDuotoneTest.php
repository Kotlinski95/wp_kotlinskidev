<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/palette-duotone.php';

beforeEach(function () {
    Functions\when('__')->returnArg(1);
    Functions\when('esc_attr')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));
});

it('ships the three default duotones', function () {
    expect(array_keys(kotlinskidev_palette_duotones()))
        ->toBe(['duotone-primary', 'duotone-primary-solid', 'duotone-primary-soft', 'duotone-foreground']);
});

it('only references palette slugs that exist in theme.json', function () {
    $theme   = json_decode(file_get_contents(__DIR__ . '/../../theme.json'), true);
    $palette = array_column($theme['settings']['color']['palette'], 'slug');

    foreach (kotlinskidev_palette_duotones() as $preset) {
        expect($palette)->toContain($preset['shadow']);
        expect($palette)->toContain($preset['highlight']);
    }
});

it('keeps theme.json imageFilterColors in sync with the registry', function () {
    $theme   = json_decode(file_get_contents(__DIR__ . '/../../theme.json'), true);
    $entries = $theme['settings']['custom']['imageFilterColors'];
    $json    = array_values(array_filter(array_keys($entries), fn ($s) => str_starts_with($s, 'duotone-')));

    expect($json)->toEqualCanonicalizing(array_keys(kotlinskidev_palette_duotones()));

    foreach (kotlinskidev_palette_duotones() as $slug => $preset) {
        expect($entries[$slug])->toBe(['light' => "url(#kt-$slug)", 'dark' => "url(#kt-$slug)"]);
    }
});

it('drops registry entries with unsafe slugs or missing colours', function () {
    Functions\when('apply_filters')->alias(fn ($tag, $value) => [
        'ok-one'      => ['shadow' => 'contrast', 'highlight' => 'primary'],
        'Bad Slug'    => ['shadow' => 'contrast', 'highlight' => 'primary'],
        'bad"quote'   => ['shadow' => 'contrast', 'highlight' => 'primary'],
        'no-hi'       => ['shadow' => 'contrast'],
        'bad-colour'  => ['shadow' => 'x);}<', 'highlight' => 'primary'],
        'too-long-' . str_repeat('a', 70) => ['shadow' => 'contrast', 'highlight' => 'primary'],
    ]);

    expect(array_keys(kotlinskidev_palette_duotones()))->toBe(['ok-one']);
});

it('returns an empty registry when the filter returns a non-array', function () {
    Functions\when('apply_filters')->justReturn('nope');

    expect(kotlinskidev_palette_duotones())->toBe([]);
    expect(kotlinskidev_palette_duotone_svg())->toBe('');
});

it('prints one hidden aria-hidden svg with a palette-driven filter per preset', function () {
    ob_start();
    kotlinskidev_render_palette_duotone_svg();
    $output = ob_get_clean();

    expect(substr_count($output, '<svg'))->toBe(1);
    expect($output)->toContain('aria-hidden="true"');
    expect($output)->toContain('width="0" height="0"');
    expect($output)->toContain('position:absolute');
    expect(substr_count($output, '<filter '))->toBe(4);
    expect($output)->toContain('id="kt-duotone-primary"');
    expect($output)->toContain('color-interpolation-filters="sRGB"');
    expect($output)->toContain('flood-color:var(--wp--preset--color--primary)');
    expect($output)->toContain('flood-color:var(--wp--preset--color--contrast)');
    expect($output)->toContain('mode="multiply"');
    expect($output)->toContain('operator="arithmetic" k1="0" k2="1" k3="1" k4="0"');
    expect($output)->toContain('operator="in"');
    expect($output)->toContain('in2="SourceAlpha"');
    expect($output)->toContain('values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0"');
});

it('exposes labels for presets that define one', function () {
    expect(kotlinskidev_palette_duotone_labels()['duotone-primary'])->toBe('Duotone · Primary');
});
