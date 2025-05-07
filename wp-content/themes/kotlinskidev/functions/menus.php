<?php
function theme_slug_register_menus()
{
    register_nav_menus(
        array(
            'primary' => __('Header menu', 'theme_slug'),
            'mobile'  => __('Mobile Menu', 'theme_slug')
        )
    );
}
add_action('after_setup_theme', 'theme_slug_register_menus');
?>