<?php
function kotlinskidev_register_site_values_settings(): void
{
    register_setting(
        'kotlinskidev_settings_site_values',
        'kotlinskidev_site_values',
        [
            'type'              => 'array',
            'sanitize_callback' => 'kotlinskidev_sanitize_site_values',
            'default'           => [],
        ]
    );

    add_settings_section(
        'kotlinskidev_section_site_values',
        esc_html__('Site values', 'kotlinskidev'),
        'kotlinskidev_render_site_values_section',
        'kotlinskidev-settings-site-values'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-site-values', 'kotlinskidev_section_site_values', [
        'kotlinskidev_site_values' => [
            'title'    => esc_html__('Values', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_site_values_field',
        ],
    ]);
}

function kotlinskidev_site_values_languages(): array
{
    if (!function_exists('pll_languages_list')) {
        return [];
    }
    $slugs = pll_languages_list(['fields' => 'slug']);
    $names = pll_languages_list(['fields' => 'name']);
    if (!is_array($slugs) || [] === $slugs) {
        return [];
    }
    $names = is_array($names) ? array_values($names) : [];
    $out   = [];
    foreach (array_values($slugs) as $i => $slug) {
        $out[(string) $slug] = (string) ($names[$i] ?? $slug);
    }
    return $out;
}

