<?php
function kotlinskidev_register_seo_settings(): void
{
    if (! kotlinskidev_feature_enabled('custom_seo')) {
        return;
    }

    register_setting(
        'kotlinskidev_settings_seo',
        KOTLINSKIDEV_SEO_IDENTITY_OPTION,
        [
            'type'              => 'array',
            'sanitize_callback' => 'kotlinskidev_sanitize_seo_identity',
            'default'           => [],
        ]
    );

    foreach (kotlinskidev_seo_identity_sections() as $section_id => $section) {
        add_settings_section(
            $section_id,
            $section['title'],
            'kotlinskidev_render_seo_identity_section',
            'kotlinskidev-settings-seo'
        );
        foreach ($section['fields'] as $key => $field) {
            add_settings_field(
                'kotlinskidev_seo_' . $key,
                $field['label'],
                'kotlinskidev_render_seo_identity_field',
                'kotlinskidev-settings-seo',
                $section_id,
                [
                    'key'         => $key,
                    'type'        => $field['type'],
                    'label_for'   => 'kotlinskidev_seo_' . $key,
                    'description' => $field['description'] ?? '',
                ]
            );
        }
    }
}
add_action('admin_init', 'kotlinskidev_register_seo_settings');

function kotlinskidev_seo_identity_sections(): array
{
    return [
        'kotlinskidev_section_seo_organization' => [
            'title'       => esc_html__('Organization', 'kotlinskidev'),
            'description' => esc_html__('Business entity published in the structured data (JSON-LD) on every page.', 'kotlinskidev'),
            'fields'      => [
                'org_name'            => ['label' => esc_html__('Name', 'kotlinskidev'), 'type' => 'text'],
                'org_alternate_names' => ['label' => esc_html__('Alternate names', 'kotlinskidev'), 'type' => 'list', 'description' => esc_html__('One per line.', 'kotlinskidev')],
                'description'         => ['label' => esc_html__('Description', 'kotlinskidev'), 'type' => 'lang_textarea', 'description' => esc_html__('Per language. When empty, the site tagline is used for the website only.', 'kotlinskidev')],
                'logo_id'             => ['label' => esc_html__('Logo', 'kotlinskidev'), 'type' => 'image', 'description' => esc_html__('PNG or WebP, at least 112 x 112 px. SVG is ignored. Falls back to the site icon.', 'kotlinskidev')],
                'social_profiles'     => ['label' => esc_html__('Social profiles', 'kotlinskidev'), 'type' => 'url_list', 'description' => esc_html__('One http(s) URL per line.', 'kotlinskidev')],
            ],
        ],
        'kotlinskidev_section_seo_person' => [
            'title'       => esc_html__('Person', 'kotlinskidev'),
            'description' => esc_html__('The founder shown as author of articles and owner of the organization.', 'kotlinskidev'),
            'fields'      => [
                'person_name'     => ['label' => esc_html__('Name', 'kotlinskidev'), 'type' => 'text'],
                'job_title'       => ['label' => esc_html__('Job title', 'kotlinskidev'), 'type' => 'lang_text', 'description' => esc_html__('Per language.', 'kotlinskidev')],
                'person_image_id' => ['label' => esc_html__('Image', 'kotlinskidev'), 'type' => 'image', 'description' => esc_html__('When empty, the organization logo is referenced instead.', 'kotlinskidev')],
                'about_page_slug' => ['label' => esc_html__('About page slug', 'kotlinskidev'), 'type' => 'text', 'description' => esc_html__('Default-language slug of the page used as the person URL.', 'kotlinskidev')],
            ],
        ],
        'kotlinskidev_section_seo_location' => [
            'title'       => esc_html__('Location & expertise', 'kotlinskidev'),
            'description' => esc_html__('Only city, region and country are published. The street address is never exposed.', 'kotlinskidev'),
            'fields'      => [
                'address_locality' => ['label' => esc_html__('City', 'kotlinskidev'), 'type' => 'text'],
                'address_region'   => ['label' => esc_html__('Region', 'kotlinskidev'), 'type' => 'text', 'description' => esc_html__('Optional.', 'kotlinskidev')],
                'address_country'  => ['label' => esc_html__('Country code', 'kotlinskidev'), 'type' => 'country', 'description' => esc_html__('Two-letter ISO code, for example PL.', 'kotlinskidev')],
                'area_served'      => ['label' => esc_html__('Area served', 'kotlinskidev'), 'type' => 'text'],
                'knows_about'      => ['label' => esc_html__('Knows about', 'kotlinskidev'), 'type' => 'list', 'description' => esc_html__('One topic per line.', 'kotlinskidev')],
            ],
        ],
        'kotlinskidev_section_seo_contact' => [
            'title'       => esc_html__('Contact point', 'kotlinskidev'),
            'description' => esc_html__('Contact point published with the organization.', 'kotlinskidev'),
            'fields'      => [
                'contact_type'      => ['label' => esc_html__('Contact type', 'kotlinskidev'), 'type' => 'text'],
                'contact_languages' => ['label' => esc_html__('Available languages', 'kotlinskidev'), 'type' => 'list', 'description' => esc_html__('Language codes, one per line.', 'kotlinskidev')],
                'contact_page_slug' => ['label' => esc_html__('Contact page slug', 'kotlinskidev'), 'type' => 'text', 'description' => esc_html__('Default-language slug of the contact page.', 'kotlinskidev')],
                'expose_contact'    => ['label' => esc_html__('Publish email and phone', 'kotlinskidev'), 'type' => 'checkbox', 'description' => esc_html__('Publishes the Contact Info email and phone in the JSON-LD.', 'kotlinskidev')],
            ],
        ],
        'kotlinskidev_section_seo_website' => [
            'title'       => esc_html__('Website', 'kotlinskidev'),
            'description' => esc_html__('Website entity published in the structured data.', 'kotlinskidev'),
            'fields'      => [
                'website_name'            => ['label' => esc_html__('Name', 'kotlinskidev'), 'type' => 'text'],
                'website_alternate_names' => ['label' => esc_html__('Alternate names', 'kotlinskidev'), 'type' => 'list', 'description' => esc_html__('One per line.', 'kotlinskidev')],
            ],
        ],
    ];
}

