<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/feature-toggles.php';

beforeEach(function () {
    Functions\when('__')->returnArg(1);
    Functions\when('sanitize_key')->alias(fn ($key) => preg_replace('/[^a-z0-9_\-]/', '', strtolower((string) $key)));
});

it('enables every known feature by default when no option is saved', function () {
    Functions\when('get_option')->alias(fn ($name, $default) => $default);

    foreach (array_keys(kotlinskidev_toggleable_features()) as $feature) {
        expect(kotlinskidev_feature_enabled($feature))->toBeTrue();
    }
});

it('reports a feature disabled once it is missing from the saved option', function () {
    Functions\when('get_option')->alias(fn ($name, $default) => ['project_cards', 'certificates']);

    expect(kotlinskidev_feature_enabled('project_cards'))->toBeTrue();
    expect(kotlinskidev_feature_enabled('certificates'))->toBeTrue();
    expect(kotlinskidev_feature_enabled('article_cards'))->toBeFalse();
    expect(kotlinskidev_feature_enabled('service_locations'))->toBeFalse();
});

it('treats an unknown feature key as disabled', function () {
    Functions\when('get_option')->alias(fn ($name, $default) => $default);

    expect(kotlinskidev_feature_enabled('not_a_real_feature'))->toBeFalse();
});

it('sanitizes the saved option down to known keys only, lowercasing via sanitize_key', function () {
    $result = kotlinskidev_sanitize_enabled_features([
        'project_cards',
        'not_a_real_feature',
        'Certificates',
        '',
    ]);

    expect($result)->toBe(['project_cards', 'certificates']);
});

it('sanitizes a non-array value to an empty array', function () {
    expect(kotlinskidev_sanitize_enabled_features('project_cards'))->toBe([]);
    expect(kotlinskidev_sanitize_enabled_features(null))->toBe([]);
});
