<?php
function kotlinskidev_register_block_pattern_categories() {
    register_block_pattern_category(
        'faq',
        ['label' => __('FAQs', 'kotlinskidev')]
    );
    register_block_pattern_category(
        'banners',
        ['label' => __('Banners', 'kotlinskidev')]
    );
    register_block_pattern_category(
        'videos',
        ['label' => __('Videos', 'kotlinskidev')]
    );
    register_block_pattern_category(
        'sections',
        ['label' => __('Sections', 'kotlinskidev')]
    );
}
add_action('init', 'kotlinskidev_register_block_pattern_categories');
?>