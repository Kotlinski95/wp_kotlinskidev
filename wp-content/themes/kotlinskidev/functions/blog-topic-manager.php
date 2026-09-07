<?php
function kotlinskidev_category_description_support() {
    // Enable category descriptions in admin
    add_action('category_add_form_fields', 'kotlinskidev_add_category_description_field');
    add_action('category_edit_form_fields', 'kotlinskidev_edit_category_description_field');
    add_action('created_category', 'kotlinskidev_save_category_description');
    add_action('edited_category', 'kotlinskidev_save_category_description');
}
add_action('init', 'kotlinskidev_category_description_support');

// Add custom description field to category creation
function kotlinskidev_add_category_description_field($taxonomy) {
    wp_nonce_field('kotlinskidev_category_fields_action', 'kotlinskidev_category_fields_nonce');
    ?>
    <div class="form-field">
        <label for="kotlinskidev_category_description"><?php esc_html_e('Extended Description', 'kotlinskidev'); ?></label>
        <textarea name="kotlinskidev_category_description" id="kotlinskidev_category_description" rows="5" cols="50"></textarea>
        <p class="description"><?php esc_html_e('This description will be shown on the category archive page.', 'kotlinskidev'); ?></p>
    </div>
    <?php
}

// Add custom description field to category editing
function kotlinskidev_edit_category_description_field($term) {
    $extended_description = get_term_meta($term->term_id, 'kotlinskidev_category_description', true);
    wp_nonce_field('kotlinskidev_category_fields_action', 'kotlinskidev_category_fields_nonce');
    ?>
    <tr class="form-field">
        <th scope="row" valign="top">
            <label for="kotlinskidev_category_description"><?php esc_html_e('Extended Description', 'kotlinskidev'); ?></label>
        </th>
        <td>
            <textarea name="kotlinskidev_category_description" id="kotlinskidev_category_description" rows="5" cols="50"><?php echo esc_textarea($extended_description); ?></textarea>
            <p class="description"><?php esc_html_e('This description will be shown on the category archive page.', 'kotlinskidev'); ?></p>
        </td>
    </tr>
    <?php
}

// Save custom category description
function kotlinskidev_save_category_description($term_id) {
    if (!isset($_POST['kotlinskidev_category_fields_nonce']) ||
        !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['kotlinskidev_category_fields_nonce'])), 'kotlinskidev_category_fields_action')) {
        return;
    }

    if (!current_user_can('manage_categories')) {
        return;
    }

    if (isset($_POST['kotlinskidev_category_description'])) {
        update_term_meta($term_id, 'kotlinskidev_category_description', sanitize_textarea_field(wp_unslash($_POST['kotlinskidev_category_description'])));
    }
}

// Get extended category description
function kotlinskidev_get_category_description($category_id) {
    $extended_description = get_term_meta($category_id, 'kotlinskidev_category_description', true);
    return $extended_description ?: get_category($category_id)->description;
}

// Add breadcrumbs for blog navigation
function kotlinskidev_blog_breadcrumbs() {
    $locale = get_locale();
    $home_text = __('Home', 'kotlinskidev');
    $blog_text = __('Blog', 'kotlinskidev');
    $topics_text = __('Topics', 'kotlinskidev');
    
    $breadcrumbs = array();
    $breadcrumbs[] = '<a href="' . esc_url(home_url('/')) . '">' . $home_text . '</a>';
    
    if (is_category()) {
        $category = get_queried_object();
        $topics_url = ($locale == 'pl_PL') ? home_url('/tematy-bloga/') : home_url('/blog-topics/');
        $breadcrumbs[] = '<a href="' . esc_url($topics_url) . '">' . $topics_text . '</a>';
        $breadcrumbs[] = '<span>' . esc_html($category->name) . '</span>';
    } elseif (is_single() && get_post_type() === 'post') {
        $categories = get_the_category();
        if (!empty($categories)) {
            $category = $categories[0];
            $topics_url = ($locale == 'pl_PL') ? home_url('/tematy-bloga/') : home_url('/blog-topics/');
            $breadcrumbs[] = '<a href="' . esc_url($topics_url) . '">' . $topics_text . '</a>';
            $breadcrumbs[] = '<a href="' . esc_url(get_category_link($category->term_id)) . '">' . esc_html($category->name) . '</a>';
            $breadcrumbs[] = '<span>' . esc_html(get_the_title()) . '</span>';
        }
    }
    
    if (count($breadcrumbs) > 1) {
        echo '<nav class="kotlinskidev-breadcrumbs" style="margin-bottom:1.875rem;font-size:0.875rem;color:var(--wp--preset--color--foreground-alt);">';
        echo implode(' <span style="margin:0 0.5rem;">→</span> ', $breadcrumbs); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- every $breadcrumbs element is esc_url()/esc_html() wrapped at construction above
        echo '</nav>';
    }
}

// Add reading time estimate
function kotlinskidev_reading_time($post_id = null) {
    if (!$post_id) {
        $post_id = get_the_ID();
    }
    
    $content = get_post_field('post_content', $post_id);
    $word_count = str_word_count(strip_tags($content));
    $reading_time = ceil($word_count / 200); // Average reading speed: 200 words per minute
    
    return esc_html($reading_time . ' ' . __('min read', 'kotlinskidev'));
}

// Add related posts by category
function kotlinskidev_get_related_posts($post_id = null, $limit = 3) {
    if (!$post_id) {
        $post_id = get_the_ID();
    }
    
    $categories = get_the_category($post_id);
    if (empty($categories)) {
        return array();
    }
    
    $category_ids = array();
    foreach ($categories as $category) {
        $category_ids[] = $category->term_id;
    }

    $post_lang = function_exists('pll_get_post_language') ? pll_get_post_language($post_id) : '';

    // ORDER BY RAND() forces MySQL to sort every matching row on every request —
    // fetch matching IDs only (cheap, indexed) and randomize in PHP instead.
    $candidate_ids = get_posts(array(
        'category__in' => $category_ids,
        'post__not_in' => array($post_id),
        'posts_per_page' => -1,
        'post_status' => 'publish',
        'fields' => 'ids',
        'no_found_rows' => true,
        'suppress_filters' => false,
        'lang' => $post_lang,
    ));

    if (empty($candidate_ids)) {
        return array();
    }

    shuffle($candidate_ids);
    $selected_ids = array_slice($candidate_ids, 0, $limit);

    $related_posts = get_posts(array(
        'post__in' => $selected_ids,
        'orderby' => 'post__in',
        'posts_per_page' => $limit,
        'post_status' => 'publish',
        'no_found_rows' => true,
        'suppress_filters' => false,
        'lang' => $post_lang,
    ));
    
    return $related_posts;
}

