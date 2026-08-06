<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/theme-setup.php';

it('hides the admin bar for users without manage_options capability', function () {
    Functions\when('current_user_can')->justReturn(false);

    expect(kotlinskidev_show_admin_bar(true))->toBeFalse();
});

it('preserves the incoming value for users with manage_options capability', function () {
    Functions\when('current_user_can')->justReturn(true);

    expect(kotlinskidev_show_admin_bar(true))->toBeTrue();
    expect(kotlinskidev_show_admin_bar(false))->toBeFalse();
});
