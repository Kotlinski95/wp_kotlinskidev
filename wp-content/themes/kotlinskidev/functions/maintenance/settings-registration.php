<?php
function setup_maintenance_mode_settings()
{
    register_setting('maintenance_mode_options', 'maintenance_mode_enabled');
    register_setting('maintenance_mode_options', 'maintenance_mode_background_image');
    register_setting('maintenance_mode_options', 'maintenance_mode_logo');
    register_setting('maintenance_mode_options', 'maintenance_mode_heading');
    register_setting('maintenance_mode_options', 'maintenance_mode_description');
    register_setting('maintenance_mode_options', 'maintenance_mode_contact_email');
    register_setting('maintenance_mode_options', 'maintenance_mode_contact_button_text');
    register_setting('maintenance_mode_options', 'maintenance_mode_show_language_switcher');

    register_setting('maintenance_mode_options', 'maintenance_mode_facebook_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_linkedin_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_instagram_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_tiktok_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_github_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_whatsapp_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_twitter_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_youtube_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_discord_url');

    if (function_exists('pll_languages_list')) {
        $languages = pll_languages_list();
        foreach ($languages as $lang) {
            register_setting('maintenance_mode_options', 'maintenance_mode_heading_' . $lang);
            register_setting('maintenance_mode_options', 'maintenance_mode_description_' . $lang);
            register_setting('maintenance_mode_options', 'maintenance_mode_contact_button_text_' . $lang);
        }
    }

    add_settings_section(
        'maintenance_mode_main',
        'General Settings',
        null,
        'maintenance-mode'
    );

    add_settings_field(
        'maintenance_mode_enabled',
        'Enable Maintenance Mode',
        'maintenance_mode_enabled_field',
        'maintenance-mode',
        'maintenance_mode_main'
    );

    add_settings_section(
        'maintenance_mode_customization',
        'Customization Options',
        'maintenance_mode_customization_section_callback',
        'maintenance-mode'
    );

    add_settings_field(
        'maintenance_mode_background_image',
        'Background Image',
        'maintenance_mode_background_image_field',
        'maintenance-mode',
        'maintenance_mode_customization',
        ['label_for' => 'maintenance_mode_background_image']
    );

    add_settings_field(
        'maintenance_mode_logo',
        'Logo',
        'maintenance_mode_logo_field',
        'maintenance-mode',
        'maintenance_mode_customization',
        ['label_for' => 'maintenance_mode_logo']
    );

    add_settings_field(
        'maintenance_mode_heading',
        'Main Heading',
        'maintenance_mode_heading_field',
        'maintenance-mode',
        'maintenance_mode_customization'
    );

    add_settings_field(
        'maintenance_mode_description',
        'Description Text',
        'maintenance_mode_description_field',
        'maintenance-mode',
        'maintenance_mode_customization'
    );

    add_settings_field(
        'maintenance_mode_contact_email',
        'Contact Email',
        'maintenance_mode_contact_email_field',
        'maintenance-mode',
        'maintenance_mode_customization'
    );

    add_settings_field(
        'maintenance_mode_contact_button_text',
        'Contact Button Text',
        'maintenance_mode_contact_button_text_field',
        'maintenance-mode',
        'maintenance_mode_customization'
    );

    if (function_exists('pll_languages_list')) {
        add_settings_field(
            'maintenance_mode_show_language_switcher',
            'Language Switcher',
            'maintenance_mode_language_switcher_field',
            'maintenance-mode',
            'maintenance_mode_customization'
        );
    }

    add_settings_section(
        'maintenance_mode_social_media',
        'Social Media Links',
        'maintenance_mode_social_media_section_callback',
        'maintenance-mode'
    );

    add_settings_field(
        'maintenance_mode_social_media_links',
        'Social Media Profiles',
        'maintenance_mode_social_media_field',
        'maintenance-mode',
        'maintenance_mode_social_media'
    );
}
add_action('admin_init', 'setup_maintenance_mode_settings');
