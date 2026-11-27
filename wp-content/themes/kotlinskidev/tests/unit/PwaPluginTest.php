<?php

require_once __DIR__ . '/../../functions/pwa-plugin.php';

it('configures the install gate to two views or thirty visible seconds after consent', function () {
    expect(kotlinskidev_pwa_install_gate([]))->toBe([
        'min_views'      => 2,
        'min_visible_ms' => 30000,
        'consent_cookie' => 'cmplz_banner-status',
    ]);
});

it('ignores whatever the filter received', function () {
    expect(kotlinskidev_pwa_install_gate(null))->toHaveKey('min_views', 2);
});
