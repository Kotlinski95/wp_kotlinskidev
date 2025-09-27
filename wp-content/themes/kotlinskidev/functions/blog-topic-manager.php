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
    ?>
    <div class="form-field">
        <label for="kotlinskidev_category_description"><?php _e('Extended Description', 'kotlinskidev'); ?></label>
        <textarea name="kotlinskidev_category_description" id="kotlinskidev_category_description" rows="5" cols="50"></textarea>
        <p class="description"><?php _e('This description will be shown on the category archive page.', 'kotlinskidev'); ?></p>
    </div>
    <?php
}

// Add custom description field to category editing
function kotlinskidev_edit_category_description_field($term) {
    $extended_description = get_term_meta($term->term_id, 'kotlinskidev_category_description', true);
    ?>
    <tr class="form-field">
        <th scope="row" valign="top">
            <label for="kotlinskidev_category_description"><?php _e('Extended Description', 'kotlinskidev'); ?></label>
        </th>
        <td>
            <textarea name="kotlinskidev_category_description" id="kotlinskidev_category_description" rows="5" cols="50"><?php echo esc_textarea($extended_description); ?></textarea>
            <p class="description"><?php _e('This description will be shown on the category archive page.', 'kotlinskidev'); ?></p>
        </td>
    </tr>
    <?php
}

