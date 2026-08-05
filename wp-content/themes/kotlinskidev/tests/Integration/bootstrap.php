<?php

$_tests_dir = getenv('WP_TESTS_DIR');

if (!$_tests_dir) {
    $_tests_dir = getenv('WP_PHPUNIT__DIR');
}

if (!$_tests_dir) {
    $_tests_dir = dirname(__DIR__, 2) . '/vendor/wp-phpunit/wp-phpunit';
}

require_once $_tests_dir . '/includes/functions.php';

function _kotlinskidev_manually_load_theme()
{
    switch_theme('kotlinskidev');
    require dirname(__DIR__, 2) . '/functions.php';
}
tests_add_filter('setup_theme', '_kotlinskidev_manually_load_theme');

require $_tests_dir . '/includes/bootstrap.php';
