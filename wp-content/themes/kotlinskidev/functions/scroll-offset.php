<?php
define('KOTLINSKIDEV_SCROLL_OFFSET_DEFAULTS', [
    'desktop' => 75,
    'mobile'  => 0,
]);

function kotlinskidev_get_scroll_offsets(): array
{
    static $offsets = null;
    if ($offsets !== null) {
        return $offsets;
    }

    $defaults = KOTLINSKIDEV_SCROLL_OFFSET_DEFAULTS;

    $offsets = [
        'desktop' => (int) get_option('kotlinskidev_scroll_offset_desktop', $defaults['desktop']),
        'mobile'  => (int) get_option('kotlinskidev_scroll_offset_mobile', $defaults['mobile']),
    ];

    return $offsets;
}
