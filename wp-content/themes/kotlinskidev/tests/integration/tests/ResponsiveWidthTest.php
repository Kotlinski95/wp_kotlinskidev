<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_group_render(array $attrs): string
{
    $blocks = parse_blocks(
        '<!-- wp:group ' . wp_json_encode($attrs) . ' -->'
        . '<div class="wp-block-group">content</div>'
        . '<!-- /wp:group -->'
    );

    return render_block($blocks[0]);
}

it('rejects an unrecognized css length unit', function () {
    expect(kotlinskidev_sanitize_css_length('10xyz'))->toBe('');
});

it('accepts a valid px length', function () {
    expect(kotlinskidev_sanitize_css_length('10px'))->toBe('10px');
});

it('passes through auto and none unchanged', function () {
    expect(kotlinskidev_sanitize_css_length('auto'))->toBe('auto');
    expect(kotlinskidev_sanitize_css_length('none'))->toBe('none');
});

it('leaves the block untouched when there is no responsiveWidth attribute', function () {
    $html = kotlinskidev_group_render([]);

    expect($html)->not->toContain('kt-has-responsive-width');
});

it('adds the responsive width class and css variables for each configured device', function () {
    $html = kotlinskidev_group_render([
        'responsiveWidth' => [
            'desktop' => ['width' => '80%', 'maxWidth' => '60rem'],
            'mobile'  => ['width' => '100%'],
        ],
    ]);

    expect($html)->toContain('kt-has-responsive-width');
    expect($html)->toContain('--kt-width-desktop:80%');
    expect($html)->toContain('--kt-max-width-desktop:60rem');
    expect($html)->toContain('--kt-width-mobile:100%');
});

it('applies a css sizing keyword width through the real block pipeline', function () {
    $html = kotlinskidev_group_render([
        'responsiveWidth' => [
            'desktop' => ['width' => 'fit-content', 'maxWidth' => 'max-content'],
        ],
    ]);

    expect($html)->toContain('kt-has-responsive-width');
    expect($html)->toContain('--kt-width-desktop:fit-content');
    expect($html)->toContain('--kt-max-width-desktop:max-content');
});

it('leaves the block untouched when every device value is invalid', function () {
    $html = kotlinskidev_group_render(['responsiveWidth' => ['desktop' => ['width' => 'not-a-length']]]);

    expect($html)->not->toContain('kt-has-responsive-width');
});
