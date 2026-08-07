<?php

uses(Tests\Integration\TestCase::class);

it('saves the category extended description with a valid nonce and capability', function () {
    $admin_id = self::factory()->user->create(['role' => 'administrator']);
    wp_set_current_user($admin_id);
    $term_id = self::factory()->category->create();

    $_POST['kotlinskidev_category_fields_nonce'] = wp_create_nonce('kotlinskidev_category_fields_action');
    $_POST['kotlinskidev_category_description'] = 'Extended text here';

    kotlinskidev_save_category_description($term_id);

    expect(get_term_meta($term_id, 'kotlinskidev_category_description', true))->toBe('Extended text here');

    unset($_POST['kotlinskidev_category_fields_nonce'], $_POST['kotlinskidev_category_description']);
    wp_set_current_user(0);
});

it('does not save the category description without a valid nonce', function () {
    $admin_id = self::factory()->user->create(['role' => 'administrator']);
    wp_set_current_user($admin_id);
    $term_id = self::factory()->category->create();

    $_POST['kotlinskidev_category_description'] = 'Should not save';

    kotlinskidev_save_category_description($term_id);

    expect(get_term_meta($term_id, 'kotlinskidev_category_description', true))->toBe('');

    unset($_POST['kotlinskidev_category_description']);
    wp_set_current_user(0);
});

it('falls back to the real category description when no extended description is set', function () {
    $term_id = self::factory()->category->create(['description' => 'Native description']);

    expect(kotlinskidev_get_category_description($term_id))->toBe('Native description');
});

it('prefers the extended description over the native one when both are set', function () {
    $term_id = self::factory()->category->create(['description' => 'Native description']);
    update_term_meta($term_id, 'kotlinskidev_category_description', 'Extended wins');

    expect(kotlinskidev_get_category_description($term_id))->toBe('Extended wins');
});

it('renders breadcrumbs with the category name on a real category archive', function () {
    $term_id = self::factory()->category->create(['name' => 'Web Development']);
    test()->go_to(get_category_link($term_id));

    ob_start();
    kotlinskidev_blog_breadcrumbs();
    $html = ob_get_clean();

    expect($html)->toContain('kotlinskidev-breadcrumbs');
    expect($html)->toContain('Web Development');
});

it('renders breadcrumbs with the post title and its category on a real single post', function () {
    $term_id = self::factory()->category->create(['name' => 'Tutorials']);
    $post_id = self::factory()->post->create(['post_title' => 'My Tutorial', 'post_category' => [$term_id]]);
    test()->go_to(get_permalink($post_id));

    ob_start();
    kotlinskidev_blog_breadcrumbs();
    $html = ob_get_clean();

    expect($html)->toContain('Tutorials');
    expect($html)->toContain('My Tutorial');
});

it('renders no breadcrumbs on a plain page', function () {
    $page_id = self::factory()->post->create(['post_type' => 'page']);
    test()->go_to(get_permalink($page_id));

    ob_start();
    kotlinskidev_blog_breadcrumbs();
    $html = ob_get_clean();

    expect($html)->toBe('');
});

it('estimates reading time from the real word count at 200 words per minute', function () {
    $content = implode(' ', array_fill(0, 400, 'word'));
    $post_id = self::factory()->post->create(['post_content' => $content]);

    expect(kotlinskidev_reading_time($post_id))->toBe('2 min read');
});

it('rounds a short post up to a 1 minute read', function () {
    $post_id = self::factory()->post->create(['post_content' => 'just a few words here']);

    expect(kotlinskidev_reading_time($post_id))->toBe('1 min read');
});

it('finds related posts sharing a category, excluding the post itself', function () {
    $term_id = self::factory()->category->create();
    $post_id = self::factory()->post->create(['post_category' => [$term_id]]);
    $related_1 = self::factory()->post->create(['post_category' => [$term_id]]);
    $related_2 = self::factory()->post->create(['post_category' => [$term_id]]);
    self::factory()->post->create();

    $related = kotlinskidev_get_related_posts($post_id, 5);
    $related_ids = wp_list_pluck($related, 'ID');

    expect($related_ids)->not->toContain($post_id);
    expect($related_ids)->toContain($related_1);
    expect($related_ids)->toContain($related_2);
});

it('returns no related posts when the post has no categories', function () {
    $post_id = self::factory()->post->create(['post_category' => []]);

    expect(kotlinskidev_get_related_posts($post_id))->toBe([]);
});

it('creates the English and Polish blog topics pages once, idempotently', function () {
    kotlinskidev_create_blog_pages();
    kotlinskidev_create_blog_pages();

    $en_matches = get_posts(['post_type' => 'page', 'name' => 'blog-topics', 'post_status' => 'publish']);
    $pl_matches = get_posts(['post_type' => 'page', 'name' => 'tematy-bloga', 'post_status' => 'publish']);

    expect($en_matches)->toHaveCount(1);
    expect($pl_matches)->toHaveCount(1);
});

it('labels the blog topics pages with a custom post state', function () {
    $en_page = self::factory()->post->create(['post_type' => 'page', 'post_name' => 'blog-topics']);
    $states = kotlinskidev_display_post_states([], get_post($en_page));

    expect($states)->toHaveKey('blog_topics');
});

it('adds the post count and last updated admin columns for categories', function () {
    $columns = kotlinskidev_add_category_columns(['name' => 'Name']);

    expect($columns)->toHaveKeys(['post_count', 'last_updated']);
});