// Create blog topics pages automatically
function kotlinskidev_create_blog_pages() {
    // Check if pages already exist
    $topics_page_en = get_page_by_path('blog-topics');
    $topics_page_pl = get_page_by_path('tematy-bloga');
    
    // Create English blog topics page
    if (!$topics_page_en) {
        wp_insert_post(array(
            'post_title' => 'Blog Topics',
            'post_content' => 'Explore articles organized by development topics and expertise areas.',
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_name' => 'blog-topics',
            'page_template' => 'archive-category.html'
        ));
    }
    
    // Create Polish blog topics page
    if (!$topics_page_pl) {
        wp_insert_post(array(
            'post_title' => 'Tematy Bloga',
            'post_content' => 'Przeglądaj artykuły podzielone według tematów i obszarów ekspertyzy.',
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_name' => 'tematy-bloga',
            'page_template' => 'archive-category.html'
        ));
    }
}

// Run page creation on theme activation
add_action('after_switch_theme', 'kotlinskidev_create_blog_pages');

// Add custom post states for blog pages
function kotlinskidev_display_post_states($post_states, $post) {
    if ($post->post_name === 'blog-topics') {
        $post_states['blog_topics'] = __('Blog Topics Page', 'kotlinskidev');
    }
    if ($post->post_name === 'tematy-bloga') {
        $post_states['blog_topics_pl'] = __('Blog Topics Page (PL)', 'kotlinskidev');
    }
    return $post_states;
}
add_filter('display_post_states', 'kotlinskidev_display_post_states', 10, 2);

// Add category count to admin columns
function kotlinskidev_add_category_columns($columns) {
    $columns['post_count'] = __('Articles', 'kotlinskidev');
    $columns['last_updated'] = __('Last Updated', 'kotlinskidev');
    return $columns;
}
add_filter('manage_edit-category_columns', 'kotlinskidev_add_category_columns');

function kotlinskidev_category_column_content($content, $column_name, $term_id) {
    if ($column_name === 'post_count') {
        $category = get_category($term_id);
        $content = $category->count . ' articles';
    }
    
    if ($column_name === 'last_updated') {
        $latest_post = get_posts(array(
            'category' => $term_id,
            'posts_per_page' => 1,
            'post_status' => 'publish',
            'suppress_filters' => false,
            'lang' => function_exists('pll_get_term_language') ? pll_get_term_language($term_id) : '',
        ));
        
        if (!empty($latest_post)) {
            $content = human_time_diff(get_the_time('U', $latest_post[0]->ID), current_time('timestamp')) . ' ago';
        } else {
            $content = '—';
        }
    }
    
    return $content;
}
add_filter('manage_category_custom_column', 'kotlinskidev_category_column_content', 10, 3);

// Add custom category banner/links field to category editing
function kotlinskidev_add_category_custom_content_field($term) {
    $custom_content = get_term_meta($term->term_id, 'kotlinskidev_category_custom_content', true);
    $custom_links = get_term_meta($term->term_id, 'kotlinskidev_category_custom_links', true);
    ?>
    <tr class="form-field">
        <th scope="row" valign="top">
            <label for="kotlinskidev_category_custom_content"><?php esc_html_e('Custom Banner/Content', 'kotlinskidev'); ?></label>
        </th>
        <td>
            <textarea name="kotlinskidev_category_custom_content" id="kotlinskidev_category_custom_content" rows="4" cols="50" placeholder="Add custom HTML content, banners, or announcements for this category..."><?php echo esc_textarea($custom_content); ?></textarea>
            <p class="description"><?php esc_html_e('Custom HTML content that will appear below the category header. You can add banners, special announcements, or custom links here.', 'kotlinskidev'); ?></p>
        </td>
    </tr>
    
    <tr class="form-field">
        <th scope="row" valign="top">
            <label for="kotlinskidev_category_custom_links"><?php esc_html_e('Custom Navigation Links', 'kotlinskidev'); ?></label>
        </th>
        <td>
            <textarea name="kotlinskidev_category_custom_links" id="kotlinskidev_category_custom_links" rows="3" cols="50" placeholder="Home|/
Resources|/resources
Tutorials|/tutorials"><?php echo esc_textarea($custom_links); ?></textarea>
            <p class="description"><?php esc_html_e('Custom navigation links in format: "Link Text|URL" (one per line). This will replace the default "← All Topics" link.', 'kotlinskidev'); ?></p>
        </td>
    </tr>
    <?php
}
add_action('category_edit_form_fields', 'kotlinskidev_add_category_custom_content_field');

// Add custom content field to category creation
function kotlinskidev_add_category_custom_content_field_new($taxonomy) {
    ?>
    <div class="form-field">
        <label for="kotlinskidev_category_custom_content"><?php esc_html_e('Custom Banner/Content', 'kotlinskidev'); ?></label>
        <textarea name="kotlinskidev_category_custom_content" id="kotlinskidev_category_custom_content" rows="4" cols="50" placeholder="Add custom HTML content, banners, or announcements..."></textarea>
        <p class="description"><?php esc_html_e('Custom HTML content that will appear below the category header.', 'kotlinskidev'); ?></p>
    </div>
    
    <div class="form-field">
        <label for="kotlinskidev_category_custom_links"><?php esc_html_e('Custom Navigation Links', 'kotlinskidev'); ?></label>
        <textarea name="kotlinskidev_category_custom_links" id="kotlinskidev_category_custom_links" rows="3" cols="50" placeholder="Home|/
Resources|/resources"></textarea>
        <p class="description"><?php esc_html_e('Custom navigation links in format: "Link Text|URL" (one per line).', 'kotlinskidev'); ?></p>
    </div>
    <?php
}
add_action('category_add_form_fields', 'kotlinskidev_add_category_custom_content_field_new');

// Save custom category content and links
function kotlinskidev_save_category_custom_content($term_id) {
    if (!isset($_POST['kotlinskidev_category_fields_nonce']) ||
        !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['kotlinskidev_category_fields_nonce'])), 'kotlinskidev_category_fields_action')) {
        return;
    }

    if (!current_user_can('manage_categories')) {
        return;
    }

    if (isset($_POST['kotlinskidev_category_custom_content'])) {
        update_term_meta($term_id, 'kotlinskidev_category_custom_content', wp_kses_post(wp_unslash($_POST['kotlinskidev_category_custom_content'])));
    }

    if (isset($_POST['kotlinskidev_category_custom_links'])) {
        update_term_meta($term_id, 'kotlinskidev_category_custom_links', sanitize_textarea_field(wp_unslash($_POST['kotlinskidev_category_custom_links'])));
    }
}
add_action('created_category', 'kotlinskidev_save_category_custom_content');
add_action('edited_category', 'kotlinskidev_save_category_custom_content');

