<?php

uses(Tests\Integration\TestCase::class);

it('registers all three tag-archive dynamic blocks used by templates/tag.html', function () {
    $registry = WP_Block_Type_Registry::get_instance();

    foreach ([
        'kotlinskidev/tag-header-dynamic',
        'kotlinskidev/tag-posts-grid-dynamic',
        'kotlinskidev/related-tags-dynamic',
    ] as $block_name) {
        expect($registry->is_registered($block_name))->toBeTrue();
    }
});

it('never references the retired static tag patterns from templates/tag.html again', function () {
    $content = file_get_contents(get_template_directory() . '/templates/tag.html');

    expect($content)->not->toContain('wp:pattern {"slug":"kotlinskidev/tag-header"}');
    expect($content)->not->toContain('wp:pattern {"slug":"kotlinskidev/tag-posts-grid"}');
    expect($content)->not->toContain('wp:pattern {"slug":"kotlinskidev/related-tags"}');
    expect($content)->toContain('wp:kotlinskidev/tag-header-dynamic');
    expect($content)->toContain('wp:kotlinskidev/tag-posts-grid-dynamic');
    expect($content)->toContain('wp:kotlinskidev/related-tags-dynamic');
});

it('renders the real tag name and article count through the tag-header dynamic block, not a frozen snapshot', function () {
    $term_id = self::factory()->tag->create(['name' => 'DevOps']);
    self::factory()->post->create(['tags_input' => ['DevOps']]);
    self::factory()->post->create(['tags_input' => ['DevOps']]);
    test()->go_to(get_tag_link($term_id));

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/tag-header-dynamic /-->')[0]);

    expect($html)->toContain('DevOps');
    expect($html)->toContain('2 Articles');
});

it('renders only posts tagged with the current tag archive through the tag-posts-grid dynamic block', function () {
    self::factory()->tag->create(['name' => 'DevOps']);
    $other_term_id = self::factory()->tag->create(['name' => 'Frontend']);
    $matching_post = self::factory()->post->create(['post_title' => 'Matching Tagged Post', 'tags_input' => ['DevOps']]);
    $other_post = self::factory()->post->create(['post_title' => 'Other Tagged Post', 'tags_input' => ['Frontend']]);
    test()->go_to(get_tag_link(get_term_by('name', 'DevOps', 'post_tag')->term_id));

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/tag-posts-grid-dynamic /-->')[0]);

    expect($html)->toContain('Matching Tagged Post');
    expect($html)->not->toContain('Other Tagged Post');
});

it('scopes the tag-posts-grid dynamic block\'s query to the current Polylang language', function () {
    $term_id = self::factory()->tag->create();
    self::factory()->post->create(['tax_input' => ['post_tag' => [$term_id]]]);
    test()->go_to(get_tag_link($term_id));

    $captured = null;
    $capture = function ($query) use (&$captured) {
        if ($query->get('tag_id')) {
            $captured = $query;
        }
    };
    add_action('pre_get_posts', $capture);

    render_block(parse_blocks('<!-- wp:kotlinskidev/tag-posts-grid-dynamic /-->')[0]);

    remove_action('pre_get_posts', $capture);

    expect($captured)->not->toBeNull();
    expect(array_key_exists('lang', $captured->query_vars))->toBeTrue();
});

it('excludes the current tag from the related-tags dynamic block', function () {
    self::factory()->post->create(['tags_input' => ['Current Tag']]);
    self::factory()->post->create(['tags_input' => ['Sibling Tag']]);
    $current_term_id = get_term_by('name', 'Current Tag', 'post_tag')->term_id;
    test()->go_to(get_tag_link($current_term_id));

    $html = render_block(parse_blocks('<!-- wp:kotlinskidev/related-tags-dynamic /-->')[0]);

    expect($html)->toContain('Sibling Tag');
    expect($html)->not->toContain('Current Tag');
});

it('scopes the related-tags dynamic block\'s tag lookup to the current Polylang language', function () {
    $current_term_id = self::factory()->tag->create();
    self::factory()->tag->create();
    test()->go_to(get_tag_link($current_term_id));

    $captured_args = null;
    $capture = function ($args, $taxonomies) use (&$captured_args) {
        if (in_array('post_tag', (array) $taxonomies, true) && isset($args['number']) && $args['number'] === 8) {
            $captured_args = $args;
        }
        return $args;
    };
    add_filter('get_terms_args', $capture, 10, 2);

    render_block(parse_blocks('<!-- wp:kotlinskidev/related-tags-dynamic /-->')[0]);

    remove_filter('get_terms_args', $capture, 10);

    expect($captured_args)->not->toBeNull();
    expect(array_key_exists('lang', $captured_args))->toBeTrue();
});
