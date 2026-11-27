<?php
const KOTLINSKIDEV_A11Y_DARK_SELECTOR  = 'html.dark-mode, body.dark-mode';
const KOTLINSKIDEV_A11Y_LIGHT_SELECTOR = 'html.light-mode, body.light-mode';

function kotlinskidev_a11y_default_selectors( mixed $selectors ): array {
    $selectors = is_array( $selectors ) ? $selectors : [];

    $selectors['darkSelector']  = KOTLINSKIDEV_A11Y_DARK_SELECTOR;
    $selectors['lightSelector'] = KOTLINSKIDEV_A11Y_LIGHT_SELECTOR;

    return $selectors;
}
add_filter( 'kotlinskidev_a11y_default_selectors', 'kotlinskidev_a11y_default_selectors' );
