<?php
function kotlinskidev_search_form_text_field_markup( array $form ): string {
    $current_search = $form['current_search'];
    $label_style_override = $form['label_style_override'];
    $field_style_override = $form['field_style_override'];
    ob_start();
?>
            <div style="margin-bottom:1.25rem;">
                <label for="search-input" class="search-label"<?php echo $label_style_override; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on the attribute's own color value ?>>
                    🔍 <?php esc_html_e('Search for content', 'kotlinskidev'); ?>
                </label>
                <input type="text"
                       id="search-input"
                       name="s"
                       value="<?php echo esc_attr($current_search); ?>"
                       placeholder="<?php esc_attr_e('Enter keywords, topics, or specific terms...', 'kotlinskidev'); ?>"
                       class="search-input-field"
                       required
                       aria-describedby="search-input-description"<?php echo $field_style_override; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on the attribute's own color value ?> />
                <div id="search-input-description" class="sr-only">
                    <?php esc_html_e('Search across all articles, pages, and content on the site', 'kotlinskidev'); ?>
                </div>
            </div>

<?php
    return ob_get_clean();
}

function kotlinskidev_search_form_type_field_markup( array $form ): string {
    $current_type = $form['current_type'];
    $label_style_override = $form['label_style_override'];
    $field_style_override = $form['field_style_override'];
    ob_start();
?>
                <div>
                    <label for="search-type" class="search-label"<?php echo $label_style_override; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on the attribute's own color value ?>>
                        📄 <?php esc_html_e('Content Type', 'kotlinskidev'); ?>
                    </label>
                    <select name="search_type"
                            id="search-type"
                            class="search-select-field"
                            aria-describedby="search-type-description"<?php echo $field_style_override; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on the attribute's own color value ?>>
                        <option value=""><?php esc_html_e('All Content', 'kotlinskidev'); ?></option>
                        <option value="post" <?php selected($current_type, 'post'); ?>><?php esc_html_e('Articles', 'kotlinskidev'); ?></option>
                        <option value="page" <?php selected($current_type, 'page'); ?>><?php esc_html_e('Pages', 'kotlinskidev'); ?></option>
                    </select>
                    <div id="search-type-description" class="sr-only">
                        <?php esc_html_e('Filter results by content type: articles, pages, or all content', 'kotlinskidev'); ?>
                    </div>
                </div>

<?php
    return ob_get_clean();
}

function kotlinskidev_search_form_category_field_markup( array $form ): string {
    $current_category = $form['current_category'];
    $categories = $form['categories'];
    $label_style_override = $form['label_style_override'];
    $field_style_override = $form['field_style_override'];
    ob_start();
?>
                <div>
                    <label for="search-category" class="search-label"<?php echo $label_style_override; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on the attribute's own color value ?>>
                        📂 <?php esc_html_e('Topic Category', 'kotlinskidev'); ?>
                    </label>
                    <select name="search_category"
                            id="search-category"
                            class="search-select-field"
                            aria-describedby="search-category-description"<?php echo $field_style_override; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on the attribute's own color value ?>>
                        <option value=""><?php esc_html_e('All Topics', 'kotlinskidev'); ?></option>
                        <?php
                        foreach ($categories as $category) {
                            echo '<option value="' . esc_attr($category->slug) . '"' . selected($current_category, $category->slug, false) . '>';
                            echo esc_html($category->name) . ' (' . absint($category->count) . ')';
                            echo '</option>';
                        }
                        ?>
                    </select>
                    <div id="search-category-description" class="sr-only">
                        <?php esc_html_e('Filter results by topic category', 'kotlinskidev'); ?>
                    </div>
                </div>
<?php
    return ob_get_clean();
}
