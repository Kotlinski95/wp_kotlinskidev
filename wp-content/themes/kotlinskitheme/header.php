
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
    <head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php bloginfo('name'); ?> | <?php is_front_page() ? bloginfo('description') : wp_title(''); ?></title>
    <link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); ?>">
    <?php
    // Output meta description for individual pages/posts
    if (is_singular()) {
        $meta_description = get_post_meta(get_the_ID(), 'meta_description', true);
        if (!empty($meta_description)) {
            echo '<meta name="description" content="' . esc_attr($meta_description) . '">';
        }
    } elseif (is_front_page()) {
        // Output meta description for front page if set
        $meta_description = get_theme_mod('meta_description', '');
        if (!empty($meta_description)) {
            echo '<meta name="description" content="' . esc_attr($meta_description) . '">';
        }
    }
    ?>
    <?php wp_head(); ?>
</head>