// Get custom category content
function kotlinskidev_get_category_custom_content($category_id) {
    return get_term_meta($category_id, 'kotlinskidev_category_custom_content', true);
}

// Get custom category links
function kotlinskidev_get_category_custom_links($category_id) {
    $links_text = get_term_meta($category_id, 'kotlinskidev_category_custom_links', true);
    
    if (empty($links_text)) {
        return array();
    }
    
    $links = array();
    $lines = explode("\n", $links_text);
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line)) continue;
        
        $parts = explode('|', $line, 2);
        if (count($parts) === 2) {
            $links[] = array(
                'text' => trim($parts[0]),
                'url' => trim($parts[1])
            );
        }
    }
    
    return $links;
}

// Add breadcrumb settings to WordPress admin
function kotlinskidev_add_breadcrumb_settings() {
    add_action('admin_menu', 'kotlinskidev_breadcrumb_admin_menu');
    add_action('admin_init', 'kotlinskidev_breadcrumb_settings_init');
}
add_action('init', 'kotlinskidev_add_breadcrumb_settings');

// Add breadcrumb settings page to admin menu
function kotlinskidev_breadcrumb_admin_menu() {
    add_submenu_page(
        'edit.php', // Parent menu (Posts)
        __('Breadcrumb Settings', 'kotlinskidev'),
        __('Breadcrumb Settings', 'kotlinskidev'),
        'manage_options',
        'kotlinskidev-breadcrumbs',
        'kotlinskidev_breadcrumb_settings_page'
    );
}

// Initialize breadcrumb settings
function kotlinskidev_breadcrumb_settings_init() {
    register_setting('kotlinskidev_breadcrumbs', 'kotlinskidev_breadcrumb_settings');
    
    add_settings_section(
        'kotlinskidev_breadcrumb_main',
        __('Breadcrumb Navigation Settings', 'kotlinskidev'),
        'kotlinskidev_breadcrumb_section_callback',
        'kotlinskidev_breadcrumbs'
    );
    
    // English settings
    add_settings_field(
        'home_text_en',
        __('Home Text (English)', 'kotlinskidev'),
        'kotlinskidev_breadcrumb_text_field',
        'kotlinskidev_breadcrumbs',
        'kotlinskidev_breadcrumb_main',
        array('field' => 'home_text_en', 'placeholder' => 'Home')
    );
    
    add_settings_field(
        'topics_text_en',
        __('Topics Text (English)', 'kotlinskidev'),
        'kotlinskidev_breadcrumb_text_field',
        'kotlinskidev_breadcrumbs',
        'kotlinskidev_breadcrumb_main',
        array('field' => 'topics_text_en', 'placeholder' => 'Topics')
    );
    
    add_settings_field(
        'topics_url_en',
        __('Topics Page URL (English)', 'kotlinskidev'),
        'kotlinskidev_breadcrumb_url_field',
        'kotlinskidev_breadcrumbs',
        'kotlinskidev_breadcrumb_main',
        array('field' => 'topics_url_en', 'placeholder' => '/blog-topics/')
    );
    
    // Polish settings
    add_settings_field(
        'home_text_pl',
        __('Home Text (Polish)', 'kotlinskidev'),
        'kotlinskidev_breadcrumb_text_field',
        'kotlinskidev_breadcrumbs',
        'kotlinskidev_breadcrumb_main',
        array('field' => 'home_text_pl', 'placeholder' => 'Strona główna')
    );
    
    add_settings_field(
        'topics_text_pl',
        __('Topics Text (Polish)', 'kotlinskidev'),
        'kotlinskidev_breadcrumb_text_field',
        'kotlinskidev_breadcrumbs',
        'kotlinskidev_breadcrumb_main',
        array('field' => 'topics_text_pl', 'placeholder' => 'Tematy')
    );
    
    add_settings_field(
        'topics_url_pl',
        __('Topics Page URL (Polish)', 'kotlinskidev'),
        'kotlinskidev_breadcrumb_url_field',
        'kotlinskidev_breadcrumbs',
        'kotlinskidev_breadcrumb_main',
        array('field' => 'topics_url_pl', 'placeholder' => '/tematy-bloga/')
    );
}

// Section callback
function kotlinskidev_breadcrumb_section_callback() {
    echo '<p>' . esc_html__('Configure breadcrumb navigation texts and URLs for both English and Polish versions of your site.', 'kotlinskidev') . '</p>';
}

// Text field callback
function kotlinskidev_breadcrumb_text_field($args) {
    $options = get_option('kotlinskidev_breadcrumb_settings');
    $value = isset($options[$args['field']]) ? $options[$args['field']] : '';
    echo '<input type="text" name="kotlinskidev_breadcrumb_settings[' . esc_attr($args['field']) . ']" value="' . esc_attr($value) . '" placeholder="' . esc_attr($args['placeholder']) . '" class="regular-text" />';
}

// URL field callback
function kotlinskidev_breadcrumb_url_field($args) {
    $options = get_option('kotlinskidev_breadcrumb_settings');
    $value = isset($options[$args['field']]) ? $options[$args['field']] : '';
    echo '<input type="text" name="kotlinskidev_breadcrumb_settings[' . esc_attr($args['field']) . ']" value="' . esc_attr($value) . '" placeholder="' . esc_attr($args['placeholder']) . '" class="regular-text" />';
    echo '<p class="description">' . esc_html__('Enter a relative path (e.g., /articles, /blog-topics) or full URL (e.g., https://yoursite.com/topics/)', 'kotlinskidev') . '</p>';
}