it('renders the real post count for the post_count admin column', function () {
    $term_id = self::factory()->category->create();
    self::factory()->post->create(['post_category' => [$term_id]]);
    self::factory()->post->create(['post_category' => [$term_id]]);

    $content = kotlinskidev_category_column_content('', 'post_count', $term_id);

    expect($content)->toBe('2 articles');
});

it('shows an em dash for last_updated when the category has no posts', function () {
    $term_id = self::factory()->category->create();

    expect(kotlinskidev_category_column_content('', 'last_updated', $term_id))->toBe('—');
});

it('saves custom category banner content and links with a valid nonce', function () {
    $admin_id = self::factory()->user->create(['role' => 'administrator']);
    wp_set_current_user($admin_id);
    $term_id = self::factory()->category->create();

    $_POST['kotlinskidev_category_fields_nonce'] = wp_create_nonce('kotlinskidev_category_fields_action');
    $_POST['kotlinskidev_category_custom_content'] = '<p>Banner</p>';
    $_POST['kotlinskidev_category_custom_links'] = "Home|/\nResources|/resources";

    kotlinskidev_save_category_custom_content($term_id);

    expect(kotlinskidev_get_category_custom_content($term_id))->toBe('<p>Banner</p>');
    expect(kotlinskidev_get_category_custom_links($term_id))->toBe([
        ['text' => 'Home', 'url' => '/'],
        ['text' => 'Resources', 'url' => '/resources'],
    ]);

    unset($_POST['kotlinskidev_category_fields_nonce'], $_POST['kotlinskidev_category_custom_content'], $_POST['kotlinskidev_category_custom_links']);
    wp_set_current_user(0);
});

it('returns an empty array of custom links when none are configured', function () {
    $term_id = self::factory()->category->create();

    expect(kotlinskidev_get_category_custom_links($term_id))->toBe([]);
});

it('registers the breadcrumb settings submenu and settings group', function () {
    $admin_id = self::factory()->user->create(['role' => 'administrator']);
    wp_set_current_user($admin_id);

    kotlinskidev_breadcrumb_admin_menu();
    kotlinskidev_breadcrumb_settings_init();

    global $submenu;
    $found = false;
    foreach ($submenu['edit.php'] ?? [] as $item) {
        if ($item[2] === 'kotlinskidev-breadcrumbs') {
            $found = true;
        }
    }
    expect($found)->toBeTrue();

    wp_set_current_user(0);
});

it('falls back to default English breadcrumb text and url when no settings are saved', function () {
    delete_option('kotlinskidev_breadcrumb_settings');

    $settings = kotlinskidev_get_breadcrumb_settings('en_US');

    expect($settings['home_text'])->toBe('Home');
    expect($settings['topics_text'])->toBe('Topics');
    expect($settings['topics_url'])->toBe(home_url('/blog-topics/'));
});

it('resolves a configured Polish topics url as an absolute home url', function () {
    update_option('kotlinskidev_breadcrumb_settings', ['topics_url_pl' => '/niestandardowe-tematy/']);

    $settings = kotlinskidev_get_breadcrumb_settings('pl_PL');

    expect($settings['topics_url'])->toBe(home_url('/niestandardowe-tematy/'));

    delete_option('kotlinskidev_breadcrumb_settings');
});

it('builds a highlighted search excerpt around the matched term', function () {
    $content = str_repeat('padding word ', 30) . 'the golden needle is here' . str_repeat(' more padding', 30);

    $excerpt = kotlinskidev_get_search_excerpt($content, 'golden needle');

    expect($excerpt)->toContain('<mark');
    expect($excerpt)->toContain('golden');
});

it('falls back to a trimmed excerpt when the search term is not found', function () {
    $content = implode(' ', array_fill(0, 60, 'lorem'));

    $excerpt = kotlinskidev_get_search_excerpt($content, 'not-present-anywhere');

    expect($excerpt)->toContain('...');
});

it('does not highlight short search words of two characters or fewer', function () {
    expect(kotlinskidev_highlight_search_terms('to be or not to be', 'to'))->not->toContain('<mark');
});

it('returns the raw text unchanged when the search query is empty', function () {
    expect(kotlinskidev_highlight_search_terms('<b>raw</b>', ''))->toBe('&lt;b&gt;raw&lt;/b&gt;');
});

it('expands a real front-end search query to include pages, ordered by relevance', function () {
    test()->go_to('/?s=hello');

    global $wp_query;

    expect($wp_query->get('post_type'))->toBe(['post', 'page']);
    expect($wp_query->get('orderby'))->toBe('relevance');
});

it('renders the bilingual inline search form shortcode', function () {
    $html = do_shortcode('[kotlinskidev_search]');

    expect($html)->toContain('kotlinskidev-inline-search');
    expect($html)->toContain('name="s"');
});

it('adds the polish-search post state for pages using the search_pl.html template', function () {
    $page_id = self::factory()->post->create(['post_type' => 'page']);
    update_post_meta($page_id, '_wp_page_template', 'search_pl.html');

    $states = kotlinskidev_display_polish_search_states([], get_post($page_id));

    expect($states)->toHaveKey('polish_search');
});

it('does not add the polish-search post state for a page using a different template', function () {
    $page_id = self::factory()->post->create(['post_type' => 'page']);
    update_post_meta($page_id, '_wp_page_template', 'default');

    $states = kotlinskidev_display_polish_search_states([], get_post($page_id));

    expect($states)->not->toHaveKey('polish_search');
});
