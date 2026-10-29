<?php

uses(Tests\Integration\TestCase::class);

it('returns zero page views for a post with no tracked views yet', function () {
    $post_id = self::factory()->post->create();

    expect(kotlinskidev_get_page_views($post_id))->toBe(0);
});

it('returns the tracked view count as an integer', function () {
    $post_id = self::factory()->post->create();
    update_post_meta($post_id, '_kotlinskidev_page_views', '7');

    expect(kotlinskidev_get_page_views($post_id))->toBe(7);
});

it('adds a Page Views column to the posts list table', function () {
    $columns = kotlinskidev_add_views_column(['title' => 'Title']);

    expect($columns)->toHaveKey('page_views');
});

it('renders the view count for the page_views column when views exist', function () {
    $post_id = self::factory()->post->create();
    update_post_meta($post_id, '_kotlinskidev_page_views', '1500');

    ob_start();
    kotlinskidev_show_views_column('page_views', $post_id);
    $output = ob_get_clean();

    expect($output)->toBe('1,500');
});

it('renders an em dash for the page_views column when there are no views', function () {
    $post_id = self::factory()->post->create();

    ob_start();
    kotlinskidev_show_views_column('page_views', $post_id);
    $output = ob_get_clean();

    expect($output)->toBe('—');
});

it('renders nothing for an unrelated column', function () {
    $post_id = self::factory()->post->create();

    ob_start();
    kotlinskidev_show_views_column('title', $post_id);
    $output = ob_get_clean();

    expect($output)->toBe('');
});

it('registers the page_views sortable column mapped to the real meta key', function () {
    $columns = kotlinskidev_views_column_sortable([]);

    expect($columns['page_views'])->toBe('_kotlinskidev_page_views');
});

it('rewrites a page_views orderby query into a meta_value_num query on the admin', function () {
    set_current_screen('edit-post');
    $query = new WP_Query();
    $query->set('orderby', '_kotlinskidev_page_views');

    kotlinskidev_views_column_orderby($query);

    expect($query->get('meta_key'))->toBe('_kotlinskidev_page_views');
    expect($query->get('orderby'))->toBe('meta_value_num');
});

it('outputs a post-id meta tag on a singular post', function () {
    $post_id = self::factory()->post->create();
    $this->go_to(get_permalink($post_id));

    ob_start();
    kotlinskidev_add_post_id_meta();
    $html = ob_get_clean();

    expect($html)->toContain("content=\"{$post_id}\"");
});

it('outputs no post-id meta tag on a non-singular view', function () {
    $this->go_to(home_url('/'));

    ob_start();
    kotlinskidev_add_post_id_meta();
    $html = ob_get_clean();

    expect($html)->toBe('');
});

it('returns a WP_Query of published posts ordered by view count', function () {
    $low = self::factory()->post->create();
    $high = self::factory()->post->create();
    update_post_meta($low, '_kotlinskidev_page_views', '1');
    update_post_meta($high, '_kotlinskidev_page_views', '99');

    $query = kotlinskidev_get_popular_posts(6, ['post']);
    $ids = wp_list_pluck($query->posts, 'ID');

    expect($ids)->toContain($high);
    expect(array_search($high, $ids))->toBeLessThan(array_search($low, $ids) ?: PHP_INT_MAX);
});

it('returns an empty-results WP_Query when no posts have tracked views', function () {
    $query = kotlinskidev_get_popular_posts(6, ['post']);

    expect($query->posts)->toBe([]);
});
