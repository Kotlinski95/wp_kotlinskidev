<?php
add_action('admin_menu', 'kotlinskidev_register_settings_page');

function kotlinskidev_register_settings_page(): void
{
    add_options_page(
        esc_html__('Kotlinski.dev Settings', 'kotlinskidev'),
        esc_html__('Kotlinski.dev', 'kotlinskidev'),
        'manage_options',
        'kotlinskidev-settings',
        'kotlinskidev_render_settings_page'
    );
}

add_action('admin_init', 'kotlinskidev_register_settings');

function kotlinskidev_register_settings(): void
{
    register_setting(
        'kotlinskidev_settings_group',
        'kotlinskidev_disable_comments',
        [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]
    );

    add_settings_section(
        'kotlinskidev_section_spam',
        esc_html__('Comment Spam Protection', 'kotlinskidev'),
        'kotlinskidev_render_spam_section',
        'kotlinskidev-settings'
    );

    add_settings_field(
        'kotlinskidev_disable_comments',
        esc_html__('Disable comments', 'kotlinskidev'),
        'kotlinskidev_render_disable_comments_field',
        'kotlinskidev-settings',
        'kotlinskidev_section_spam'
    );
}

function kotlinskidev_render_spam_section(): void
{
    echo '<p>' . esc_html__('This site does not use comments. Enabling this protection closes comments at the server level — spam bots that POST directly to wp-comments-post.php or call XML-RPC comment methods are rejected with a 403 before any database write or email notification occurs. WordPress Discussion settings alone do not stop this traffic.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_disable_comments_field(): void
{
    $enabled = (bool) get_option('kotlinskidev_disable_comments', true);
    ?>
    <label>
        <input
            type="checkbox"
            name="kotlinskidev_disable_comments"
            value="1"
            <?php checked($enabled); ?>
        />
        <?php esc_html_e('Block all comment submissions site-wide (recommended)', 'kotlinskidev'); ?>
    </label>
    <p class="description">
        <?php esc_html_e('Hooks into preprocess_comment and xmlrpc_methods. Removes comment UI from the block editor and admin menu.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_settings_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('kotlinskidev_settings_group');
            do_settings_sections('kotlinskidev-settings');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}
