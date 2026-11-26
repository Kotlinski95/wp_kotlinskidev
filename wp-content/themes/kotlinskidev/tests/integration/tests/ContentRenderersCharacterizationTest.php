<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_normalized_card_html(string $html): string
{
    $html = preg_replace('/([?&](?:p|cat)=)\d+/', '$1{ID}', $html);

    return trim(preg_replace('/\s+/', ' ', $html));
}

function kotlinskidev_fixed_card_post(array $overrides = []): int
{
    return test()->factory()->post->create($overrides + [
        'post_title'   => 'Fixed Card Title',
        'post_excerpt' => 'Fixed excerpt for the card.',
        'post_content' => 'Fixed body content for the card with several words.',
        'post_date'    => '2024-03-05 10:00:00',
        'post_status'  => 'publish',
    ]);
}

it('renders the post card with a fixed fixture to stable markup', function () {
    $post_id = kotlinskidev_fixed_card_post();

    $html = kotlinskidev_normalized_card_html(
        kotlinskidev_render_post_card($post_id, ['badge_label' => 'Badge', 'tags' => ['Alpha', 'Beta']])
    );

    expect($html)->toContain('kt-post-card-grid__image-placeholder');
    expect($html)->toContain('#Alpha');
    expect(md5($html))->toBe('de37297f5c623dc3efb5f6a99c67d466');
});

it('renders the post card without tags, with the reading-time badge and the content excerpt fallback', function () {
    $post_id = kotlinskidev_fixed_card_post(['post_excerpt' => '']);

    $html = kotlinskidev_normalized_card_html(
        kotlinskidev_render_post_card($post_id)
    );

    expect($html)->toContain('Fixed body content');
    expect(md5($html))->toBe('29c282a78e0765893fa099c6f11dc3ba');
});

it('renders the post card with a thumbnail image', function () {
    $post_id = kotlinskidev_fixed_card_post();
    $attachment_id = test()->factory()->attachment->create_upload_object(
        get_template_directory() . '/assets/images/service_icon.webp',
        $post_id
    );
    set_post_thumbnail($post_id, $attachment_id);

    $html = kotlinskidev_render_post_card($post_id, ['badge_label' => 'B']);

    expect($html)->toContain('kt-post-card-grid__image"');
    expect($html)->toContain('loading="lazy"');
    expect($html)->not->toContain('image-placeholder');
});

it('renders the topic card for a category with a fixed fixture to stable markup', function () {
    $term_id = test()->factory()->category->create(['name' => 'Fixed Topic', 'description' => 'Fixed description']);
    test()->factory()->post->create(['post_category' => [$term_id]]);

    $html = kotlinskidev_normalized_card_html(
        kotlinskidev_render_topic_card(get_term($term_id, 'category'))
    );

    expect($html)->toContain('kt-blog-topics-grid__card');
    expect($html)->toContain('Explore Fixed Topic');
    expect(md5($html))->toBe('bb378e6367f016beb44f95f15c40a83a');
});

it('builds card hover style vars', function () {
    expect(kotlinskidev_build_card_hover_style_vars([], '--x'))->toBe('');
    expect(kotlinskidev_build_card_hover_style_vars(['cardHoverBackgroundColor' => ' red '], '--x'))->toBe('--x:red;');
    expect(kotlinskidev_build_card_hover_style_vars(['blurOtherCards' => true, 'blurAmount' => '4px'], '--x'))->toBe('--kt-blur-amount:4px;');
    expect(kotlinskidev_build_card_hover_style_vars(
        ['cardHoverBackgroundColor' => '#fff', 'blurOtherCards' => true, 'blurAmount' => '2px'],
        '--bg'
    ))->toBe('--bg:#fff;--kt-blur-amount:2px;');
    expect(kotlinskidev_build_card_hover_style_vars(['blurAmount' => '2px'], '--x'))->toBe('');
});

it('keeps every content-renderer hook registration and priority', function () {
    $actions = [
        ['init', 'kotlinskidev_register_article_card_post_type', 10],
        ['init', 'kotlinskidev_register_article_card_meta', 10],
        ['added_post_meta', 'kotlinskidev_resync_article_cards_on_thumbnail_change', 10],
        ['updated_post_meta', 'kotlinskidev_resync_article_cards_on_thumbnail_change', 10],
        ['deleted_post_meta', 'kotlinskidev_resync_article_cards_on_thumbnail_change', 10],
        ['save_post_post', 'kotlinskidev_resync_article_cards_on_article_save', 20],
        ['rest_insert_kt_article_card', 'kotlinskidev_sync_article_card_on_rest_insert', 10],
        ['enqueue_block_editor_assets', 'kotlinskidev_article_card_editor_panel_script', 10],
        ['init', 'kotlinskidev_register_project_card_post_type', 10],
        ['init', 'kotlinskidev_register_project_card_meta', 10],
        ['enqueue_block_editor_assets', 'kotlinskidev_project_card_editor_panel_script', 10],
        ['init', 'kotlinskidev_register_certificate_post_type', 10],
        ['init', 'kotlinskidev_register_certificate_meta', 10],
        ['enqueue_block_editor_assets', 'kotlinskidev_certificate_editor_panel_script', 10],
        ['wp_ajax_kotlinskidev_fetch_certificate_badge', 'kotlinskidev_ajax_fetch_certificate_badge', 10],
        ['save_post_post', 'kotlinskidev_purge_term_latest_post_cache', 10],
        ['delete_post', 'kotlinskidev_purge_term_latest_post_cache_on_post', 10],
        ['trashed_post', 'kotlinskidev_purge_term_latest_post_cache_on_post', 10],
        ['untrashed_post', 'kotlinskidev_purge_term_latest_post_cache_on_post', 10],
        ['set_object_terms', 'kotlinskidev_purge_term_latest_post_cache_on_object_terms', 10],
        ['edited_term', 'kotlinskidev_purge_term_latest_post_cache_on_term', 10],
        ['init', 'kotlinskidev_register_tag_archive_dynamic_blocks', 10],
        ['add_meta_boxes', 'kotlinskidev_add_article_query_meta_boxes', 10],
        ['add_meta_boxes', 'kotlinskidev_add_featured_post_meta_box', 10],
        ['save_post', 'kotlinskidev_save_article_query_meta_box', 10],
        ['save_post', 'kotlinskidev_save_featured_post_meta', 10],
    ];
    $filters = [
        ['block_bindings_source_value', 'kotlinskidev_article_card_binding_value', 10],
        ['render_block_core/heading', 'kotlinskidev_article_toc_inject_heading_id', 10],
        ['render_block', 'kotlinskidev_apply_load_more_attributes', 10],
    ];

    foreach (array_merge($actions, $filters) as [$hook, $callback, $priority]) {
        expect(has_filter($hook, $callback))->toBe($priority);
    }
});

