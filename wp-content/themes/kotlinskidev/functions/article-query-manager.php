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
            <th scope="row"><label for="posts_per_page">Posts Per Page</label></th>
            <td>
                <input type="number" id="posts_per_page" name="posts_per_page" value="<?php echo esc_attr($posts_per_page); ?>" min="1" max="50" />
                <p class="description">How many articles to show (1-50)</p>
            </td>
        </tr>
        
        <tr>
            <th scope="row"><label for="filter_category">Filter by Category</label></th>
            <td>
                <?php 
                wp_dropdown_categories(array(
                    'name' => 'filter_category',
                    'id' => 'filter_category',
                    'selected' => $filter_category,
                    'show_option_none' => 'All Categories',
                    'option_none_value' => '',
                    'hide_empty' => false
                )); 
                ?>
                <p class="description">Show articles from a specific category only</p>
            </td>
        </tr>
        
        <tr>
            <th scope="row"><label for="filter_tags">Filter by Tags</label></th>
            <td>
                <?php
                $tags = get_tags(array('hide_empty' => false));
                $selected_tags = is_array($filter_tags) ? $filter_tags : explode(',', $filter_tags);
                ?>
                <select name="filter_tags[]" id="filter_tags" multiple style="width: 300px; height: 120px;">
                    <?php foreach($tags as $tag): ?>
                        <option value="<?php echo $tag->term_id; ?>" <?php echo in_array($tag->term_id, $selected_tags) ? 'selected' : ''; ?>>
                            <?php echo $tag->name; ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <p class="description">Hold Ctrl/Cmd to select multiple tags</p>
            </td>
        </tr>
        
        <tr>
            <th scope="row"><label for="column_count">Columns</label></th>
            <td>
                <select name="column_count" id="column_count">
                    <option value="1" <?php selected($column_count, '1'); ?>>1 Column (List)</option>
                    <option value="2" <?php selected($column_count, '2'); ?>>2 Columns</option>
                    <option value="3" <?php selected($column_count, '3'); ?>>3 Columns</option>
                    <option value="4" <?php selected($column_count, '4'); ?>>4 Columns</option>
                </select>
                <p class="description">Layout columns for article grid</p>
            </td>
        </tr>
        
        <tr>
            <th scope="row"><label for="show_featured_only">Featured Only</label></th>
            <td>
                <input type="checkbox" id="show_featured_only" name="show_featured_only" value="1" <?php checked($show_featured_only, '1'); ?> />
                <label for="show_featured_only">Show only featured articles</label>
                <p class="description">Enable this to show only articles marked as featured</p>
            </td>
        </tr>
        
        <tr>
            <th scope="row"><label for="order_by">Order By</label></th>
            <td>
                <select name="order_by" id="order_by">
                    <option value="date" <?php selected($order_by, 'date'); ?>>Date</option>
                    <option value="title" <?php selected($order_by, 'title'); ?>>Title</option>
                    <option value="menu_order" <?php selected($order_by, 'menu_order'); ?>>Menu Order</option>
                    <option value="rand" <?php selected($order_by, 'rand'); ?>>Random</option>
                    <option value="comment_count" <?php selected($order_by, 'comment_count'); ?>>Most Commented</option>
                </select>
                
                <select name="order" id="order" style="margin-left: 10px;">
                    <option value="DESC" <?php selected($order, 'DESC'); ?>>Descending</option>
                    <option value="ASC" <?php selected($order, 'ASC'); ?>>Ascending</option>
                </select>
                <p class="description">How to sort the articles</p>
            </td>
        </tr>
    </table>
    
    <style>
    .form-table th {
        width: 200px;
    }
    .form-table td {
        vertical-align: top;
    }
    .form-table .description {
        font-style: italic;
        color: #666;
        margin-top: 5px;
    }
    </style>
    <?php
}

// Save meta box data
function kotlinskidev_save_article_query_meta_box($post_id) {
    // Check nonce
    if (!isset($_POST['kotlinskidev_article_query_nonce']) || 
        !wp_verify_nonce($_POST['kotlinskidev_article_query_nonce'], 'kotlinskidev_article_query_nonce')) {
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
            $value = $_POST[$field];
            
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
        <label for="featured_post">Mark as Featured Article</label>
    </p>
    <?php
}

// Save featured post meta
function kotlinskidev_save_featured_post_meta($post_id) {
    if (!isset($_POST['kotlinskidev_featured_post_nonce']) || 
        !wp_verify_nonce($_POST['kotlinskidev_featured_post_nonce'], 'kotlinskidev_featured_post_nonce')) {
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