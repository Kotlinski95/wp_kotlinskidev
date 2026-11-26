<?php
function kotlinskidev_category_description_support() {
    add_action('category_add_form_fields', 'kotlinskidev_add_category_description_field');
    add_action('category_edit_form_fields', 'kotlinskidev_edit_category_description_field');
    add_action('created_category', 'kotlinskidev_save_category_description');
    add_action('edited_category', 'kotlinskidev_save_category_description');
}
add_action('init', 'kotlinskidev_category_description_support');

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

function kotlinskidev_can_save_category_fields() {
    if (!isset($_POST['kotlinskidev_category_fields_nonce']) ||
        !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['kotlinskidev_category_fields_nonce'])), 'kotlinskidev_category_fields_action')) {
        return false;
    }

    return current_user_can('manage_categories');
}

function kotlinskidev_save_category_description($term_id) {
    if (!kotlinskidev_can_save_category_fields()) {
        return;
    }

    if (isset($_POST['kotlinskidev_category_description'])) {
        update_term_meta($term_id, 'kotlinskidev_category_description', sanitize_textarea_field(wp_unslash($_POST['kotlinskidev_category_description'])));
    }
}

function kotlinskidev_get_category_description($category_id) {
    $extended_description = get_term_meta($category_id, 'kotlinskidev_category_description', true);
    return $extended_description ?: get_category($category_id)->description;
}