function kotlinskidev_render_site_values_section(): void
{
    echo '<p>' . esc_html__('Named values that can be reused anywhere in content. Write {token:key} in a paragraph, heading, button or menu item and it is replaced with the current value when the page is rendered. Unknown keys are left as plain text.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_site_value_row(string $index, array $row, array $languages): void
{
    $key    = (string) ($row['key'] ?? '');
    $type   = (string) ($row['type'] ?? 'static');
    $value  = $row['value'] ?? '';
    $name   = 'kotlinskidev_site_values[' . $index . ']';
    $labels = [
        'years_since'  => esc_html__('Years since', 'kotlinskidev'),
        'current_year' => esc_html__('Current year', 'kotlinskidev'),
        'static'       => esc_html__('Static text', 'kotlinskidev'),
    ];
    ?>
    <tr class="kotlinskidev-site-value-row" data-type="<?php echo esc_attr($type); ?>">
        <td>
            <input type="text" name="<?php echo esc_attr($name); ?>[key]" value="<?php echo esc_attr($key); ?>" class="regular-text kotlinskidev-site-value-key" pattern="[a-z0-9_\-]+" required />
            <p class="description"><code class="kotlinskidev-site-value-token">{token:<?php echo esc_html($key); ?>}</code></p>
        </td>
        <td>
            <select name="<?php echo esc_attr($name); ?>[type]" class="kotlinskidev-site-value-type">
                <?php foreach (kotlinskidev_site_value_types() as $option) : ?>
                    <option value="<?php echo esc_attr($option); ?>" <?php selected($type, $option); ?>><?php echo esc_html($labels[$option]); ?></option>
                <?php endforeach; ?>
            </select>
        </td>
        <td>
            <div class="kotlinskidev-site-value-field" data-for="years_since">
                <input type="text" name="<?php echo esc_attr($name); ?>[source]" value="<?php echo esc_attr('years_since' === $type ? (string) $value : ''); ?>" placeholder="2020 / 2020-03-01" <?php disabled('years_since' !== $type); ?> />
                <p class="description"><?php esc_html_e('Start year (2020) or full date (2020-03-01). Resolves to the whole years elapsed.', 'kotlinskidev'); ?></p>
            </div>
            <div class="kotlinskidev-site-value-field" data-for="current_year">
                <p class="description"><?php esc_html_e('Resolves to the current year automatically.', 'kotlinskidev'); ?></p>
            </div>
            <div class="kotlinskidev-site-value-field" data-for="static">
                <?php if ([] === $languages) : ?>
                    <input type="text" class="regular-text" name="<?php echo esc_attr($name); ?>[value]" value="<?php echo esc_attr(is_array($value) ? (string) reset($value) : (string) $value); ?>" <?php disabled('static' !== $type); ?> />
                <?php else : ?>
                    <?php foreach ($languages as $slug => $language_name) : ?>
                        <label style="display:block;margin-bottom:0.25rem;">
                            <span><?php echo esc_html($language_name); ?></span>
                            <input type="text" class="regular-text" name="<?php echo esc_attr($name); ?>[value][<?php echo esc_attr($slug); ?>]" value="<?php echo esc_attr(is_array($value) ? (string) ($value[$slug] ?? '') : (string) $value); ?>" <?php disabled('static' !== $type); ?> />
                        </label>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </td>
        <td>
            <button type="button" class="button kotlinskidev-site-value-remove"><?php esc_html_e('Remove', 'kotlinskidev'); ?></button>
        </td>
    </tr>
    <?php
}

function kotlinskidev_render_site_values_field(): void
{
    $rows      = array_values(kotlinskidev_get_site_values());
    $languages = kotlinskidev_site_values_languages();
    ?>
    <table class="widefat striped kotlinskidev-site-values" id="kotlinskidev-site-values">
        <thead>
            <tr>
                <th><?php esc_html_e('Key', 'kotlinskidev'); ?></th>
                <th><?php esc_html_e('Type', 'kotlinskidev'); ?></th>
                <th><?php esc_html_e('Value', 'kotlinskidev'); ?></th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($rows as $i => $row) : ?>
                <?php kotlinskidev_render_site_value_row((string) $i, $row, $languages); ?>
            <?php endforeach; ?>
        </tbody>
    </table>
    <p><button type="button" class="button" id="kotlinskidev-site-value-add"><?php esc_html_e('Add value', 'kotlinskidev'); ?></button></p>
    <p class="description"><?php esc_html_e('Keys use lowercase letters, numbers, dashes and underscores, and must be unique. Rows with an empty or duplicate key are dropped on save.', 'kotlinskidev'); ?></p>
    <template id="kotlinskidev-site-value-template">
        <?php kotlinskidev_render_site_value_row('__INDEX__', ['type' => 'years_since'], $languages); ?>
    </template>
    <?php
}

function kotlinskidev_enqueue_site_values_script(string $hook): void
{
    if ('settings_page_kotlinskidev-settings' !== $hook || 'site-values' !== kotlinskidev_active_settings_tab()) {
        return;
    }

    wp_register_script('kotlinskidev-site-values-admin', '', [], null, true);
    wp_enqueue_script('kotlinskidev-site-values-admin');
    wp_add_inline_script('kotlinskidev-site-values-admin', <<<'JS'
document.addEventListener("DOMContentLoaded", function () {
    var table = document.getElementById("kotlinskidev-site-values");
    var template = document.getElementById("kotlinskidev-site-value-template");
    var addButton = document.getElementById("kotlinskidev-site-value-add");
    if (!table || !template || !addButton) {
        return;
    }
    var body = table.querySelector("tbody");
    var counter = body.querySelectorAll("tr").length;

    function syncRow(row) {
        var type = row.querySelector(".kotlinskidev-site-value-type").value;
        row.dataset.type = type;
        row.querySelectorAll(".kotlinskidev-site-value-field").forEach(function (field) {
            var active = field.dataset.for === type;
            field.hidden = !active;
            field.querySelectorAll("input").forEach(function (input) {
                input.disabled = !active;
            });
        });
        row.querySelector(".kotlinskidev-site-value-token").textContent =
            "{token:" + row.querySelector(".kotlinskidev-site-value-key").value + "}";
    }

    body.querySelectorAll("tr").forEach(syncRow);

    body.addEventListener("input", function (event) {
        var row = event.target.closest("tr");
        if (row) {
            syncRow(row);
        }
    });
    body.addEventListener("change", function (event) {
        var row = event.target.closest("tr");
        if (row) {
            syncRow(row);
        }
    });
    body.addEventListener("click", function (event) {
        var remove = event.target.closest(".kotlinskidev-site-value-remove");
        if (remove) {
            remove.closest("tr").remove();
        }
    });
    addButton.addEventListener("click", function () {
        var html = template.innerHTML.split("__INDEX__").join(String(counter));
        counter += 1;
        body.insertAdjacentHTML("beforeend", html);
        syncRow(body.lastElementChild);
    });
});
JS);
}
add_action('admin_enqueue_scripts', 'kotlinskidev_enqueue_site_values_script');