// Save custom category description
function kotlinskidev_save_category_description($term_id) {
    if (isset($_POST['kotlinskidev_category_description'])) {
        update_term_meta($term_id, 'kotlinskidev_category_description', sanitize_textarea_field($_POST['kotlinskidev_category_description']));
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
            $breadcrumbs[] = '<span>' . get_the_title() . '</span>';
        }
    }
    
    if (count($breadcrumbs) > 1) {
        echo '<nav class="kotlinskidev-breadcrumbs" style="margin-bottom:1.875rem;font-size:0.875rem;color:var(--wp--preset--color--foreground-alt);">';
        echo implode(' <span style="margin:0 0.5rem;">→</span> ', $breadcrumbs);
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
    
    return $reading_time . ' ' . __('min read', 'kotlinskidev');
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
    
    $related_posts = get_posts(array(
        'category__in' => $category_ids,
        'post__not_in' => array($post_id),
        'posts_per_page' => $limit,
        'post_status' => 'publish',
        'orderby' => 'rand'
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
            'post_status' => 'publish'
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
            <label for="kotlinskidev_category_custom_content"><?php _e('Custom Banner/Content', 'kotlinskidev'); ?></label>
        </th>
        <td>
            <textarea name="kotlinskidev_category_custom_content" id="kotlinskidev_category_custom_content" rows="4" cols="50" placeholder="Add custom HTML content, banners, or announcements for this category..."><?php echo esc_textarea($custom_content); ?></textarea>
            <p class="description"><?php _e('Custom HTML content that will appear below the category header. You can add banners, special announcements, or custom links here.', 'kotlinskidev'); ?></p>
        </td>
    </tr>
    
    <tr class="form-field">
        <th scope="row" valign="top">
            <label for="kotlinskidev_category_custom_links"><?php _e('Custom Navigation Links', 'kotlinskidev'); ?></label>
        </th>
        <td>
            <textarea name="kotlinskidev_category_custom_links" id="kotlinskidev_category_custom_links" rows="3" cols="50" placeholder="Home|/
Resources|/resources
Tutorials|/tutorials"><?php echo esc_textarea($custom_links); ?></textarea>
            <p class="description"><?php _e('Custom navigation links in format: "Link Text|URL" (one per line). This will replace the default "← All Topics" link.', 'kotlinskidev'); ?></p>
        </td>
    </tr>
    <?php
}
add_action('category_edit_form_fields', 'kotlinskidev_add_category_custom_content_field');

// Add custom content field to category creation
function kotlinskidev_add_category_custom_content_field_new($taxonomy) {
    ?>
    <div class="form-field">
        <label for="kotlinskidev_category_custom_content"><?php _e('Custom Banner/Content', 'kotlinskidev'); ?></label>
        <textarea name="kotlinskidev_category_custom_content" id="kotlinskidev_category_custom_content" rows="4" cols="50" placeholder="Add custom HTML content, banners, or announcements..."></textarea>
        <p class="description"><?php _e('Custom HTML content that will appear below the category header.', 'kotlinskidev'); ?></p>
    </div>
    
    <div class="form-field">
        <label for="kotlinskidev_category_custom_links"><?php _e('Custom Navigation Links', 'kotlinskidev'); ?></label>
        <textarea name="kotlinskidev_category_custom_links" id="kotlinskidev_category_custom_links" rows="3" cols="50" placeholder="Home|/
Resources|/resources"></textarea>
        <p class="description"><?php _e('Custom navigation links in format: "Link Text|URL" (one per line).', 'kotlinskidev'); ?></p>
    </div>
    <?php
}
add_action('category_add_form_fields', 'kotlinskidev_add_category_custom_content_field_new');

// Save custom category content and links
function kotlinskidev_save_category_custom_content($term_id) {
    if (isset($_POST['kotlinskidev_category_custom_content'])) {
        update_term_meta($term_id, 'kotlinskidev_category_custom_content', wp_kses_post($_POST['kotlinskidev_category_custom_content']));
    }
    
    if (isset($_POST['kotlinskidev_category_custom_links'])) {
        update_term_meta($term_id, 'kotlinskidev_category_custom_links', sanitize_textarea_field($_POST['kotlinskidev_category_custom_links']));
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
    echo '<p>' . __('Configure breadcrumb navigation texts and URLs for both English and Polish versions of your site.', 'kotlinskidev') . '</p>';
}

// Text field callback
function kotlinskidev_breadcrumb_text_field($args) {
    $options = get_option('kotlinskidev_breadcrumb_settings');
    $value = isset($options[$args['field']]) ? $options[$args['field']] : '';
    echo '<input type="text" name="kotlinskidev_breadcrumb_settings[' . $args['field'] . ']" value="' . esc_attr($value) . '" placeholder="' . esc_attr($args['placeholder']) . '" class="regular-text" />';
}

// URL field callback
function kotlinskidev_breadcrumb_url_field($args) {
    $options = get_option('kotlinskidev_breadcrumb_settings');
    $value = isset($options[$args['field']]) ? $options[$args['field']] : '';
    echo '<input type="text" name="kotlinskidev_breadcrumb_settings[' . $args['field'] . ']" value="' . esc_attr($value) . '" placeholder="' . esc_attr($args['placeholder']) . '" class="regular-text" />';
    echo '<p class="description">' . __('Enter a relative path (e.g., /articles, /blog-topics) or full URL (e.g., https://yoursite.com/topics/)', 'kotlinskidev') . '</p>';
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
            <h3><?php _e('How to Use', 'kotlinskidev'); ?></h3>
            <ul>
                <li><?php _e('Set custom text for "Home" and "Topics" links in both languages', 'kotlinskidev'); ?></li>
                <li><?php _e('Configure URLs for your topics pages (can be relative paths or full URLs)', 'kotlinskidev'); ?></li>
                <li><?php _e('Leave fields empty to use default values', 'kotlinskidev'); ?></li>
                <li><?php _e('Changes will apply immediately to all category and article pages', 'kotlinskidev'); ?></li>
            </ul>
        </div>
    </div>
    <?php
}

// Get breadcrumb settings with fallbacks
function kotlinskidev_get_breadcrumb_settings($locale = null) {
    if (!$locale) {
        $locale = get_locale();
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
    if (empty($search_query)) {
        return $text;
    }
    
    // Split search query into individual words
    $words = explode(' ', $search_query);
    
    foreach ($words as $word) {
        if (strlen(trim($word)) > 2) { // Only highlight words longer than 2 characters
            $text = preg_replace(
                '/(' . preg_quote(trim($word), '/') . ')/i',
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
            
            // Handle Polish search page specifically
            if ($is_polish_search) {
                $query->set('s', sanitize_text_field($_GET['s']));
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
        
        if (isset($_GET['s']) && !empty($_GET['s'])) {
            $wp_query->is_search = true;
            $wp_query->is_page = false;
            $wp_query->set('s', sanitize_text_field($_GET['s']));
            
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
        // Try to find a page using Polish search template (search_pl.html)
        $polish_search_pages = get_pages(array(
            'meta_key' => '_wp_page_template',
            'meta_value' => 'search_pl.html',
            'number' => 1
        ));
        
        if (!empty($polish_search_pages)) {
            $polish_page = $polish_search_pages[0];
            $polish_url = get_permalink($polish_page->ID);
            // Replace /?s= with polish page URL + ?s=
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