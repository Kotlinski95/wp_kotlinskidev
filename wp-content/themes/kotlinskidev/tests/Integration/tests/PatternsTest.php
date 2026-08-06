<?php

uses(Tests\Integration\TestCase::class);

it('registers the theme block pattern categories', function () {
    $registry = WP_Block_Pattern_Categories_Registry::get_instance();

    foreach (['faq', 'banners', 'videos', 'sections'] as $slug) {
        expect($registry->is_registered($slug))->toBeTrue();
    }
});

it('gives the faq pattern category its translated label', function () {
    $registry = WP_Block_Pattern_Categories_Registry::get_instance();

    expect($registry->get_registered('faq')['label'])->toBe('FAQs');
});
