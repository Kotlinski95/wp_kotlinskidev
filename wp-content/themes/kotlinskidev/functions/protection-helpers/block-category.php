<?php

if (!function_exists('kotlinskidev_register_protected_content_block')) {
    function kotlinskidev_register_protected_content_block()
    {
        add_filter('block_categories_all', function ($categories) {
            $category_exists = false;
            foreach ($categories as $category) {
                if ($category['slug'] === 'kotlinskidev') {
                    $category_exists = true;
                    break;
                }
            }

            if (!$category_exists) {
                array_unshift($categories, array(
                    'slug'  => 'kotlinskidev',
                    'title' => __('KotlinskiDev', 'kotlinskidev'),
                    'icon'  => 'shield'
                ));
            }

            return $categories;
        });
    }
    add_action('init', 'kotlinskidev_register_protected_content_block');
}
