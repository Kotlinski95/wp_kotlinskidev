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

it('lists the four newer features as toggleable', function () {
    expect(array_keys(kotlinskidev_toggleable_features()))->toContain('offers', 'article_toc', 'site_values', 'cover_video_controls');
    expect(kotlinskidev_toggleable_feature_keys())->toBe(array_keys(kotlinskidev_toggleable_features()));
});

function kt_feature_migration_store(array $options): ArrayObject
{
    $store = new ArrayObject($options);
    Functions\when('get_option')->alias(fn ($name, $default = false) => $store->offsetExists($name) ? $store[$name] : $default);
    Functions\when('update_option')->alias(function ($name, $value) use ($store) {
        $store[$name] = $value;
        return true;
    });
    return $store;
}

it('migration appends the new features to an already saved option and records the version', function () {
    $store = kt_feature_migration_store(['kotlinskidev_enabled_features' => ['project_cards', 'certificates']]);

    kotlinskidev_migrate_feature_toggles();

    expect($store['kotlinskidev_enabled_features'])->toBe(['project_cards', 'certificates', 'offers', 'article_toc', 'site_values', 'cover_video_controls', 'custom_seo']);
    expect($store['kotlinskidev_feature_toggles_version'])->toBe(3);
});

it('migration leaves a fresh install without a saved option on the all-on default', function () {
    $store = kt_feature_migration_store([]);

    kotlinskidev_migrate_feature_toggles();

    expect($store->offsetExists('kotlinskidev_enabled_features'))->toBeFalse();
    expect($store['kotlinskidev_feature_toggles_version'])->toBe(3);
    expect(kotlinskidev_feature_enabled('offers'))->toBeTrue();
});

it('migration is idempotent and never re-enables a feature the owner switched off later', function () {
    $store = kt_feature_migration_store(['kotlinskidev_enabled_features' => ['project_cards']]);

    kotlinskidev_migrate_feature_toggles();
    $store['kotlinskidev_enabled_features'] = ['project_cards'];
    kotlinskidev_migrate_feature_toggles();

    expect($store['kotlinskidev_enabled_features'])->toBe(['project_cards']);
});

it('migration does not duplicate keys already present', function () {
    $store = kt_feature_migration_store(['kotlinskidev_enabled_features' => ['offers', 'project_cards']]);

    kotlinskidev_migrate_feature_toggles();

    expect($store['kotlinskidev_enabled_features'])->toBe(['offers', 'project_cards', 'article_toc', 'site_values', 'cover_video_controls', 'custom_seo']);
});

it('migration from version two adds only the custom SEO feature', function () {
    $store = kt_feature_migration_store(['kotlinskidev_enabled_features' => ['project_cards'], 'kotlinskidev_feature_toggles_version' => 2]);

    kotlinskidev_migrate_feature_toggles();

    expect($store['kotlinskidev_enabled_features'])->toBe(['project_cards', 'custom_seo']);
    expect($store['kotlinskidev_feature_toggles_version'])->toBe(3);
});

it('lists custom_seo as a toggleable feature', function () {
    expect(array_keys(kotlinskidev_toggleable_features()))->toContain('custom_seo');
});