// Settings page
function kotlinskidev_breadcrumb_settings_page() {
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form action="options.php" method="post">
            <?php
            settings_fields('kotlinskidev_breadcrumbs');
            do_settings_sections('kotlinskidev_breadcrumbs');
            submit_button(__('Save Breadcrumb Settings', 'kotlinskidev'));
            ?>
        </form>
        
        <div style="margin-top: 1.875rem; padding: 0.9375rem; background: #f9f9f9; border-left: 0.25rem solid #0073aa;">
            <h3><?php esc_html_e('How to Use', 'kotlinskidev'); ?></h3>
            <ul>
                <li><?php esc_html_e('Set custom text for "Home" and "Topics" links in both languages', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Configure URLs for your topics pages (can be relative paths or full URLs)', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Leave fields empty to use default values', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Changes will apply immediately to all category and article pages', 'kotlinskidev'); ?></li>
            </ul>
        </div>
    </div>
    <?php
}

// Get breadcrumb settings with fallbacks
function kotlinskidev_get_breadcrumb_settings($locale = null) {
    // Cache per locale — get_option() and home_url() would otherwise be called
    // on every breadcrumb render within a request.
    static $cache = [];

    if (!$locale) {
        $locale = get_locale();
    }

    if (isset($cache[$locale])) {
        return $cache[$locale];
    }
    
    $options = get_option('kotlinskidev_breadcrumb_settings', array());
    $is_polish = ($locale == 'pl_PL');
    
    $settings = array(
        'home_text' => $is_polish ? 
            (isset($options['home_text_pl']) && !empty($options['home_text_pl']) ? $options['home_text_pl'] : __('Home', 'kotlinskidev')) :
            (isset($options['home_text_en']) && !empty($options['home_text_en']) ? $options['home_text_en'] : __('Home', 'kotlinskidev')),
        
        'topics_text' => $is_polish ?
            (isset($options['topics_text_pl']) && !empty($options['topics_text_pl']) ? $options['topics_text_pl'] : __('Topics', 'kotlinskidev')) :
            (isset($options['topics_text_en']) && !empty($options['topics_text_en']) ? $options['topics_text_en'] : __('Topics', 'kotlinskidev')),
        
        'topics_url' => $is_polish ?
            (isset($options['topics_url_pl']) && !empty($options['topics_url_pl']) ? $options['topics_url_pl'] : home_url('/tematy-bloga/')) :
            (isset($options['topics_url_en']) && !empty($options['topics_url_en']) ? $options['topics_url_en'] : home_url('/blog-topics/'))
    );
    
    // Ensure URLs are properly formatted
    if (!filter_var($settings['topics_url'], FILTER_VALIDATE_URL) && !str_starts_with($settings['topics_url'], '/')) {
        $settings['topics_url'] = home_url('/' . ltrim($settings['topics_url'], '/'));
    } elseif (str_starts_with($settings['topics_url'], '/')) {
        $settings['topics_url'] = home_url($settings['topics_url']);
    }

    $cache[$locale] = $settings;
    return $settings;
}

// Enhanced Search Functionality
function kotlinskidev_get_search_excerpt($content, $search_query, $word_limit = 40) {
    // Remove HTML tags and shortcodes
    $content = wp_strip_all_tags(strip_shortcodes($content));
    
    // Find the position of the search term in content
    $search_pos = stripos($content, $search_query);
    
    if ($search_pos !== false) {
        // Extract context around the search term
        $start = max(0, $search_pos - 100);
        $excerpt = substr($content, $start, 300);
        
        // Trim to word boundaries
        if ($start > 0) {
            $excerpt = '...' . substr($excerpt, strpos($excerpt, ' '));
        }
        if (strlen($content) > $start + 300) {
            $excerpt = substr($excerpt, 0, strrpos($excerpt, ' ')) . '...';
        }
    } else {
        // Fallback to regular excerpt
        $excerpt = wp_trim_words($content, $word_limit, '...');
    }
    
    // Highlight search terms
    return kotlinskidev_highlight_search_terms($excerpt, $search_query);
}

function kotlinskidev_highlight_search_terms($text, $search_query) {
    $text = esc_html($text);

    if (empty($search_query)) {
        return $text;
    }

    // Split search query into individual words
    $words = explode(' ', $search_query);

    foreach ($words as $word) {
        $word = esc_html(trim($word));
        if (strlen($word) > 2) { // Only highlight words longer than 2 characters
            $text = preg_replace(
                '/(' . preg_quote($word, '/') . ')/i',
                '<mark style="background:#5259ff;color:white;padding:0.125rem 0.25rem;border-radius:0.1875rem;">$1</mark>',
                $text
            );
        }
    }

    return $text;
}

// Improve WordPress search to include page content
function kotlinskidev_enhance_search($query) {
    if (!is_admin() && $query->is_main_query()) {
        $is_search = $query->is_search();
        $is_polish_search = false;
        
        // Check if current page uses Polish search template
        if (is_page()) {
            $template = get_page_template_slug();
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search query detection, no state change
            if ($template === 'search_pl.html' && isset($_GET['s']) && !empty($_GET['s'])) {
                $is_polish_search = true;
            }
        }
        
        if ($is_search || $is_polish_search) {
            // Include pages in search results
            $query->set('post_type', array('post', 'page'));

            // Improve search relevance
            $query->set('orderby', 'relevance');
            $query->set('order', 'DESC');

            // Exclude content marked noindex (utility pages like Thank You / Search itself)
            $excluded = kotlinskidev_apply_seo_noindex_exclusion(array(
                'meta_query' => (array) $query->get('meta_query'),
                'post__not_in' => (array) $query->get('post__not_in'),
            ));
            if (!empty($excluded['meta_query'])) {
                $query->set('meta_query', $excluded['meta_query']);
            }
            if (!empty($excluded['post__not_in'])) {
                $query->set('post__not_in', $excluded['post__not_in']);
            }
            
            // Handle Polish search page specifically
            if ($is_polish_search) {
                // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search query filtering, no state change
                $query->set('s', sanitize_text_field(wp_unslash($_GET['s'])));
                $query->is_search = true;
                $query->is_page = false;
            }
        }
    }
}
add_action('pre_get_posts', 'kotlinskidev_enhance_search');

// Add search form shortcode for easy placement with bilingual support
function kotlinskidev_search_form_shortcode($atts) {
    $locale = get_locale();
    $is_polish = ($locale == 'pl_PL');
    
    $defaults = array(
        'placeholder' => $is_polish ? __('Search for content', 'kotlinskidev') : __('Search for content', 'kotlinskidev'),
        'button_text' => $is_polish ? __('Search Content', 'kotlinskidev') : __('Search Content', 'kotlinskidev')
    );
    
    $atts = shortcode_atts($defaults, $atts);
    
    // Determine search action URL based on language
    $search_action = $is_polish ? home_url('/szukaj') : home_url('/');
    
    ob_start();
    ?>
    <form method="get" action="<?php echo esc_url($search_action); ?>" class="kotlinskidev-inline-search">
        <div style="display:flex;gap:0.625rem;align-items:center;">
            <input type="text" 
                   name="s" 
                   value="<?php echo esc_attr(get_search_query()); ?>"
                   placeholder="<?php echo esc_attr($atts['placeholder']); ?>"
                   style="flex-grow:1;padding:0.625rem 0.9375rem;border:0.125rem solid var(--wp--preset--color--border-color);border-radius:0.5rem;font-size:0.875rem;"
                   required />
            <button type="submit" 
                    style="background:var(--wp--preset--color--primary);color:white;border:none;padding:0.625rem 1.25rem;border-radius:0.5rem;font-weight:600;cursor:pointer;">
                <?php echo esc_html($atts['button_text']); ?>
            </button>
        </div>
    </form>
    <?php
    return ob_get_clean();
}
add_shortcode('kotlinskidev_search', 'kotlinskidev_search_form_shortcode');

// Polish Search Page Integration
// Handle Polish search functionality for pages using search_pl.html template
function kotlinskidev_handle_polish_search_integration() {
    // Check if current page is using the Polish search template
    $template = get_page_template_slug();
    
    if ($template === 'search_pl.html') {
        global $wp_query;
        
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search query detection, no state change
        if (isset($_GET['s']) && !empty($_GET['s'])) {
            $wp_query->is_search = true;
            $wp_query->is_page = false;
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search query filtering, no state change
            $wp_query->set('s', sanitize_text_field(wp_unslash($_GET['s'])));
            
            // Use the same enhanced search functionality we already have
            // The kotlinskidev_enhance_search function will handle the rest
        }
    }
}
add_action('wp', 'kotlinskidev_handle_polish_search_integration');

// Redirect Polish search forms to Polish search page when Polish locale is active
function kotlinskidev_redirect_to_polish_search($url) {
    $locale = get_locale();
    
    if ($locale == 'pl_PL' && strpos($url, '/?s=') !== false) {
        // Cache the Polish search page lookup — get_pages() with a meta_query is an
        // extra DB query that would fire on every search link rendered on the page.
        $cache_key = 'kotlinskidev_polish_search_page_id';
        $polish_page_id = wp_cache_get($cache_key);
        
        if ($polish_page_id === false) {
            $polish_search_pages = get_pages(array(
                'meta_key'   => '_wp_page_template',
                'meta_value' => 'search_pl.html',
                'number'     => 1,
            ));
            $polish_page_id = !empty($polish_search_pages) ? $polish_search_pages[0]->ID : 0;
            wp_cache_set($cache_key, $polish_page_id, '', HOUR_IN_SECONDS);
        }
        
        if ($polish_page_id) {
            $polish_url  = get_permalink($polish_page_id);
            $search_term = str_replace('/?s=', '', $url);
            $url = add_query_arg('s', $search_term, $polish_url);
        }
    }
    
    return $url;
}
add_filter('search_link', 'kotlinskidev_redirect_to_polish_search');

// Add custom post states for pages using Polish search template
function kotlinskidev_display_polish_search_states($post_states, $post) {
    $template = get_page_template_slug($post->ID);
    
    if ($template === 'search_pl.html') {
        $post_states['polish_search'] = __('Polish Search Page', 'kotlinskidev');
    }
    return $post_states;
}
add_filter('display_post_states', 'kotlinskidev_display_polish_search_states', 10, 2);

function kotlinskidev_render_blog_topics_grid_fresh_per_language() {
    $categories = get_categories(array(
        'hide_empty' => true,
        'exclude' => array(1),
        'orderby' => 'name',
        'order' => 'ASC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    ));

    if (empty($categories)) {
        ob_start();
        ?>
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group" style="padding-top:1.25rem;padding-bottom:1.25rem">
            <!-- wp:heading {"textAlign":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
            <h2 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('No topics found', 'kotlinskidev'); ?></h2>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
            <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('No blog topics have been created yet. Create some categories and add posts to them!', 'kotlinskidev'); ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
            <div class="wp-block-buttons">
                <!-- wp:button -->
                <div class="wp-block-button">
                    <a class="wp-block-button__link wp-element-button" href="<?php echo esc_url(admin_url('edit-tags.php?taxonomy=category')); ?>"><?php esc_html_e('Create Your First Topic', 'kotlinskidev'); ?></a>
                </div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
        <?php
        return do_blocks(ob_get_clean());
    }

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group" style="margin-top:0;margin-bottom:0">

        <!-- wp:html -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(21.875rem, 1fr)); gap: 1.25rem;">
            <?php foreach ($categories as $category) :
                $post_count = $category->count;
                $category_link = get_category_link($category->term_id);
                $extended_description = kotlinskidev_get_category_description($category->term_id);

                $latest_post = get_posts(array(
                    'category' => $category->term_id,
                    'posts_per_page' => 1,
                    'post_status' => 'publish',
                    'suppress_filters' => false,
                    'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
                ));

                $featured_image = '';
                if (!empty($latest_post) && has_post_thumbnail($latest_post[0]->ID)) {
                    $featured_image = get_the_post_thumbnail_url($latest_post[0]->ID, 'medium');
                }
            ?>

            <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0.125rem;border-radius:1.25rem;padding:1.25rem;box-shadow:var(--wp--preset--shadow--natural);transition:transform 0.3s ease;hover:transform:translateY(-0.3125rem);display:flex;flex-direction:column;justify-content:space-between;">

                <?php if ($featured_image) : ?>
                <div style="margin-bottom:0.9375rem;">
                    <a href="<?php echo esc_url($category_link); ?>">
                    <img src="<?php echo esc_url($featured_image); ?>"
                         alt="<?php echo esc_attr($category->name); ?>"
                         style="width:100%;height:12.5rem;object-fit:contain;border-radius:1rem;" />
                    </a>
                </div>
                <?php endif; ?>

                <div style="text-align:center;">
                <h2 style="margin-bottom:0.9375rem;font-size:1.5rem;font-weight:700;color:var(--wp--preset--color--foreground-alt);">
                    <a href="<?php echo esc_url($category_link); ?>"
                       style="color:inherit;text-decoration:none;">
                    <?php echo esc_html($category->name); ?>
                    </a>
                </h2>

                <?php if ($extended_description) : ?>
                    <p style="color:var(--wp--preset--color--foreground-alt);margin-bottom:1.25rem;line-height:1.6;">
                    <?php echo esc_html($extended_description); ?>
                    </p>
                <?php endif; ?>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5625rem;">
                    <span class="link-dark-variant-support kt-gradient-text" style="font-size:0.875rem;font-weight:600;">
                    <?php echo absint($post_count); ?> <?php echo $post_count === 1 ? esc_html__('Article', 'kotlinskidev') : esc_html__('Articles', 'kotlinskidev'); ?>
                    </span>
                    <span style="color:var(--wp--preset--color--foreground-alt);font-size:0.875rem;">
                    <?php
                    if (!empty($latest_post)) {
                        printf(
                            esc_html__('Updated %s ago', 'kotlinskidev'),
                            human_time_diff(get_the_time('U', $latest_post[0]->ID), current_time('timestamp'))
                        );
                    }
                    ?>
                    </span>
                </div>

                <a href="<?php echo esc_url($category_link); ?>"
                   class="search-link">
                    <?php printf(esc_html__('Explore %s', 'kotlinskidev'), esc_html($category->name)); ?>
                </a>
                </div>

            </div>

            <?php endforeach; ?>
        </div>
        <!-- /wp:html -->

    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}

function kotlinskidev_render_category_header_fresh_per_language() {
    $current_category = get_queried_object();
    $category_name = $current_category->name;
    $category_description = kotlinskidev_get_category_description($current_category->term_id);
    $post_count = $current_category->count;
    $custom_content = kotlinskidev_get_category_custom_content($current_category->term_id);
    $custom_links = kotlinskidev_get_category_custom_links($current_category->term_id);

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"bottom":"1.25rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group" style="margin-bottom:1.25rem">

        <!-- wp:html -->
        <div style="text-align:center;">
            <h1 style="color:var(--wp--preset--color--foreground-alt);font-weight:800;font-size:2.5rem;margin-bottom:0.625rem;">
                <?php echo esc_html($category_name); ?>
            </h1>

            <?php if ($category_description) : ?>
                <p style="color:var(--wp--preset--color--foreground-alt);font-size:1.125rem;margin-bottom:0.9375rem;">
                    <?php echo esc_html($category_description); ?>
                </p>
            <?php endif; ?>

            <div style="display:flex;justify-content:center;align-items:center;gap:1.25rem;margin-bottom:1.875rem;">
                <span class="link-dark-variant-support kt-gradient-text" style="font-weight:600;">
                    <?php echo absint($post_count) . ' ' . ($post_count === 1 ? esc_html__('Article', 'kotlinskidev') : esc_html__('Articles', 'kotlinskidev')); ?>
                </span>
                <span style="color:var(--wp--preset--color--foreground-alt);">•</span>

                <?php if (!empty($custom_links)) : ?>
                    <?php foreach ($custom_links as $index => $link) : ?>
                        <?php if ($index > 0) : ?>
                            <span style="color:var(--wp--preset--color--foreground-alt);">•</span>
                        <?php endif; ?>
                        <a href="<?php echo esc_url($link['url']); ?>" style="text-decoration:none;" class="link-dark-variant-support kt-gradient-text">
                            <?php echo esc_html($link['text']); ?>
                        </a>
                    <?php endforeach; ?>
                <?php else : ?>
                    <a href="<?php echo esc_url(home_url('/blog-topics/')); ?>" style="text-decoration:none;" class="link-dark-variant-support kt-gradient-text">
                        ← <?php esc_html_e('All Topics', 'kotlinskidev'); ?>
                    </a>
                <?php endif; ?>
            </div>

            <?php if ($custom_content) : ?>
                <div style="margin-top:1.875rem;padding:1.25rem;background:var(--wp--preset--color--light-shade);border-radius:0.75rem;border:0.0625rem solid var(--wp--preset--color--border-color);">
                    <?php echo wp_kses_post($custom_content); ?>
                </div>
            <?php endif; ?>
        </div>
        <!-- /wp:html -->

    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}

function kotlinskidev_render_category_posts_grid_fresh_per_language() {
    $current_category = get_queried_object();

    $category_posts = new WP_Query(array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => 6,
        'cat' => $current_category->term_id,
        'orderby' => 'date',
        'order' => 'DESC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    ));

    ob_start();
    ?>
    <!-- wp:query {"queryId":1,"query":{"perPage":6,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true},"layout":{"type":"constrained"}} -->
    <div class="wp-block-query">

        <!-- wp:html -->
        <?php if ($category_posts->have_posts()) : ?>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: 0.9375rem; margin-bottom: 1.25rem;">
            <?php while ($category_posts->have_posts()) : $category_posts->the_post(); ?>
            <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0.125rem;border-radius:1.125rem;padding:0.9375rem;display:flex;flex-direction:column;height:100%;box-shadow:var(--wp--preset--shadow--natural);">

                <?php if (has_post_thumbnail()) : ?>
                <div style="margin-bottom:0.9375rem;flex-shrink:0;">
                    <a href="<?php the_permalink(); ?>">
                    <img src="<?php the_post_thumbnail_url('medium_large'); ?>"
                         alt="<?php the_title(); ?>"
                         style="width:100%;height:12.5rem;object-fit:contain;border-radius:0.875rem;" />
                    </a>
                </div>
                <?php endif; ?>

                <div style="display:flex;justify-content:space-between;margin-bottom:0.9375rem;font-size:0.875rem;flex-shrink:0;">
                <span style="color:var(--wp--preset--color--foreground-alt);"><?php echo get_the_date(); ?></span>
                <span class="link-dark-variant-support kt-gradient-text"><?php echo kotlinskidev_reading_time(); ?></span>
                </div>

                <h2 style="margin-bottom:0.9375rem;font-size:1.5rem;font-weight:600;flex-shrink:0;">
                <a href="<?php the_permalink(); ?>" style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                    <?php the_title(); ?>
                </a>
                </h2>

                <div style="color:var(--wp--preset--color--foreground-alt);margin-bottom:1.5625rem;flex-grow:1;">
                <?php echo esc_html(wp_trim_words(get_the_excerpt(), 30, '...')); ?>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;flex-shrink:0;gap:0.9375rem;flex-wrap:wrap;">
                <?php
                $post_tags = get_the_tags();
                if ($post_tags) : ?>
                <div class="link-dark-variant-support kt-gradient-text" style="font-size:0.875rem;display:flex;flex-wrap:wrap;row-gap:0.3125rem;">
                    <?php the_tags('', ', ', ''); ?>
                </div>
                <?php else : ?>
                <div></div>
                <?php endif; ?>
                <a href="<?php the_permalink(); ?>"
                   class="search-link">
                    <?php esc_html_e('Read Article', 'kotlinskidev'); ?>
                </a>
                </div>

            </div>
            <?php endwhile; ?>
        </div>

        <?php if ($category_posts->max_num_pages > 1) : ?>
        <div style="display:flex;justify-content:center;margin-top:2.5rem;">
            <?php
            echo paginate_links(array(
                'total' => $category_posts->max_num_pages,
                'prev_text' => '← ' . esc_html__('Previous', 'kotlinskidev'),
                'next_text' => esc_html__('Next', 'kotlinskidev') . ' →',
            ));
            ?>
        </div>
        <?php endif; ?>

        <?php else : ?>
        <div style="text-align:center;padding:3.75rem 0;">
            <h2 style="color:var(--wp--preset--color--foreground-alt);"><?php esc_html_e('No articles in this topic yet', 'kotlinskidev'); ?></h2>
            <p style="color:var(--wp--preset--color--foreground-alt);"><?php esc_html_e('Articles for this topic are coming soon!', 'kotlinskidev'); ?></p>
        </div>
        <?php
        endif;
        wp_reset_postdata();
        ?>
        <!-- /wp:html -->
    </div>
    <!-- /wp:query -->
    <?php
    return do_blocks(ob_get_clean());
}

function kotlinskidev_render_other_topics_fresh_per_language() {
    $current_category = get_queried_object();
    $other_categories = get_categories(array(
        'hide_empty' => true,
        'exclude' => array(1, $current_category->term_id),
        'number' => 4,
        'orderby' => 'count',
        'order' => 'DESC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    ));

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"top":"1.25rem"},"padding":{"top":"1.25rem"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group" style="margin-top:1.25rem;padding-top:1.25rem;">

        <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
        <h3 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Other Topics', 'kotlinskidev'); ?></h3>
        <!-- /wp:heading -->

        <?php if (!empty($other_categories)) : ?>
        <!-- wp:html -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: 0.9375rem; margin-top: 1.25rem;">
            <?php foreach ($other_categories as $category) :
                $category_link = get_category_link($category->term_id);
                $extended_description = kotlinskidev_get_category_description($category->term_id);

                $latest_post = get_posts(array(
                    'category' => $category->term_id,
                    'posts_per_page' => 1,
                    'post_status' => 'publish',
                    'suppress_filters' => false,
                    'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
                ));

                $featured_image = '';
                $last_updated = '';
                if (!empty($latest_post)) {
                    if (has_post_thumbnail($latest_post[0]->ID)) {
                        $featured_image = get_the_post_thumbnail_url($latest_post[0]->ID, 'medium');
                    }
                    $last_updated = human_time_diff(get_the_time('U', $latest_post[0]->ID), current_time('timestamp')) . ' ago';
                }
            ?>
            <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0.125rem;border-radius:1.25rem;padding:0.9375rem;transition:transform 0.3s ease;display:flex;flex-direction:column;height:100%;box-shadow:var(--wp--preset--shadow--natural);">

                <?php if ($featured_image) : ?>
                <div style="margin-bottom:1.25rem;flex-shrink:0;">
                    <a href="<?php echo esc_url($category_link); ?>">
                    <img src="<?php echo esc_url($featured_image); ?>"
                         alt="<?php echo esc_attr($category->name); ?>"
                         style="width:100%;height:11.25rem;object-fit:contain;border-radius:1rem;" />
                    </a>
                </div>
                <?php endif; ?>

                <div style="text-align:center;flex-grow:1;display:flex;flex-direction:column;">
                <h4 style="margin-bottom:0.9375rem;font-size:1.25rem;font-weight:700;flex-shrink:0;">
                    <a href="<?php echo esc_url($category_link); ?>"
                       style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                    <?php echo esc_html($category->name); ?>
                    </a>
                </h4>

                <?php if ($extended_description) : ?>
                    <p style="color:var(--wp--preset--color--foreground-alt);margin-bottom:1.25rem;line-height:1.5;flex-grow:1;">
                    <?php echo esc_html($extended_description); ?>
                    </p>
                <?php endif; ?>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;font-size:0.875rem;flex-shrink:0;">
                    <span class="link-dark-variant-support kt-gradient-text" style="font-weight:600;">
                    <?php echo absint($category->count); ?> <?php echo $category->count === 1 ? esc_html__('article', 'kotlinskidev') : esc_html__('articles', 'kotlinskidev'); ?>
                    </span>
                    <?php if ($last_updated) : ?>
                    <span style="color:var(--wp--preset--color--foreground-alt);">
                        <?php printf(esc_html__('Updated %s', 'kotlinskidev'), esc_html($last_updated)); ?>
                    </span>
                    <?php endif; ?>
                </div>

                <div style="margin-top:auto;flex-shrink:0;">
                    <a href="<?php echo esc_url($category_link); ?>"
                       class="search-link">
                    <?php printf(esc_html__('Explore %s', 'kotlinskidev'), esc_html($category->name)); ?>
                    </a>
                </div>
                </div>

            </div>
            <?php endforeach; ?>
        </div>
        <!-- /wp:html -->

        <?php else : ?>
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"2.5rem","bottom":"2.5rem"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group" style="padding-top:2.5rem;padding-bottom:2.5rem">
            <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
            <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('No other topics available yet.', 'kotlinskidev'); ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <?php endif; ?>

    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}

function kotlinskidev_render_article_tags_fresh_per_language() {
    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"0.625rem","bottom":"0.625rem"},"margin":{"top":"0.625rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group" style="margin-top:0.625rem;padding-top:0.625rem;padding-bottom:0.625rem;">
        <!-- wp:heading {"level":3,"className":"wp-block-heading has-foreground-alt-color has-text-color has-link-color has-large-font-size"} -->
        <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-large-font-size">
            <?php esc_html_e('Tags', 'kotlinskidev'); ?>
        </h3>
        <!-- /wp:heading -->
        <!-- wp:post-terms {"term":"post_tag","className":"link-dark-variant-support kt-gradient-text"} /-->
    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}

function kotlinskidev_get_related_articles_candidate($post_id, array $tag_ids, array $category_ids, array $already_included, $limit) {
    $args = array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => $limit,
        'post__not_in' => $already_included,
        'orderby' => 'date',
        'order' => 'DESC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    );

    if (!empty($category_ids)) {
        $args['category__in'] = $category_ids;
    }
    if (!empty($tag_ids)) {
        $args['tag__in'] = $tag_ids;
    }

    $found = array();
    $query = new WP_Query($args);
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $post_obj = get_post();
            if ($post_obj->ID !== $post_id) {
                $found[] = $post_obj;
            }
        }
        wp_reset_postdata();
    }

    return $found;
}

function kotlinskidev_get_related_articles_for_current_post($limit = 3) {
    $current_post_id = get_the_ID();
    $current_categories = get_the_category($current_post_id);
    $current_tags = get_the_tags($current_post_id);
    $category_ids = !empty($current_categories) ? array($current_categories[0]->term_id) : array();
    $tag_ids = !empty($current_tags) ? array_map(fn ($tag) => $tag->term_id, $current_tags) : array();

    $related_posts = array();

    if (!empty($category_ids) && !empty($tag_ids)) {
        $related_posts = array_merge($related_posts, kotlinskidev_get_related_articles_candidate(
            $current_post_id,
            $tag_ids,
            $category_ids,
            array_merge(array($current_post_id), array_column($related_posts, 'ID')),
            $limit - count($related_posts)
        ));
    }

    if (count($related_posts) < $limit && !empty($category_ids)) {
        $related_posts = array_merge($related_posts, kotlinskidev_get_related_articles_candidate(
            $current_post_id,
            array(),
            $category_ids,
            array_merge(array($current_post_id), array_column($related_posts, 'ID')),
            $limit - count($related_posts)
        ));
    }

    if (count($related_posts) < $limit && !empty($tag_ids)) {
        $related_posts = array_merge($related_posts, kotlinskidev_get_related_articles_candidate(
            $current_post_id,
            $tag_ids,
            array(),
            array_merge(array($current_post_id), array_column($related_posts, 'ID')),
            $limit - count($related_posts)
        ));
    }

    if (count($related_posts) < $limit) {
        $related_posts = array_merge($related_posts, kotlinskidev_get_related_articles_candidate(
            $current_post_id,
            array(),
            array(),
            array_merge(array($current_post_id), array_column($related_posts, 'ID')),
            $limit - count($related_posts)
        ));
    }

    return array_values(array_filter($related_posts, fn ($post) => $post->ID !== $current_post_id));
}

function kotlinskidev_render_related_articles_fresh_per_language() {
    $current_post_id = get_the_ID();
    $current_categories = get_the_category($current_post_id);
    $current_tags = get_the_tags($current_post_id);
    $related_posts = kotlinskidev_get_related_articles_for_current_post(3);

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group has-light-shade-background-color has-background" style="padding-top:1.25rem;padding-right:var(--wp--preset--spacing--40);padding-bottom:1.25rem;padding-left:var(--wp--preset--spacing--40)">

        <!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
        <h2 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size" style="font-style:normal;font-weight:700"><?php esc_html_e('Related Articles', 'kotlinskidev') ?></h2>
        <!-- /wp:heading -->

        <!-- wp:html -->
        <?php if (!empty($related_posts)) : ?>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: 0.9375rem; margin-top: 1.25rem;">
            <?php foreach ($related_posts as $display_post) : ?>
            <div class="wp-block-group has-border-color has-border-color-border-color has-background-alt-background-color has-background" style="border-width:0.125rem;border-radius:1.125rem;padding:0.9375rem;display:flex;flex-direction:column;height:100%;box-shadow:var(--wp--preset--shadow--natural);">

                <?php if (has_post_thumbnail($display_post->ID)) : ?>
                    <div style="margin-bottom:0.9375rem;flex-shrink:0;">
                        <a href="<?php echo esc_url(get_permalink($display_post->ID)); ?>">
                            <img src="<?php echo esc_url(get_the_post_thumbnail_url($display_post->ID, 'medium_large')); ?>"
                                 alt="<?php echo esc_attr($display_post->post_title); ?>"
                                 style="width:100%;height:11.25rem;object-fit:contain;border-radius:0.875rem;" />
                        </a>
                    </div>
                <?php endif; ?>

                <div style="display:flex;justify-content:space-between;margin-bottom:0.9375rem;font-size:0.875rem;flex-shrink:0;">
                    <span style="color:var(--wp--preset--color--foreground-alt);"><?php echo get_the_date('', $display_post->ID); ?></span>
                    <span class="link-dark-variant-support kt-gradient-text">
                        <?php
                        $post_categories = get_the_category($display_post->ID);
                        $post_tags = get_the_tags($display_post->ID);

                        $same_category = !empty($current_categories) && !empty($post_categories) &&
                                       $current_categories[0]->term_id === $post_categories[0]->term_id;

                        $same_tags = false;
                        if (!empty($current_tags) && !empty($post_tags)) {
                            $current_tag_ids = array_column($current_tags, 'term_id');
                            $post_tag_ids = array_column($post_tags, 'term_id');
                            $same_tags = !empty(array_intersect($current_tag_ids, $post_tag_ids));
                        }

                        if ($same_category && $same_tags) {
                            echo '🎯 ' . esc_html__('Highly Related', 'kotlinskidev');
                        } elseif ($same_category) {
                            echo '📂 ' . esc_html__('Same Topic', 'kotlinskidev');
                        } elseif ($same_tags) {
                            echo '🏷️ ' . esc_html__('Similar Tags', 'kotlinskidev');
                        } else {
                            echo kotlinskidev_reading_time($display_post->ID);
                        }
                        ?>
                    </span>
                </div>

                <h3 style="margin-bottom:1.25rem;font-size:1.25rem;font-weight:600;flex-shrink:0;">
                    <a href="<?php echo esc_url(get_permalink($display_post->ID)); ?>" style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                        <?php echo esc_html($display_post->post_title); ?>
                    </a>
                </h3>

                <div style="color:var(--wp--preset--color--foreground-alt);margin-bottom:1.5625rem;flex-grow:1;">
                    <?php
                    $excerpt = $display_post->post_excerpt;
                    if (empty($excerpt)) {
                        $excerpt = $display_post->post_content;
                    }
                    echo esc_html(wp_trim_words($excerpt, 25, '...'));
                    ?>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;flex-shrink:0;gap:0.9375rem;flex-wrap:wrap;">
                    <div class="link-dark-variant-support kt-gradient-text" style="font-size:0.875rem;display:flex;flex-wrap:wrap;row-gap:0.3125rem;">
                        <?php
                        $post_categories = get_the_category($display_post->ID);
                        if (!empty($post_categories)) {
                            echo esc_html($post_categories[0]->name);
                        }
                        ?>
                    </div>
                    <a href="<?php echo esc_url(get_permalink($display_post->ID)); ?>"
                       class="search-link">
                        <?php esc_html_e('Read Article', 'kotlinskidev'); ?>
                    </a>
                </div>

            </div>
            <?php endforeach; ?>
        </div>

        <?php else : ?>
        <div style="text-align:center;padding:2.5rem 0;">
            <p style="color:var(--wp--preset--color--foreground-alt);"><?php esc_html_e('No related articles found.', 'kotlinskidev'); ?></p>
        </div>
        <?php endif; ?>
        <!-- /wp:html -->

    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}

function kotlinskidev_register_blog_dynamic_blocks() {
    register_block_type('kotlinskidev/blog-topics-grid-dynamic', array(
        'render_callback' => 'kotlinskidev_render_blog_topics_grid_fresh_per_language',
    ));
    register_block_type('kotlinskidev/category-header-dynamic', array(
        'render_callback' => 'kotlinskidev_render_category_header_fresh_per_language',
    ));
    register_block_type('kotlinskidev/category-posts-grid-dynamic', array(
        'render_callback' => 'kotlinskidev_render_category_posts_grid_fresh_per_language',
    ));
    register_block_type('kotlinskidev/other-topics-dynamic', array(
        'render_callback' => 'kotlinskidev_render_other_topics_fresh_per_language',
    ));
    register_block_type('kotlinskidev/article-tags-dynamic', array(
        'render_callback' => 'kotlinskidev_render_article_tags_fresh_per_language',
    ));
    register_block_type('kotlinskidev/related-articles-dynamic', array(
        'render_callback' => 'kotlinskidev_render_related_articles_fresh_per_language',
    ));
}
add_action('init', 'kotlinskidev_register_blog_dynamic_blocks');