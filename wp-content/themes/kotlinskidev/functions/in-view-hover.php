<?php
if (!defined('ABSPATH')) {
    exit;
}

function kotlinskidev_get_in_view_band_config(): array
{
    return [
        'enabled' => (bool) get_option('kotlinskidev_in_view_hover_enabled', true),
        'center'  => kotlinskidev_sanitize_viewport_percent(get_option('kotlinskidev_in_view_band_center', 50)),
        'size'    => kotlinskidev_sanitize_in_view_band_size(get_option('kotlinskidev_in_view_band_size', 30)),
        'links'   => (bool) get_option('kotlinskidev_in_view_hover_links', false),
    ];
}
