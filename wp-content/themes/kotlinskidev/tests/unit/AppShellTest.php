<?php

require_once __DIR__ . '/../../functions/app-shell.php';

it('adds the shell body class only once the nav was deferred', function () {
	expect(kotlinskidev_app_shell_body_class(['home']))->toBe(['home']);
	kotlinskidev_mark_app_shell();
	expect(kotlinskidev_app_shell_active())->toBeTrue();
	expect(kotlinskidev_app_shell_body_class(['home']))->toBe(['home', 'kt-app-shell']);
	kotlinskidev_app_shell_state(false);
});

it('accumulates deferred nav markup and marks the shell', function () {
	kotlinskidev_app_shell_nav_buffer('');
	kotlinskidev_app_shell_defer_nav('<nav>a</nav>');
	expect(kotlinskidev_app_shell_nav_buffer())->toBe('<nav>a</nav>');
	expect(kotlinskidev_app_shell_active())->toBeTrue();
	kotlinskidev_app_shell_state(false);
	kotlinskidev_app_shell_nav_buffer('');
});

it('maps a palette slug to a preset colour variable', function () {
    expect(kotlinskidev_mobile_nav_solid_background_value('surface'))->toBe('var(--wp--preset--color--surface)');
});

it('accepts hex colours and rejects anything else', function () {
    expect(kotlinskidev_mobile_nav_solid_background_value('#A1B2C3'))->toBe('#a1b2c3');
    expect(kotlinskidev_mobile_nav_solid_background_value('red; background:url(x)'))->toBe('');
    expect(kotlinskidev_mobile_nav_solid_background_value('url(javascript:alert(1))'))->toBe('');
    expect(kotlinskidev_mobile_nav_solid_background_value(''))->toBe('');
});