it('maps article card meta fields and sanitizers to the frozen set', function () {
    expect(kotlinskidev_article_card_meta_fields())->toBe([
        'linked_article_id'    => 'integer',
        'card_description'     => 'string',
        'image_id'             => 'integer',
        'image_url'            => 'string',
        'image_alt'            => 'string',
        'resolved_description' => 'string',
        'permalink'            => 'string',
    ]);
});

it('syncs article card meta from the linked published article', function () {
    $article_id = kotlinskidev_fixed_card_post(['post_title' => 'Linked Article']);
    $card_id = test()->factory()->post->create(['post_type' => 'post']);
    update_post_meta($card_id, 'linked_article_id', $article_id);

    kotlinskidev_sync_article_card_meta($card_id);

    expect(get_post_meta($card_id, 'resolved_description', true))->toBe('Linked Article');
    expect(get_post_meta($card_id, 'permalink', true))->toBe(get_permalink($article_id));
    expect(get_post_meta($card_id, 'image_url', true))->toBe('');
});

it('keeps the article card embed placeholder markup when no card is selected', function () {
    expect(kotlinskidev_render_article_card_embed(0))->toBe(
        '<div class="kt-article-card kt-article-card--empty"><p>Select a card to display it here.</p></div>'
    );
    expect(kotlinskidev_render_project_card_embed(0))->toBe(
        '<div class="kt-project-card kt-project-card--empty"><p>Select a card to display it here.</p></div>'
    );
    expect(kotlinskidev_render_certificate_embed(0))->toBe(
        '<div class="kt-certificate kt-certificate--empty"><p>Select a certificate to display it here.</p></div>'
    );
});

it('merges block supports class and style into the first tag for article and project cards', function () {
    $html = '<div class="a" style="color:red;">x</div>';

    expect(kotlinskidev_merge_article_card_block_supports($html))->toBe(kotlinskidev_merge_project_card_block_supports($html));
});

it('applies every load-more attribute to the group wrapper in a stable order', function () {
    $attrs = [
        'loadMore' => [
            'enabled'              => true,
            'initialCount'         => 4,
            'buttonLabel'          => 'More',
            'buttonAlign'          => 'center',
            'fontSize'             => 'small',
            'fontWeight'           => '600',
            'letterSpacing'        => 'wide',
            'textTransform'        => 'uppercase',
            'paddingY'             => 9,
            'paddingX'             => 0.1,
            'textColor'            => '#112233',
            'backgroundColor'      => 'red',
            'borderColor'          => '#abc',
            'borderWidth'          => 2,
            'borderRadius'         => 12,
            'hoverTextColor'       => '#fff',
            'hoverBackgroundColor' => '#000',
            'hoverBorderColor'     => 'blue',
            'underline'            => true,
        ],
    ];
    $html = render_block(parse_blocks(
        '<!-- wp:group ' . wp_json_encode($attrs) . ' --><div class="wp-block-group">x</div><!-- /wp:group -->'
    )[0]);

    expect(md5($html))->toBe('0d6beceb664b5819da81ca5d2803a543');
});

it('skips load-more default radius, out-of-set values and invalid font sizes', function () {
    $attrs = [
        'loadMore' => [
            'enabled'       => true,
            'initialCount'  => 2,
            'buttonAlign'   => 'left',
            'fontSize'      => 'BAD SIZE',
            'fontWeight'    => '900',
            'letterSpacing' => 'x',
            'textTransform' => 'lower',
            'paddingY'      => 'abc',
            'borderRadius'  => 6,
        ],
    ];
    $html = render_block(parse_blocks(
        '<!-- wp:group ' . wp_json_encode($attrs) . ' --><div class="wp-block-group">x</div><!-- /wp:group -->'
    )[0]);

    expect(md5($html))->toBe('10abfa634a7d62496c57057eef16e859');
});

it('renders the tag header dynamic block to stable markup', function () {
    $term_id = test()->factory()->tag->create(['name' => 'Fixed Tag', 'description' => 'Fixed tag description']);
    test()->factory()->post->create(['tags_input' => ['Fixed Tag']]);
    test()->go_to(get_tag_link($term_id));

    $html = trim(preg_replace('/\s+/', ' ', kotlinskidev_render_tag_header_fresh_per_language()));

    expect(md5($html))->toBe('d10aaa2af59d53c6efa5886712039719');
});
