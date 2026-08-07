<?php

uses(Tests\Integration\TestCase::class);

it('sanitizes an empty or 0px spacing value to an empty string', function () {
    expect(kotlinskidev_sanitize_spacing_length('', false))->toBe('');
    expect(kotlinskidev_sanitize_spacing_length('0px', false))->toBe('');
});

it('accepts a valid spacing value with a supported unit', function () {
    expect(kotlinskidev_sanitize_spacing_length('10px', false))->toBe('10px');
    expect(kotlinskidev_sanitize_spacing_length('1.5rem', false))->toBe('1.5rem');
    expect(kotlinskidev_sanitize_spacing_length('50%', false))->toBe('50%');
});

it('rejects a value with an unsupported or missing unit', function () {
    expect(kotlinskidev_sanitize_spacing_length('10', false))->toBe('');
    expect(kotlinskidev_sanitize_spacing_length('10cm', false))->toBe('');
    expect(kotlinskidev_sanitize_spacing_length('auto', false))->toBe('');
});

it('rejects a negative value when negatives are not allowed (padding)', function () {
    expect(kotlinskidev_sanitize_spacing_length('-10px', false))->toBe('');
});

it('accepts a negative value when negatives are allowed (margin)', function () {
    expect(kotlinskidev_sanitize_spacing_length('-10px', true))->toBe('-10px');
});

it('collects only the sanitized, non-empty sides across devices and properties', function () {
    $values = kotlinskidev_collect_responsive_spacing_values([
        'desktopPadding' => ['top' => '10px', 'right' => 'not-a-length', 'bottom' => '', 'left' => '5px'],
        'desktopMargin' => ['top' => '-5px'],
        'tabletPadding' => ['top' => '20px'],
    ]);

    expect($values['desktop']['padding'])->toBe(['top' => '10px', 'left' => '5px']);
    expect($values['desktop']['margin'])->toBe(['top' => '-5px']);
    expect($values['tablet']['padding'])->toBe(['top' => '20px']);
    expect($values)->not->toHaveKey('mobile');
});

it('rejects a negative padding value even inside the collector (padding never allows negatives)', function () {
    $values = kotlinskidev_collect_responsive_spacing_values([
        'desktopPadding' => ['top' => '-10px'],
    ]);

    expect($values)->toBe([]);
});

it('returns an empty array when no recognized spacing attributes are present', function () {
    expect(kotlinskidev_collect_responsive_spacing_values(['someOtherAttr' => true]))->toBe([]);
});

it('generates a deterministic class name for identical values', function () {
    $values = ['desktop' => ['padding' => ['top' => '10px']]];

    expect(kotlinskidev_responsive_spacing_class($values))->toBe(kotlinskidev_responsive_spacing_class($values));
});

it('generates different class names for different values', function () {
    $a = kotlinskidev_responsive_spacing_class(['desktop' => ['padding' => ['top' => '10px']]]);
    $b = kotlinskidev_responsive_spacing_class(['desktop' => ['padding' => ['top' => '20px']]]);

    expect($a)->not->toBe($b);
});

it('prefixes the generated class name with kt-rspc-', function () {
    expect(kotlinskidev_responsive_spacing_class(['desktop' => ['padding' => ['top' => '10px']]]))
        ->toStartWith('kt-rspc-');
});

it('builds scoped css declarations only for devices with values', function () {
    $css = kotlinskidev_build_responsive_spacing_css('kt-rspc-test', [
        'desktop' => ['padding' => ['top' => '10px', 'left' => '5px']],
    ]);

    expect($css)->toContain('.kt-rspc-test{padding-top:10px;padding-left:5px;}');
    expect(substr_count($css, '.kt-rspc-test{'))->toBe(1);
});

it('leaves a block with no attributes untouched', function () {
    expect(kotlinskidev_apply_responsive_spacing_style('<div class="wp-block-group">x</div>', ['attrs' => []]))
        ->toBe('<div class="wp-block-group">x</div>');
});

it('adds the spacing class and an inline style tag for a block with valid responsive spacing', function () {
    $blocks = parse_blocks(
        '<!-- wp:group ' . wp_json_encode(['desktopPadding' => ['top' => '10px']]) . ' -->'
        . '<div class="wp-block-group">x</div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('kt-rspc-');
    expect($html)->toContain('<style>');
    expect($html)->toContain('padding-top:10px');
});

it('is registered on the render_block filter', function () {
    expect(has_filter('render_block', 'kotlinskidev_apply_responsive_spacing_style'))->not->toBeFalse();
});
