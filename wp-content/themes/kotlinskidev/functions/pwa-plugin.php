<?php
const KOTLINSKIDEV_PWA_INSTALL_MIN_VIEWS      = 2;
const KOTLINSKIDEV_PWA_INSTALL_MIN_VISIBLE_MS = 30000;
const KOTLINSKIDEV_PWA_INSTALL_CONSENT_COOKIE = 'cmplz_banner-status';

function kotlinskidev_pwa_install_gate( mixed $gate = [] ): array {
    return [
        'min_views'       => KOTLINSKIDEV_PWA_INSTALL_MIN_VIEWS,
        'min_visible_ms'  => KOTLINSKIDEV_PWA_INSTALL_MIN_VISIBLE_MS,
        'consent_cookie'  => KOTLINSKIDEV_PWA_INSTALL_CONSENT_COOKIE,
    ];
}
add_filter( 'wp_pwa_manager_install_gate', 'kotlinskidev_pwa_install_gate' );
