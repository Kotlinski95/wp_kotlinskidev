<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_article_query_admin_setup(): array
{
    $admin_id = test()->factory()->user->create(['role' => 'administrator']);
    wp_set_current_user($admin_id);
    $post_id = test()->factory()->post->create(['post_type' => 'page']);

    return [$admin_id, $post_id];
}

it('registers the article query and featured post meta boxes on their respective screens', function () {
    global $wp_meta_boxes;
    $wp_meta_boxes = [];

    kotlinskidev_add_article_query_meta_boxes();
    kotlinskidev_add_featured_post_meta_box();

    expect($wp_meta_boxes['page']['normal']['high'])->toHaveKey('article_query_settings');
    expect($wp_meta_boxes['post']['side']['high'])->toHaveKey('featured_post');
});

it('renders the article query meta box with a nonce and existing meta values', function () {
    [, $post_id] = kotlinskidev_article_query_admin_setup();
    update_post_meta($post_id, '_posts_per_page', '9');
    update_post_meta($post_id, '_column_count', '2');

    ob_start();
    kotlinskidev_article_query_meta_box_callback(get_post($post_id));
    $html = ob_get_clean();

    expect($html)->toContain('name="kotlinskidev_article_query_nonce"');
    expect($html)->toContain('value="9"');
    expect($html)->toMatch('/<option value="2"[^>]*selected=\'selected\'/');

    wp_set_current_user(0);
});

it('saves article query meta fields when the nonce and capability check pass', function () {
    [, $post_id] = kotlinskidev_article_query_admin_setup();

    $_POST['kotlinskidev_article_query_nonce'] = wp_create_nonce('kotlinskidev_article_query_nonce');
    $_POST['posts_per_page'] = '12';
    $_POST['column_count'] = '4';
    $_POST['filter_tags'] = ['news', 'updates'];

    kotlinskidev_save_article_query_meta_box($post_id);

    expect(get_post_meta($post_id, '_posts_per_page', true))->toBe('12');
    expect(get_post_meta($post_id, '_column_count', true))->toBe('4');
    expect(get_post_meta($post_id, '_filter_tags', true))->toBe('news,updates');

    unset($_POST['kotlinskidev_article_query_nonce'], $_POST['posts_per_page'], $_POST['column_count'], $_POST['filter_tags']);
    wp_set_current_user(0);
});

it('deletes a meta field when it is no longer present in the submitted form', function () {
    [, $post_id] = kotlinskidev_article_query_admin_setup();
    update_post_meta($post_id, '_order_by', 'title');

    $_POST['kotlinskidev_article_query_nonce'] = wp_create_nonce('kotlinskidev_article_query_nonce');

    kotlinskidev_save_article_query_meta_box($post_id);

    expect(get_post_meta($post_id, '_order_by', true))->toBe('');

    unset($_POST['kotlinskidev_article_query_nonce']);
    wp_set_current_user(0);
});

it('does not save article query meta without a valid nonce', function () {
    [, $post_id] = kotlinskidev_article_query_admin_setup();

    $_POST['posts_per_page'] = '30';

    kotlinskidev_save_article_query_meta_box($post_id);

    expect(get_post_meta($post_id, '_posts_per_page', true))->toBe('');

    unset($_POST['posts_per_page']);
    wp_set_current_user(0);
});

it('does not save article query meta for a user without edit_post capability', function () {
    $post_id = test()->factory()->post->create(['post_type' => 'page']);
    $subscriber_id = test()->factory()->user->create(['role' => 'subscriber']);
    wp_set_current_user($subscriber_id);

    $_POST['kotlinskidev_article_query_nonce'] = wp_create_nonce('kotlinskidev_article_query_nonce');
    $_POST['posts_per_page'] = '30';

    kotlinskidev_save_article_query_meta_box($post_id);

    expect(get_post_meta($post_id, '_posts_per_page', true))->toBe('');

    unset($_POST['kotlinskidev_article_query_nonce'], $_POST['posts_per_page']);
    wp_set_current_user(0);
});

it('renders the featured post checkbox reflecting existing meta', function () {
    [, $post_id] = kotlinskidev_article_query_admin_setup();
    update_post_meta($post_id, '_featured_post', '1');

    ob_start();
    kotlinskidev_featured_post_callback(get_post($post_id));
    $html = ob_get_clean();

    expect($html)->toContain('name="kotlinskidev_featured_post_nonce"');
    expect($html)->toContain('checked');

    wp_set_current_user(0);
});

it('marks a post as featured when the checkbox is submitted', function () {
    [, $post_id] = kotlinskidev_article_query_admin_setup();

    $_POST['kotlinskidev_featured_post_nonce'] = wp_create_nonce('kotlinskidev_featured_post_nonce');
    $_POST['featured_post'] = '1';

    kotlinskidev_save_featured_post_meta($post_id);

    expect(get_post_meta($post_id, '_featured_post', true))->toBe('1');

    unset($_POST['kotlinskidev_featured_post_nonce'], $_POST['featured_post']);
    wp_set_current_user(0);
});

it('unmarks a post as featured when the checkbox is absent from the submission', function () {
    [, $post_id] = kotlinskidev_article_query_admin_setup();
    update_post_meta($post_id, '_featured_post', '1');

    $_POST['kotlinskidev_featured_post_nonce'] = wp_create_nonce('kotlinskidev_featured_post_nonce');

    kotlinskidev_save_featured_post_meta($post_id);

    expect(get_post_meta($post_id, '_featured_post', true))->toBe('');

    unset($_POST['kotlinskidev_featured_post_nonce']);
    wp_set_current_user(0);
});