function kotlinskidev_render_seo_identity_section(array $section): void
{
    $sections = kotlinskidev_seo_identity_sections();
    $text     = $sections[$section['id']]['description'] ?? '';
    if ('' !== $text) {
        echo '<p>' . esc_html($text) . '</p>';
    }
}

function kotlinskidev_seo_identity_language_slugs(array $map): array
{
    $languages = array_keys(kotlinskidev_site_values_languages());
    if ([] !== $languages) {
        return $languages;
    }
    $slugs = array_keys($map);
    return [] !== $slugs ? $slugs : ['en'];
}

function kotlinskidev_render_seo_identity_field(array $args): void
{
    $key         = (string) ($args['key'] ?? '');
    $type        = (string) ($args['type'] ?? 'text');
    $id          = (string) ($args['label_for'] ?? '');
    $description = (string) ($args['description'] ?? '');
    $identity    = kotlinskidev_get_seo_identity();
    $value       = $identity[$key] ?? '';
    $name        = KOTLINSKIDEV_SEO_IDENTITY_OPTION . '[' . $key . ']';

    switch ($type) {
        case 'list':
        case 'url_list':
            $lines = implode("\n", array_map('strval', (array) $value));
            ?>
            <textarea id="<?php echo esc_attr($id); ?>" name="<?php echo esc_attr($name); ?>" rows="6" class="large-text code"><?php echo esc_textarea($lines); ?></textarea>
            <?php
            break;
        case 'lang_text':
        case 'lang_textarea':
            $map = is_array($value) ? $value : [];
            foreach (kotlinskidev_seo_identity_language_slugs($map) as $slug) {
                $field_name = $name . '[' . $slug . ']';
                $field_id   = $id . '_' . $slug;
                $text       = (string) ($map[$slug] ?? '');
                ?>
                <p>
                    <label for="<?php echo esc_attr($field_id); ?>"><strong><?php echo esc_html(strtoupper($slug)); ?></strong></label><br />
                    <?php if ('lang_textarea' === $type) : ?>
                        <textarea id="<?php echo esc_attr($field_id); ?>" name="<?php echo esc_attr($field_name); ?>" rows="3" class="large-text"><?php echo esc_textarea($text); ?></textarea>
                    <?php else : ?>
                        <input type="text" id="<?php echo esc_attr($field_id); ?>" name="<?php echo esc_attr($field_name); ?>" value="<?php echo esc_attr($text); ?>" class="regular-text" />
                    <?php endif; ?>
                </p>
                <?php
            }
            break;
        case 'image':
            $image_id = absint($value);
            ?>
            <input type="hidden" id="<?php echo esc_attr($id); ?>" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr((string) $image_id); ?>" />
            <div id="<?php echo esc_attr($id); ?>_preview" class="kotlinskidev-seo-media-preview"><?php echo $image_id > 0 ? wp_get_attachment_image($image_id, 'thumbnail') : ''; ?></div>
            <button type="button" class="button kotlinskidev-seo-media-button" data-target="<?php echo esc_attr($id); ?>"><?php esc_html_e('Choose Image', 'kotlinskidev'); ?></button>
            <button type="button" class="button kotlinskidev-seo-media-remove" data-target="<?php echo esc_attr($id); ?>"><?php esc_html_e('Remove', 'kotlinskidev'); ?></button>
            <?php
            break;
        case 'country':
            ?>
            <input type="text" id="<?php echo esc_attr($id); ?>" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr((string) $value); ?>" maxlength="2" size="4" class="code" />
            <?php
            break;
        case 'checkbox':
            ?>
            <input type="hidden" name="<?php echo esc_attr($name); ?>" value="0" />
            <label>
                <input type="checkbox" id="<?php echo esc_attr($id); ?>" name="<?php echo esc_attr($name); ?>" value="1" <?php checked((bool) $value); ?> />
                <?php echo esc_html($description); ?>
            </label>
            <?php
            $description = '';
            break;
        default:
            ?>
            <input type="text" id="<?php echo esc_attr($id); ?>" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr((string) $value); ?>" class="regular-text" />
            <?php
    }

    if ('' !== $description) {
        echo '<p class="description">' . esc_html($description) . '</p>';
    }

    if (in_array($key, kotlinskidev_seo_identity_overridable_keys(), true)) {
        kotlinskidev_render_seo_identity_override_notice($key, $type);
    }
}

