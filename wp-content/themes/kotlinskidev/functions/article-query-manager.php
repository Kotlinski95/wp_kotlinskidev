<?php
function kotlinskidev_add_article_query_meta_boxes() {
    add_meta_box(
        'article_query_settings',
        'Article Query Settings',
        'kotlinskidev_article_query_meta_box_callback',
        'page',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'kotlinskidev_add_article_query_meta_boxes');

// Meta box callback function
function kotlinskidev_article_query_meta_box_callback($post) {
    // Add nonce for security
    wp_nonce_field('kotlinskidev_article_query_nonce', 'kotlinskidev_article_query_nonce');
    
    // Get existing values
    $posts_per_page = get_post_meta($post->ID, '_posts_per_page', true) ?: '6';
    $filter_category = get_post_meta($post->ID, '_filter_category', true);
    $filter_tags = get_post_meta($post->ID, '_filter_tags', true);
    $column_count = get_post_meta($post->ID, '_column_count', true) ?: '3';
    $show_featured_only = get_post_meta($post->ID, '_show_featured_only', true);
    $order_by = get_post_meta($post->ID, '_order_by', true) ?: 'date';
    $order = get_post_meta($post->ID, '_order', true) ?: 'DESC';
    
    ?>
    <table class="form-table">
        <tr>
            <th scope="row"><label for="posts_per_page"><?php esc_html_e('Posts Per Page', 'kotlinskidev'); ?></label></th>
            <td>
                <input type="number" id="posts_per_page" name="posts_per_page" value="<?php echo esc_attr($posts_per_page); ?>" min="1" max="50" />
                <p class="description"><?php esc_html_e('How many articles to show (1-50)', 'kotlinskidev'); ?></p>
            </td>
        </tr>

        <tr>
            <th scope="row"><label for="filter_category"><?php esc_html_e('Filter by Category', 'kotlinskidev'); ?></label></th>
            <td>
                <?php
                wp_dropdown_categories(array(
                    'name' => 'filter_category',
                    'id' => 'filter_category',
                    'selected' => $filter_category,
                    'show_option_none' => __('All Categories', 'kotlinskidev'),
                    'option_none_value' => '',
                    'hide_empty' => false
                ));
                ?>
                <p class="description"><?php esc_html_e('Show articles from a specific category only', 'kotlinskidev'); ?></p>
            </td>
        </tr>

        <tr>
            <th scope="row"><label for="filter_tags"><?php esc_html_e('Filter by Tags', 'kotlinskidev'); ?></label></th>
            <td>
                <?php
                $tags = get_tags(array('hide_empty' => false));
                $selected_tags = is_array($filter_tags) ? $filter_tags : explode(',', $filter_tags);
                ?>
                <select name="filter_tags[]" id="filter_tags" multiple style="width: 18.75rem; height: 7.5rem;">
                    <?php foreach($tags as $tag): ?>
                        <option value="<?php echo absint($tag->term_id); ?>" <?php echo in_array($tag->term_id, $selected_tags) ? 'selected' : ''; ?>>
                            <?php echo esc_html($tag->name); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <p class="description"><?php esc_html_e('Hold Ctrl/Cmd to select multiple tags', 'kotlinskidev'); ?></p>
            </td>
        </tr>

        <tr>
            <th scope="row"><label for="column_count"><?php esc_html_e('Columns', 'kotlinskidev'); ?></label></th>
            <td>
                <select name="column_count" id="column_count">
                    <option value="1" <?php selected($column_count, '1'); ?>><?php esc_html_e('1 Column (List)', 'kotlinskidev'); ?></option>
                    <option value="2" <?php selected($column_count, '2'); ?>><?php esc_html_e('2 Columns', 'kotlinskidev'); ?></option>
                    <option value="3" <?php selected($column_count, '3'); ?>><?php esc_html_e('3 Columns', 'kotlinskidev'); ?></option>
                    <option value="4" <?php selected($column_count, '4'); ?>><?php esc_html_e('4 Columns', 'kotlinskidev'); ?></option>
                </select>
                <p class="description"><?php esc_html_e('Layout columns for article grid', 'kotlinskidev'); ?></p>
            </td>
        </tr>

        <tr>
            <th scope="row"><label for="show_featured_only"><?php esc_html_e('Featured Only', 'kotlinskidev'); ?></label></th>
            <td>
                <input type="checkbox" id="show_featured_only" name="show_featured_only" value="1" <?php checked($show_featured_only, '1'); ?> />
                <label for="show_featured_only"><?php esc_html_e('Show only featured articles', 'kotlinskidev'); ?></label>
                <p class="description"><?php esc_html_e('Enable this to show only articles marked as featured', 'kotlinskidev'); ?></p>
            </td>
        </tr>

        <tr>
            <th scope="row"><label for="order_by"><?php esc_html_e('Order By', 'kotlinskidev'); ?></label></th>
            <td>
                <select name="order_by" id="order_by">
                    <option value="date" <?php selected($order_by, 'date'); ?>><?php esc_html_e('Date', 'kotlinskidev'); ?></option>
                    <option value="title" <?php selected($order_by, 'title'); ?>><?php esc_html_e('Title', 'kotlinskidev'); ?></option>
                    <option value="menu_order" <?php selected($order_by, 'menu_order'); ?>><?php esc_html_e('Menu Order', 'kotlinskidev'); ?></option>
                    <option value="rand" <?php selected($order_by, 'rand'); ?>><?php esc_html_e('Random', 'kotlinskidev'); ?></option>
                    <option value="comment_count" <?php selected($order_by, 'comment_count'); ?>><?php esc_html_e('Most Commented', 'kotlinskidev'); ?></option>
                </select>

                <select name="order" id="order" style="margin-left: 0.625rem;">
                    <option value="DESC" <?php selected($order, 'DESC'); ?>><?php esc_html_e('Descending', 'kotlinskidev'); ?></option>
                    <option value="ASC" <?php selected($order, 'ASC'); ?>><?php esc_html_e('Ascending', 'kotlinskidev'); ?></option>
                </select>
                <p class="description"><?php esc_html_e('How to sort the articles', 'kotlinskidev'); ?></p>
            </td>
        </tr>
    </table>
    
    <style>
    .form-table th {
        width: 12.5rem;
    }
    .form-table td {
        vertical-align: top;
    }
    .form-table .description {
        font-style: italic;
        color: #666;
        margin-top: 0.3125rem;
    }
    </style>
    <?php
}

// Save meta box data
function kotlinskidev_save_article_query_meta_box($post_id) {
    // Check nonce
    if (!isset($_POST['kotlinskidev_article_query_nonce']) ||
        !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['kotlinskidev_article_query_nonce'])), 'kotlinskidev_article_query_nonce')) {
        return;
    }
    
    // Check if user has permission
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    // Save fields
    $fields = array(
        'posts_per_page' => 'sanitize_text_field',
        'filter_category' => 'sanitize_text_field', 
        'filter_tags' => 'array',
        'column_count' => 'sanitize_text_field',
        'show_featured_only' => 'sanitize_text_field',
        'order_by' => 'sanitize_text_field',
        'order' => 'sanitize_text_field'
    );
    
    foreach ($fields as $field => $sanitize_func) {
        if (isset($_POST[$field])) {
            $value = wp_unslash($_POST[$field]); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- $sanitize_func is always 'sanitize_text_field' or 'array' from the fixed $fields whitelist above, applied immediately below

            if ($sanitize_func === 'array') {
                $value = array_map('sanitize_text_field', (array)$value);
                $value = implode(',', $value);
            } else {
                $value = $sanitize_func($value);
            }
            
            update_post_meta($post_id, '_' . $field, $value);
        } else {
            delete_post_meta($post_id, '_' . $field);
        }
    }
}
add_action('save_post', 'kotlinskidev_save_article_query_meta_box');

