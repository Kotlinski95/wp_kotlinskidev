<?php
function theme_slug_register_menus()
{
    register_nav_menus(
        array(
            'mobile_footer' => __('Mobile Footer Menu', 'theme_slug'),
        )
    );
}
add_action('after_setup_theme', 'theme_slug_register_menus');