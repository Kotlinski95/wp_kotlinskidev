<?php
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

function kotlinskidev_save_category_custom_content($term_id) {
    if (!kotlinskidev_can_save_category_fields()) {
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

function kotlinskidev_get_category_custom_content($category_id) {
    return get_term_meta($category_id, 'kotlinskidev_category_custom_content', true);
}

function kotlinskidev_parse_custom_link_line($line) {
    $parts = explode('|', trim($line), 2);
    if (count($parts) !== 2) {
        return null;
    }

    return array(
        'text' => trim($parts[0]),
        'url' => trim($parts[1])
    );
}

function kotlinskidev_get_category_custom_links($category_id) {
    $links_text = get_term_meta($category_id, 'kotlinskidev_category_custom_links', true);

    if (empty($links_text)) {
        return array();
    }

    $links = array();

    foreach (explode("\n", $links_text) as $line) {
        if (empty(trim($line))) {
            continue;
        }

        $link = kotlinskidev_parse_custom_link_line($line);
        if ($link !== null) {
            $links[] = $link;
        }
    }

    return $links;
}
