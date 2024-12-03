
<?php
// Add support for Custom Logo
function mytheme_setup()
{
    add_theme_support('custom-logo', array(
        'width'       => 200, // Adjust width as needed
        'height'      => 100, // Adjust height as needed
        'flex-width'  => true,
        'flex-height' => true,
    ));
}
add_action('after_setup_theme', 'mytheme_setup');
?>