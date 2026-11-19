<?php
function kotlinskidev_register_login_settings(): void
{
    kotlinskidev_register_boolean_setting('kotlinskidev_settings_login', 'kotlinskidev_login_enable_custom', true);

    register_setting(
        'kotlinskidev_settings_login',
        'kotlinskidev_login_bg_image',
        [
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_login',
        'kotlinskidev_login_logo_image',
        [
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_login',
        'kotlinskidev_login_bg_color',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_hex_color',
            'default'           => '#191919',
        ]
    );

    register_setting(
        'kotlinskidev_settings_login',
        'kotlinskidev_login_accent_color',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_hex_color',
            'default'           => '#8209d3',
        ]
    );

    add_settings_section(
        'kotlinskidev_section_login',
        esc_html__('Login Page Branding', 'kotlinskidev'),
        'kotlinskidev_render_login_section',
        'kotlinskidev-settings-login'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-login', 'kotlinskidev_section_login', [
        'kotlinskidev_login_enable_custom' => [
            'title'    => esc_html__('Enable custom login', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_login_enable_field',
        ],
        'kotlinskidev_login_bg_image' => [
            'title'    => esc_html__('Background image', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_login_bg_image_field',
            'args'     => ['label_for' => 'kotlinskidev_login_bg_image'],
        ],
        'kotlinskidev_login_logo_image' => [
            'title'    => esc_html__('Logo image', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_login_logo_image_field',
            'args'     => ['label_for' => 'kotlinskidev_login_logo_image'],
        ],
        'kotlinskidev_login_bg_color' => [
            'title'    => esc_html__('Background color', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_login_bg_color_field',
            'args'     => ['label_for' => 'kotlinskidev_login_bg_color'],
        ],
        'kotlinskidev_login_accent_color' => [
            'title'    => esc_html__('Accent color', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_login_accent_color_field',
            'args'     => ['label_for' => 'kotlinskidev_login_accent_color'],
        ],
    ]);
}

function kotlinskidev_login_default_bg_image(): string
{
    return get_template_directory_uri() . '/assets/images/kotlinskidev-background.webp';
}

function kotlinskidev_login_default_logo_image(): string
{
    return get_template_directory_uri() . '/assets/images/kotlinskidev-logo.webp';
}

function kotlinskidev_render_login_section(): void
{
    echo '<p>' . esc_html__('Customize the wp-login.php background, logo, and accent color.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_login_enable_field(): void
{
    kotlinskidev_render_checkbox_field([
        'option'  => 'kotlinskidev_login_enable_custom',
        'default' => true,
        'label'   => __('Enable custom login page styling', 'kotlinskidev'),
    ]);
}

function kotlinskidev_render_login_bg_image_field(): void
{
    $value = get_option('kotlinskidev_login_bg_image', '');
    ?>
    <input type="url" id="kotlinskidev_login_bg_image" name="kotlinskidev_login_bg_image" value="<?php echo esc_attr($value); ?>" class="regular-text kotlinskidev-login-media-field" />
    <button type="button" class="button kotlinskidev-login-media-button" data-target="kotlinskidev_login_bg_image"><?php esc_html_e('Choose Image', 'kotlinskidev'); ?></button>
    <p class="description">
        <?php esc_html_e('Defaults to the theme background image when left empty.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_login_logo_image_field(): void
{
    $value = get_option('kotlinskidev_login_logo_image', '');
    ?>
    <input type="url" id="kotlinskidev_login_logo_image" name="kotlinskidev_login_logo_image" value="<?php echo esc_attr($value); ?>" class="regular-text kotlinskidev-login-media-field" />
    <button type="button" class="button kotlinskidev-login-media-button" data-target="kotlinskidev_login_logo_image"><?php esc_html_e('Choose Image', 'kotlinskidev'); ?></button>
    <p class="description">
        <?php esc_html_e('Defaults to the theme logo when left empty.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_login_bg_color_field(): void
{
    $value = get_option('kotlinskidev_login_bg_color', '#191919');
    ?>
    <input type="color" id="kotlinskidev_login_bg_color" name="kotlinskidev_login_bg_color" value="<?php echo esc_attr($value); ?>" />
    <p class="description"><?php esc_html_e('Fallback background color when no image loads.', 'kotlinskidev'); ?></p>
    <?php
}

function kotlinskidev_render_login_accent_color_field(): void
{
    $value = get_option('kotlinskidev_login_accent_color', '#8209d3');
    ?>
    <input type="color" id="kotlinskidev_login_accent_color" name="kotlinskidev_login_accent_color" value="<?php echo esc_attr($value); ?>" />
    <p class="description"><?php esc_html_e('Color for links and hover effects.', 'kotlinskidev'); ?></p>
    <?php
}

function kotlinskidev_enqueue_login_settings_media(string $hook): void
{
    if ('settings_page_kotlinskidev-settings' !== $hook || 'login' !== kotlinskidev_active_settings_tab()) {
        return;
    }

    wp_enqueue_media();
    wp_add_inline_script('media-editor', '
        document.addEventListener("DOMContentLoaded", function () {
            document.querySelectorAll(".kotlinskidev-login-media-button").forEach(function (button) {
                button.addEventListener("click", function () {
                    var targetInput = document.getElementsByName(button.dataset.target)[0];
                    var uploader = wp.media({
                        title: "Choose Image",
                        button: { text: "Use Image" },
                        multiple: false,
                    });
                    uploader.on("select", function () {
                        var attachment = uploader.state().get("selection").first().toJSON();
                        targetInput.value = attachment.url;
                    });
                    uploader.open();
                });
            });
        });
    ');
}
add_action('admin_enqueue_scripts', 'kotlinskidev_enqueue_login_settings_media');