function kotlinskidev_seo_identity_override_display(mixed $value, string $type): string
{
    if ('image' === $type) {
        $image_id = absint($value);
        $title    = $image_id > 0 ? trim((string) get_the_title($image_id)) : '';
        return '' !== $title ? $title : (string) $image_id;
    }
    if (is_array($value)) {
        return implode(', ', array_map('strval', $value));
    }
    return (string) $value;
}

function kotlinskidev_render_seo_identity_override_notice(string $key, string $type): void
{
    echo '<p class="description">' . esc_html__('Yoast SEO takes precedence over this field when it has a value.', 'kotlinskidev') . '</p>';

    $overrides = kotlinskidev_seo_identity_external_overrides();
    if (! isset($overrides[$key]['value'])) {
        return;
    }
    $source = (string) ($overrides[$key]['source'] ?? 'Yoast SEO');
    $text   = sprintf(
        __('Currently overridden by %1$s: %2$s', 'kotlinskidev'),
        $source,
        kotlinskidev_seo_identity_override_display($overrides[$key]['value'], $type)
    );
    echo '<p class="notice notice-info inline" style="padding:6px 12px;"><strong>' . esc_html($text) . '</strong> ';
    echo '<a href="' . esc_url(admin_url('admin.php?page=wpseo_page_settings')) . '">' . esc_html__('Open Yoast SEO settings', 'kotlinskidev') . '</a></p>';
}

function kotlinskidev_enqueue_seo_identity_media(string $hook): void
{
    if ('settings_page_kotlinskidev-settings' !== $hook || 'seo' !== kotlinskidev_active_settings_tab()) {
        return;
    }

    wp_enqueue_media();
    wp_add_inline_script('media-editor', <<<'JS'
document.addEventListener("DOMContentLoaded", function () {
    function setImage(targetId, id, url) {
        var input = document.getElementById(targetId);
        var preview = document.getElementById(targetId + "_preview");
        input.value = id;
        preview.textContent = "";
        if (url) {
            var img = document.createElement("img");
            img.src = url;
            img.alt = "";
            preview.appendChild(img);
        }
    }
    document.querySelectorAll(".kotlinskidev-seo-media-button").forEach(function (button) {
        button.addEventListener("click", function () {
            var uploader = wp.media({ title: "Choose Image", button: { text: "Use Image" }, multiple: false });
            uploader.on("select", function () {
                var attachment = uploader.state().get("selection").first().toJSON();
                var thumb = attachment.sizes && attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url;
                setImage(button.dataset.target, attachment.id, thumb);
            });
            uploader.open();
        });
    });
    document.querySelectorAll(".kotlinskidev-seo-media-remove").forEach(function (button) {
        button.addEventListener("click", function () {
            setImage(button.dataset.target, 0, "");
        });
    });
});
JS);
}
add_action('admin_enqueue_scripts', 'kotlinskidev_enqueue_seo_identity_media');
