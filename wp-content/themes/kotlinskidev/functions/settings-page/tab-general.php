<?php
function kotlinskidev_register_general_settings(): void
{
    kotlinskidev_register_boolean_setting('kotlinskidev_settings_general', 'kotlinskidev_disable_comments', true);

    add_settings_section(
        'kotlinskidev_section_spam',
        esc_html__('Comment Spam Protection', 'kotlinskidev'),
        'kotlinskidev_render_spam_section',
        'kotlinskidev-settings-general'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-general', 'kotlinskidev_section_spam', [
        'kotlinskidev_disable_comments' => [
            'title'    => esc_html__('Disable comments', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_disable_comments_field',
        ],
    ]);
}

function kotlinskidev_render_spam_section(): void
{
    echo '<p>' . esc_html__('This site does not use comments. Enabling this protection closes comments at the server level — spam bots that POST directly to wp-comments-post.php or call XML-RPC comment methods are rejected with a 403 before any database write or email notification occurs. WordPress Discussion settings alone do not stop this traffic.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_disable_comments_field(): void
{
    kotlinskidev_render_checkbox_field([
        'option'  => 'kotlinskidev_disable_comments',
        'default' => true,
        'label'   => __('Block all comment submissions site-wide (recommended)', 'kotlinskidev'),
        'description' => __('Hooks into preprocess_comment and xmlrpc_methods. Removes comment UI from the block editor and admin menu.', 'kotlinskidev'),
    ]);
}
