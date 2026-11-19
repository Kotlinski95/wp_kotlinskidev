<?php
function kotlinskidev_register_contact_settings(): void
{
    register_setting(
        'kotlinskidev_settings_contact',
        'kotlinskidev_contact_address',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_contact',
        'kotlinskidev_contact_phone',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_contact',
        'kotlinskidev_contact_email',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_email',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_contact',
        'kotlinskidev_contact_hours',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]
    );

    add_settings_section(
        'kotlinskidev_section_contact',
        esc_html__('Business Contact Details', 'kotlinskidev'),
        'kotlinskidev_render_contact_section',
        'kotlinskidev-settings-contact'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-contact', 'kotlinskidev_section_contact', [
        'kotlinskidev_contact_address' => [
            'title'    => esc_html__('Address', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_contact_address_field',
        ],
        'kotlinskidev_contact_phone' => [
            'title'    => esc_html__('Phone', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_contact_phone_field',
            'args'     => ['label_for' => 'kotlinskidev_contact_phone'],
        ],
        'kotlinskidev_contact_email' => [
            'title'    => esc_html__('Email', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_contact_email_field',
            'args'     => ['label_for' => 'kotlinskidev_contact_email'],
        ],
        'kotlinskidev_contact_hours' => [
            'title'    => esc_html__('Business hours', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_contact_hours_field',
        ],
    ]);
}

function kotlinskidev_render_contact_section(): void
{
    echo '<p>' . esc_html__('Used on the contact card shown across the site (e.g. city landing pages). Address, phone, and email are shown obfuscated on the frontend and only revealed after a click, via the same protection used by the Protected Content block.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_contact_translations_url(): string
{
    return admin_url('admin.php?page=mlang_strings&group=' . rawurlencode('kotlinskidev'));
}

function kotlinskidev_render_translatable_contact_field(string $name, string $value, string $placeholder): void
{
    $field_id = 'kotlinskidev-field-' . $name;
    ?>
    <input
        type="text"
        id="<?php echo esc_attr($field_id); ?>"
        name="<?php echo esc_attr($name); ?>"
        value="<?php echo esc_attr($value); ?>"
        class="regular-text"
        placeholder="<?php echo esc_attr($placeholder); ?>"
        readonly
    />
    <button
        type="button"
        class="button button-small"
        onclick="document.getElementById('<?php echo esc_js($field_id); ?>').readOnly = false; this.remove();"
    ><?php esc_html_e('Edit source text', 'kotlinskidev'); ?></button>
    <p class="description">
        <?php esc_html_e('This is the source text shown until a per-language translation exists.', 'kotlinskidev'); ?>
        <a href="<?php echo esc_url(kotlinskidev_contact_translations_url()); ?>"><?php esc_html_e('Translate per language →', 'kotlinskidev'); ?></a>
    </p>
    <?php
}

function kotlinskidev_render_contact_address_field(): void
{
    kotlinskidev_render_translatable_contact_field(
        'kotlinskidev_contact_address',
        get_option('kotlinskidev_contact_address', ''),
        '40-143 Katowice, ul. Dekerta'
    );
}

function kotlinskidev_render_contact_phone_field(): void
{
    $value = get_option('kotlinskidev_contact_phone', '');
    ?>
    <input type="text" id="kotlinskidev_contact_phone" name="kotlinskidev_contact_phone" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="+48 608 418 911" />
    <?php
}

function kotlinskidev_render_contact_email_field(): void
{
    $value = get_option('kotlinskidev_contact_email', '');
    ?>
    <input type="email" id="kotlinskidev_contact_email" name="kotlinskidev_contact_email" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="contact@example.com" />
    <?php
}

function kotlinskidev_render_contact_hours_field(): void
{
    kotlinskidev_render_translatable_contact_field(
        'kotlinskidev_contact_hours',
        get_option('kotlinskidev_contact_hours', ''),
        'Mon-Fri 8:00-17:00'
    );
    echo '<p class="description">' . esc_html__('Shown as plain text — not sensitive, so not obfuscated.', 'kotlinskidev') . '</p>';
}