// Add featured post checkbox to post edit screen
function kotlinskidev_add_featured_post_meta_box() {
    add_meta_box(
        'featured_post',
        'Featured Post',
        'kotlinskidev_featured_post_callback',
        'post',
        'side',
        'high'
    );
}
add_action('add_meta_boxes', 'kotlinskidev_add_featured_post_meta_box');

function kotlinskidev_featured_post_callback($post) {
    wp_nonce_field('kotlinskidev_featured_post_nonce', 'kotlinskidev_featured_post_nonce');
    $featured = get_post_meta($post->ID, '_featured_post', true);
    ?>
    <p>
        <input type="checkbox" id="featured_post" name="featured_post" value="1" <?php checked($featured, '1'); ?> />
        <label for="featured_post"><?php esc_html_e('Mark as Featured Article', 'kotlinskidev'); ?></label>
    </p>
    <?php
}

// Save featured post meta
function kotlinskidev_save_featured_post_meta($post_id) {
    if (!isset($_POST['kotlinskidev_featured_post_nonce']) ||
        !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['kotlinskidev_featured_post_nonce'])), 'kotlinskidev_featured_post_nonce')) {
        return;
    }
    
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    if (isset($_POST['featured_post'])) {
        update_post_meta($post_id, '_featured_post', '1');
    } else {
        delete_post_meta($post_id, '_featured_post');
    }
}
add_action('save_post', 'kotlinskidev_save_featured_post_meta');