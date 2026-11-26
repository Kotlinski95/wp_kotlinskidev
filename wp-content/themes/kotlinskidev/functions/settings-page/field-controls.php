<?php
function kotlinskidev_register_boolean_setting(string $group, string $option, bool $default): void
{
    register_setting(
        $group,
        $option,
        [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => $default,
        ]
    );
}

function kotlinskidev_add_settings_fields(string $page, string $section, array $fields): void
{
    foreach ($fields as $field_id => $field) {
        add_settings_field($field_id, $field['title'], $field['callback'], $page, $section, $field['args'] ?? []);
    }
}

function kotlinskidev_render_checkbox_field(array $field): void
{
    $enabled = (bool) get_option($field['option'], $field['default']);
    ?>
    <label>
        <input type="checkbox" name="<?php echo esc_attr($field['option']); ?>" value="1" <?php checked($enabled); ?> />
        <?php echo esc_html($field['label']); ?>
    </label>
    <?php if (isset($field['description'])) : ?>
    <p class="description">
        <?php echo esc_html($field['description']); ?>
    </p>
    <?php endif; ?>
    <?php
}

function kotlinskidev_render_number_field(array $field): void
{
    ?>
    <input type="number" id="<?php echo esc_attr($field['option']); ?>" name="<?php echo esc_attr($field['option']); ?>" value="<?php echo esc_attr((string) $field['value']); ?>" min="<?php echo esc_attr((string) $field['min']); ?>" max="<?php echo esc_attr((string) $field['max']); ?>" step="1" />
    <p class="description">
        <?php echo esc_html($field['description']); ?>
    </p>
    <?php
}
