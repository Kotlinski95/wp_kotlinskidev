<?php

use Brain\Monkey\Functions;

if (!class_exists('WP_Theme_JSON_Data')) {
    class WP_Theme_JSON_Data
    {
        public function __construct(private array $data)
        {
        }

        public function get_data(): array
        {
            return $this->data;
        }

        public function update_with(array $new_data): static
        {
            return new static($new_data);
        }
    }
}

require_once __DIR__ . '/../../functions/theme-json-trim-presets.php';

beforeEach(function () {
    Functions\when('apply_filters')->alias(fn ($hook, $value) => $value);
});

it('empties the default color palette, gradients and duotone presets while keeping the origin key', function () {
    $data = new WP_Theme_JSON_Data([
        'settings' => ['color' => [
            'palette'   => ['default' => [['slug' => 'black']]],
            'gradients' => ['default' => [['slug' => 'midnight']]],
            'duotone'   => ['default' => [['slug' => 'grayscale']]],
        ]],
    ]);

    $result = kotlinskidev_trim_default_theme_json_presets($data)->get_data();

    expect($result['settings']['color'])->toBe([
        'palette'   => ['default' => []],
        'gradients' => ['default' => []],
        'duotone'   => ['default' => []],
    ]);
});

it('drops only the unused default shadow presets and keeps the origin key', function () {
    $data = new WP_Theme_JSON_Data([
        'settings' => ['shadow' => ['presets' => ['default' => [
            ['slug' => 'natural'], ['slug' => 'deep'], ['slug' => 'sharp'], ['slug' => 'outlined'], ['slug' => 'crisp'],
        ]]]],
    ]);

    $result = kotlinskidev_trim_default_theme_json_presets($data)->get_data();

    expect($result['settings']['shadow']['presets'])->toBe(['default' => [['slug' => 'natural']]]);
});

it('leaves data without those presets unchanged', function () {
    $data = new WP_Theme_JSON_Data(['settings' => ['spacing' => ['units' => ['px']]]]);

    expect(kotlinskidev_trim_default_theme_json_presets($data)->get_data())->toBe(['settings' => ['spacing' => ['units' => ['px']]]]);
});
