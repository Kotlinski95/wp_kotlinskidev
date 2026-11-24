<?php

use Brain\Monkey\Filters;
use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/jquery-gate.php';

function kotlinskidev_fake_scripts(array $registered, array $queue): object
{
    $scripts             = new stdClass();
    $scripts->queue      = $queue;
    $scripts->registered = array_map(static fn (array $deps): object => (object) ['deps' => $deps], $registered);

    return $scripts;
}

function kotlinskidev_fake_core_scripts(): array
{
    return [
        'jquery'         => ['jquery-core', 'jquery-migrate'],
        'jquery-core'    => [],
        'jquery-migrate' => [],
        'theme-main'     => [],
        'onetap'         => ['jquery'],
        'onetap-addon'   => ['onetap'],
        'plain-addon'    => ['theme-main'],
        'legacy'         => ['jquery-migrate'],
    ];
}

beforeEach(function () {
    Functions\when('is_admin')->justReturn(false);
    Functions\when('is_customize_preview')->justReturn(false);
    Functions\when('current_user_can')->justReturn(false);
});

it('lists no dependents when nothing queued needs jquery', function () {
    $scripts = kotlinskidev_fake_scripts(kotlinskidev_fake_core_scripts(), ['theme-main', 'plain-addon']);

    expect(kotlinskidev_get_jquery_dependents($scripts))->toBe([]);
});

it('lists queued handles that depend on jquery directly or transitively', function () {
    $scripts = kotlinskidev_fake_scripts(kotlinskidev_fake_core_scripts(), ['theme-main', 'onetap', 'onetap-addon', 'jquery']);

    expect(kotlinskidev_get_jquery_dependents($scripts))->toBe(['onetap', 'onetap-addon']);
});

it('ignores dependencies on handles that are not registered and survives cycles', function () {
    $registered          = kotlinskidev_fake_core_scripts();
    $registered['loop-a'] = ['loop-b'];
    $registered['loop-b'] = ['loop-a', 'ghost'];
    $scripts             = kotlinskidev_fake_scripts($registered, ['loop-a']);

    expect(kotlinskidev_get_jquery_dependents($scripts))->toBe([]);
});

it('exposes the dependents through the kotlinskidev_jquery_dependents filter', function () {
    $scripts = kotlinskidev_fake_scripts(kotlinskidev_fake_core_scripts(), ['onetap']);
    Filters\expectApplied('kotlinskidev_jquery_dependents')->once()->with(['onetap']);

    kotlinskidev_get_jquery_dependents($scripts);
});

it('deregisters jquery when no queued script needs it', function () {
    $scripts = kotlinskidev_fake_scripts(kotlinskidev_fake_core_scripts(), ['theme-main']);
    Functions\when('wp_scripts')->justReturn($scripts);
    Functions\expect('wp_deregister_script')->once()->with('jquery');

    kotlinskidev_gate_jquery();
});

it('keeps jquery and drops jquery-migrate when a queued script needs jquery only', function () {
    $scripts = kotlinskidev_fake_scripts(kotlinskidev_fake_core_scripts(), ['onetap']);
    Functions\when('wp_scripts')->justReturn($scripts);
    Functions\expect('wp_deregister_script')->never();

    kotlinskidev_gate_jquery();

    expect($scripts->registered['jquery']->deps)->toBe(['jquery-core']);
});

it('keeps jquery-migrate when a queued script requires it', function () {
    $scripts = kotlinskidev_fake_scripts(kotlinskidev_fake_core_scripts(), ['onetap', 'legacy']);
    Functions\when('wp_scripts')->justReturn($scripts);
    Functions\expect('wp_deregister_script')->never();

    kotlinskidev_gate_jquery();

    expect($scripts->registered['jquery']->deps)->toBe(['jquery-core', 'jquery-migrate']);
});

it('leaves jquery untouched for admin, customizer and administrators', function (string $exemptFunction) {
    Functions\when($exemptFunction)->justReturn(true);
    Functions\expect('wp_deregister_script')->never();

    kotlinskidev_gate_jquery();
})->with(['is_admin', 'is_customize_preview', 'current_user_can']);
