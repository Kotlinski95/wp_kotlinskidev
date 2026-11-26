<?php
if (!defined('ABSPATH')) {
    exit;
}

function kotlinskidev_mobile_parallax_body_class(array $classes): array
{
    if ((bool) get_option('kotlinskidev_mobile_parallax', true)) {
        $classes[] = 'kt-mobile-parallax';
    }
    return $classes;
}
add_filter('body_class', 'kotlinskidev_mobile_parallax_body_class');
