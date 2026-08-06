<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/article-query-manager.php';

beforeEach(function () {
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
    $_POST = [];
});

it('does not save article query fields when the nonce is missing', function () {
    Functions\expect('update_post_meta')->never();
    Functions\expect('delete_post_meta')->never();

    kotlinskidev_save_article_query_meta_box(5);
});

it('does not save article query fields when the nonce is invalid', function () {
    $_POST['kotlinskidev_article_query_nonce'] = 'bad';
    Functions\when('wp_verify_nonce')->justReturn(false);
    Functions\expect('update_post_meta')->never();

    kotlinskidev_save_article_query_meta_box(5);
});

it('does not save article query fields without edit permission', function () {
    $_POST['kotlinskidev_article_query_nonce'] = 'ok';
    Functions\when('wp_verify_nonce')->justReturn(true);
    Functions\when('current_user_can')->justReturn(false);
    Functions\expect('update_post_meta')->never();

    kotlinskidev_save_article_query_meta_box(5);
});

it('saves present fields and deletes absent ones', function () {
    $_POST = [
        'kotlinskidev_article_query_nonce' => 'ok',
        'posts_per_page' => '12',
        'filter_tags' => ['3', '7'],
    ];
    Functions\when('wp_verify_nonce')->justReturn(true);
    Functions\when('current_user_can')->justReturn(true);

    $updated = [];
    $deleted = [];
    Functions\when('update_post_meta')->alias(function ($id, $key, $value) use (&$updated) {
        $updated[$key] = $value;
    });
    Functions\when('delete_post_meta')->alias(function ($id, $key) use (&$deleted) {
        $deleted[] = $key;
    });

    kotlinskidev_save_article_query_meta_box(5);

    expect($updated['_posts_per_page'])->toBe('12');
    expect($updated['_filter_tags'])->toBe('3,7');
    expect($deleted)->toContain('_filter_category');
    expect($deleted)->toContain('_column_count');
    expect($deleted)->toContain('_order_by');
});

it('does not save the featured flag when the nonce is missing', function () {
    Functions\expect('update_post_meta')->never();
    Functions\expect('delete_post_meta')->never();

    kotlinskidev_save_featured_post_meta(5);
});

it('marks the post as featured when the checkbox is checked', function () {
    $_POST = ['kotlinskidev_featured_post_nonce' => 'ok', 'featured_post' => '1'];
    Functions\when('wp_verify_nonce')->justReturn(true);
    Functions\when('current_user_can')->justReturn(true);
    Functions\expect('update_post_meta')->once()->with(5, '_featured_post', '1');
    Functions\expect('delete_post_meta')->never();

    kotlinskidev_save_featured_post_meta(5);
});

it('unmarks the post as featured when the checkbox is unchecked', function () {
    $_POST = ['kotlinskidev_featured_post_nonce' => 'ok'];
    Functions\when('wp_verify_nonce')->justReturn(true);
    Functions\when('current_user_can')->justReturn(true);
    Functions\expect('delete_post_meta')->once()->with(5, '_featured_post');
    Functions\expect('update_post_meta')->never();

    kotlinskidev_save_featured_post_meta(5);
});
