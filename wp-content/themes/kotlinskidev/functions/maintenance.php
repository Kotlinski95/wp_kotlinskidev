<?php
function add_maintenance_mode_settings()
{
    add_options_page(
        'Maintenance Mode Settings',
        'Maintenance Mode',
        'manage_options',
        'maintenance-mode',
        'maintenance_mode_settings_page'
    );
}
add_action('admin_menu', 'add_maintenance_mode_settings');

// Enqueue media library scripts for the maintenance settings page
function maintenance_mode_admin_scripts($hook)
{
    // Only load on our maintenance settings page
    if ('settings_page_maintenance-mode' !== $hook) {
        return;
    }

    // Enqueue WordPress media library
    wp_enqueue_media();
}
add_action('admin_enqueue_scripts', 'maintenance_mode_admin_scripts');

// Display the settings page
function maintenance_mode_settings_page()
{
?>
    <div class="wrap">
        <h1><?php _e('Maintenance Mode Settings', 'your-theme'); ?></h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('maintenance_mode_options');
            do_settings_sections('maintenance-mode');
            submit_button(); ?>
        </form>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Media Library functionality for background image
            const backgroundUploadButton = document.getElementById('maintenance_background_upload_button');
            if (backgroundUploadButton) {
                backgroundUploadButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    const mediaUploader = wp.media({
                        title: 'Choose Background Image',
                        button: {
                            text: 'Use This Image'
                        },
                        multiple: false,
                        library: {
                            type: 'image'
                        }
                    });

                    mediaUploader.on('select', function() {
                        const attachment = mediaUploader.state().get('selection').first().toJSON();
                        const backgroundInput = document.getElementById('maintenance_mode_background_image');
                        const backgroundPreview = document.getElementById('maintenance_background_preview');

                        if (backgroundInput) {
                            backgroundInput.value = attachment.url;
                        }
                        if (backgroundPreview) {
                            backgroundPreview.innerHTML = '<img src="' + attachment.url + '" style="max-width: 200px; height: auto; border: 1px solid #ddd; padding: 5px;">';
                        }
                    });

                    mediaUploader.open();
                });
            }

            // Media Library functionality for logo
            const logoUploadButton = document.getElementById('maintenance_logo_upload_button');
            if (logoUploadButton) {
                logoUploadButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    const mediaUploader = wp.media({
                        title: 'Choose Logo',
                        button: {
                            text: 'Use This Image'
                        },
                        multiple: false,
                        library: {
                            type: 'image'
                        }
                    });

                    mediaUploader.on('select', function() {
                        const attachment = mediaUploader.state().get('selection').first().toJSON();
                        const logoInput = document.getElementById('maintenance_mode_logo');
                        const logoPreview = document.getElementById('maintenance_logo_preview');

                        if (logoInput) {
                            logoInput.value = attachment.url;
                        }
                        if (logoPreview) {
                            logoPreview.innerHTML = '<img src="' + attachment.url + '" style="max-width: 150px; height: auto; border: 1px solid #ddd; padding: 5px;">';
                        }
                    });

                    mediaUploader.open();
                });
            }

            // Clear image buttons
            const backgroundClearButton = document.getElementById('maintenance_background_clear_button');
            if (backgroundClearButton) {
                backgroundClearButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    const backgroundInput = document.getElementById('maintenance_mode_background_image');
                    const backgroundPreview = document.getElementById('maintenance_background_preview');

                    if (backgroundInput) {
                        backgroundInput.value = '';
                    }
                    if (backgroundPreview) {
                        backgroundPreview.innerHTML = '';
                    }
                });
            }

            const logoClearButton = document.getElementById('maintenance_logo_clear_button');
            if (logoClearButton) {
                logoClearButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    const logoInput = document.getElementById('maintenance_mode_logo');
                    const logoPreview = document.getElementById('maintenance_logo_preview');

                    if (logoInput) {
                        logoInput.value = '';
                    }
                    if (logoPreview) {
                        logoPreview.innerHTML = '';
                    }
                });
            }
        });
    </script>
<?php
}

// Register and define the settings
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

    // Register social media settings
    register_setting('maintenance_mode_options', 'maintenance_mode_facebook_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_linkedin_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_instagram_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_tiktok_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_github_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_whatsapp_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_twitter_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_youtube_url');
    register_setting('maintenance_mode_options', 'maintenance_mode_discord_url');

    // Register translation fields if Polylang is active
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
        'maintenance_mode_customization'
    );

    add_settings_field(
        'maintenance_mode_logo',
        'Logo',
        'maintenance_mode_logo_field',
        'maintenance-mode',
        'maintenance_mode_customization'
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

    // Add language switcher field if Polylang is active
    if (function_exists('pll_languages_list')) {
        add_settings_field(
            'maintenance_mode_show_language_switcher',
            'Language Switcher',
            'maintenance_mode_language_switcher_field',
            'maintenance-mode',
            'maintenance_mode_customization'
        );
    }

    // Add social media section
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

// Create the settings field
function maintenance_mode_enabled_field()
{
    $checked = get_option('maintenance_mode_enabled', false) ? 'checked' : '';
    echo '<input type="checkbox" name="maintenance_mode_enabled" value="1" ' .
        $checked .
        '> Enable Maintenance Mode';
}

// Customization section callback
function maintenance_mode_customization_section_callback()
{
    echo '<p>Customize the appearance and content of your maintenance page.</p>';
}

// Background image field
function maintenance_mode_background_image_field()
{
    $image_url = get_option('maintenance_mode_background_image', 'https://kotlinskidev.wordifysites.com/wp-content/uploads/2024/09/kotlinskidev-coming-soon-compressed.webp');
?>
    <div style="margin-bottom: 10px;">
        <input type="url" id="maintenance_mode_background_image" name="maintenance_mode_background_image" value="<?php echo esc_attr($image_url); ?>" style="width: 100%; max-width: 400px;" placeholder="Enter background image URL or use media library">
    </div>
    <div style="margin-bottom: 10px;">
        <button type="button" id="maintenance_background_upload_button" class="button">📁 Choose from Media Library</button>
        <button type="button" id="maintenance_background_clear_button" class="button">🗑️ Clear Image</button>
    </div>
    <div id="maintenance_background_preview" style="margin-top: 10px;">
        <?php if ($image_url): ?>
            <img src="<?php echo esc_url($image_url); ?>" style="max-width: 200px; height: auto; border: 1px solid #ddd; padding: 5px;">
        <?php endif; ?>
    </div>
    <p class="description">Upload a background image using the media library or enter a URL directly.</p>
<?php
}

// Logo field
function maintenance_mode_logo_field()
{
    $logo_url = get_option('maintenance_mode_logo', 'https://kotlinskidev.wordifysites.com/wp-content/uploads/2024/09/Kotlinskidev-transparent.webp');
?>
    <div style="margin-bottom: 10px;">
        <input type="url" id="maintenance_mode_logo" name="maintenance_mode_logo" value="<?php echo esc_attr($logo_url); ?>" style="width: 100%; max-width: 400px;" placeholder="Enter logo URL or use media library">
    </div>
    <div style="margin-bottom: 10px;">
        <button type="button" id="maintenance_logo_upload_button" class="button">📁 Choose from Media Library</button>
        <button type="button" id="maintenance_logo_clear_button" class="button">🗑️ Clear Image</button>
    </div>
    <div id="maintenance_logo_preview" style="margin-top: 10px;">
        <?php if ($logo_url): ?>
            <img src="<?php echo esc_url($logo_url); ?>" style="max-width: 150px; height: auto; border: 1px solid #ddd; padding: 5px;">
        <?php endif; ?>
    </div>
    <p class="description">Upload a logo using the media library or enter a URL directly.</p>
<?php
}

// Heading field
function maintenance_mode_heading_field()
{
    $heading = get_option('maintenance_mode_heading', 'Website under development!');

    // Check if Polylang is active
    if (function_exists('pll_languages_list')) {
        $languages = pll_languages_list();
        echo '<div style="margin-bottom: 15px;">';
        echo '<strong>Heading Translations:</strong><br>';
        echo '<small>Enter the heading text for each language. If left empty, the default will be used.</small>';
        echo '</div>';

        foreach ($languages as $lang) {
            $lang_name = strtoupper($lang);
            $heading_key = 'maintenance_mode_heading_' . $lang;
            $heading_value = get_option($heading_key, '');

            echo '<div style="margin-bottom: 10px;">';
            echo '<label style="display: inline-block; width: 60px; font-weight: bold;">' . esc_html($lang_name) . ':</label>';
            echo '<input type="text" name="' . esc_attr($heading_key) . '" value="' . esc_attr($heading_value) . '" style="width: calc(100% - 70px); max-width: 430px;" placeholder="Enter heading for ' . esc_attr($lang_name) . '">';
            echo '</div>';
        }

        echo '<div style="margin-top: 15px;">';
        echo '<strong>Default Heading (fallback):</strong><br>';
        echo '<input type="text" name="maintenance_mode_heading" value="' . esc_attr($heading) . '" style="width: 100%; max-width: 500px;" placeholder="Enter default heading">';
        echo '<br><small>This will be used if no translation is available for a language.</small>';
        echo '</div>';
    } else {
        echo '<input type="text" name="maintenance_mode_heading" value="' . esc_attr($heading) . '" style="width: 100%; max-width: 500px;" placeholder="Enter main heading">';
        echo '<br><small>The main heading text displayed on the maintenance page.</small>';
    }
}

// Description field
function maintenance_mode_description_field()
{
    $description = get_option('maintenance_mode_description', 'Work is underway to complete this site. Those interested in contacting me are invited to use social media.');

    // Check if Polylang is active
    if (function_exists('pll_languages_list')) {
        $languages = pll_languages_list();
        echo '<div style="margin-bottom: 15px;">';
        echo '<strong>Description Translations:</strong><br>';
        echo '<small>Enter the description text for each language. If left empty, the default will be used.</small>';
        echo '</div>';

        foreach ($languages as $lang) {
            $lang_name = strtoupper($lang);
            $description_key = 'maintenance_mode_description_' . $lang;
            $description_value = get_option($description_key, '');

            echo '<div style="margin-bottom: 10px;">';
            echo '<label style="display: inline-block; width: 60px; font-weight: bold; vertical-align: top; margin-top: 5px;">' . esc_html($lang_name) . ':</label>';
            echo '<textarea name="' . esc_attr($description_key) . '" rows="3" style="width: calc(100% - 70px); max-width: 430px;" placeholder="Enter description for ' . esc_attr($lang_name) . '">' . esc_textarea($description_value) . '</textarea>';
            echo '</div>';
        }

        echo '<div style="margin-top: 15px;">';
        echo '<strong>Default Description (fallback):</strong><br>';
        echo '<textarea name="maintenance_mode_description" rows="4" style="width: 100%; max-width: 500px;" placeholder="Enter default description">' . esc_textarea($description) . '</textarea>';
        echo '<br><small>This will be used if no translation is available for a language.</small>';
        echo '</div>';
    } else {
        echo '<textarea name="maintenance_mode_description" rows="4" style="width: 100%; max-width: 500px;" placeholder="Enter description text">' . esc_textarea($description) . '</textarea>';
        echo '<br><small>The description text displayed below the heading.</small>';
    }
}

// Contact email field
function maintenance_mode_contact_email_field()
{
    $email = get_option('maintenance_mode_contact_email', 'kotlinskidev@gmail.com');
    echo '<input type="email" name="maintenance_mode_contact_email" value="' . esc_attr($email) . '" style="width: 100%; max-width: 500px;" placeholder="Enter contact email">';
    echo '<br><small>The email address for the contact button.</small>';
}

// Contact button text field
function maintenance_mode_contact_button_text_field()
{
    $button_text = get_option('maintenance_mode_contact_button_text', 'Contact');

    // Check if Polylang is active
    if (function_exists('pll_languages_list')) {
        $languages = pll_languages_list();
        echo '<div style="margin-bottom: 15px;">';
        echo '<strong>Button Text Translations:</strong><br>';
        echo '<small>Enter the contact button text for each language. If left empty, the default will be used.</small>';
        echo '</div>';

        foreach ($languages as $lang) {
            $lang_name = strtoupper($lang);
            $button_text_key = 'maintenance_mode_contact_button_text_' . $lang;
            $button_text_value = get_option($button_text_key, '');

            echo '<div style="margin-bottom: 10px;">';
            echo '<label style="display: inline-block; width: 60px; font-weight: bold;">' . esc_html($lang_name) . ':</label>';
            echo '<input type="text" name="' . esc_attr($button_text_key) . '" value="' . esc_attr($button_text_value) . '" style="width: calc(100% - 70px); max-width: 430px;" placeholder="Enter button text for ' . esc_attr($lang_name) . '">';
            echo '</div>';
        }

        echo '<div style="margin-top: 15px;">';
        echo '<strong>Default Button Text (fallback):</strong><br>';
        echo '<input type="text" name="maintenance_mode_contact_button_text" value="' . esc_attr($button_text) . '" style="width: 100%; max-width: 500px;" placeholder="Enter default button text">';
        echo '<br><small>This will be used if no translation is available for a language.</small>';
        echo '</div>';
    } else {
        echo '<input type="text" name="maintenance_mode_contact_button_text" value="' . esc_attr($button_text) . '" style="width: 100%; max-width: 500px;" placeholder="Enter button text">';
        echo '<br><small>The text displayed on the contact button.</small>';
    }
}

// Language switcher field
function maintenance_mode_language_switcher_field()
{
    $show_switcher = get_option('maintenance_mode_show_language_switcher', true);
    $checked = $show_switcher ? 'checked' : '';

    echo '<input type="checkbox" name="maintenance_mode_show_language_switcher" value="1" ' . $checked . '> Show language switcher with flags';
    echo '<br><small>Display a language dropdown with flags on the maintenance page for visitors to switch languages.</small>';
}

// Social media section callback
function maintenance_mode_social_media_section_callback()
{
    echo '<p>Add links to your social media profiles. Leave empty to hide that social media icon.</p>';
}

// Social media field
function maintenance_mode_social_media_field()
{
    $social_media_platforms = [
        'facebook' => ['name' => 'Facebook', 'icon' => '📘'],
        'linkedin' => ['name' => 'LinkedIn', 'icon' => '💼'],
        'instagram' => ['name' => 'Instagram', 'icon' => '📸'],
        'tiktok' => ['name' => 'TikTok', 'icon' => '🎵'],
        'github' => ['name' => 'GitHub', 'icon' => '🐙'],
        'whatsapp' => ['name' => 'WhatsApp', 'icon' => '💬'],
        'twitter' => ['name' => 'Twitter/X', 'icon' => '🐦'],
        'youtube' => ['name' => 'YouTube', 'icon' => '📺'],
        'discord' => ['name' => 'Discord', 'icon' => '🎮'],
    ];

    echo '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-bottom: 20px;">';

    foreach ($social_media_platforms as $platform => $details) {
        $option_name = 'maintenance_mode_' . $platform . '_url';
        $value = get_option($option_name, '');

        echo '<div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">';
        echo '<label style="display: block; font-weight: bold; margin-bottom: 8px;">';
        echo '<span style="margin-right: 8px;">' . $details['icon'] . '</span>';
        echo esc_html($details['name']);
        echo '</label>';
        echo '<input type="url" name="' . esc_attr($option_name) . '" value="' . esc_attr($value) . '" style="width: 100%;" placeholder="Enter ' . esc_attr($details['name']) . ' URL">';
        echo '</div>';
    }

    echo '</div>';
    echo '<p class="description">Enter the full URL for each social media profile you want to display. Icons will only appear for platforms with URLs provided.</p>';
}

function maintenance_redirect()
{
    // Check if maintenance mode is enabled
    $maintenance_mode_enabled = get_option('maintenance_mode_enabled', false);

    // Check if the user is on the WordPress login page
    if ($maintenance_mode_enabled && !is_admin() && $GLOBALS['pagenow'] === 'wp-login.php') {
        return; // Don't redirect if on login page
    }

    // If maintenance mode is enabled and user is not logged in or does not have the correct capability
    if (
        $maintenance_mode_enabled &&
        !current_user_can('edit_themes') &&
        !is_user_logged_in()
    ) {
        // Generate dynamic maintenance page
        generate_maintenance_page();
        exit();
    }
}
add_action('init', 'maintenance_redirect');

// Generate dynamic maintenance page
function generate_maintenance_page()
{
    // Get customizable options with fallback defaults, using translations
    $background_image = get_option('maintenance_mode_background_image', 'https://kotlinskidev.wordifysites.com/wp-content/uploads/2024/09/kotlinskidev-coming-soon-compressed.webp');
    $logo = get_option('maintenance_mode_logo', 'https://kotlinskidev.wordifysites.com/wp-content/uploads/2024/09/Kotlinskidev-transparent.webp');
    $heading = get_maintenance_translation('maintenance_mode_heading', 'Website under development!');
    $description = get_maintenance_translation('maintenance_mode_description', 'Work is underway to complete this site. Those interested in contacting me are invited to use social media.');
    $contact_email = get_option('maintenance_mode_contact_email', 'kotlinskidev@gmail.com');
    $contact_button_text = get_maintenance_translation('maintenance_mode_contact_button_text', 'Contact');

    // Get current language for HTML lang attribute
    $current_lang = get_maintenance_current_language();
    $html_lang = $current_lang ? $current_lang : 'en';

    // Set proper headers
    http_response_code(503);
    header('Content-Type: text/html; charset=UTF-8');
    header('Retry-After: 3600');

    // Generate the maintenance page HTML
?>
    <!DOCTYPE html>
    <html class="sp-html sp-seedprod sp-h-full" dir="ltr" lang="<?php echo esc_attr($html_lang); ?>" prefix="og: https://ogp.me/ns#">

    <head>
        <title><?php echo esc_html(get_bloginfo('name')); ?> - Maintenance Mode</title>
        <meta charset="UTF-8" />
        <meta name="description" content="<?php echo esc_attr($description); ?>" />
        <link href="<?php echo esc_url($logo); ?>" rel="shortcut icon" type="image/x-icon" />

        <!-- Open Graph -->
        <meta property="og:url" content="<?php echo esc_url(home_url('/')); ?>" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="<?php echo esc_attr(get_bloginfo('name')); ?> - Maintenance Mode" />
        <meta property="og:description" content="<?php echo esc_attr($description); ?>" />
        <meta property="og:image" content="<?php echo esc_url($logo); ?>" />

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="<?php echo esc_attr(get_bloginfo('name')); ?> - Maintenance Mode" />
        <meta name="twitter:description" content="<?php echo esc_attr($description); ?>" />
        <meta property="twitter:image" content="<?php echo esc_url($logo); ?>" />

        <meta name="viewport" content="height=device-height, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=3.0, user-scalable=no, viewport-fit=cover, target-densitydpi=device-dpi" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Hind:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        <style>
            #sp-page {
                color: #ebebeb;
            }

            #sp-page .sp-header-tag-h1,
            #sp-page .sp-header-tag-h2,
            #sp-page .sp-header-tag-h3,
            #sp-page .sp-header-tag-h4,
            #sp-page .sp-header-tag-h5,
            #sp-page .sp-header-tag-h6 {
                color: #dad1b3;
            }

            #sp-page h1,
            #sp-page h2,
            #sp-page h3,
            #sp-page h4,
            #sp-page h5,
            #sp-page h6 {
                color: #ebebeb;
                font-family: 'Hind', Times, serif;
                font-weight: 700;
                font-style: normal;
            }

            #sp-page a {
                color: #dad1b3;
            }

            #sp-page a:hover {
                color: #c9bc91;
            }

            #sp-page .btn {
                background-color: #dad1b3;
            }

            .sp-image-block {
                margin-top: 70px;
            }

            @media only screen and (max-width: 480px) {

                .sp-headline-block-y0sc75,
                #sp-y0sc75,
                #y0sc75 {
                    font-size: 32px !important;
                    text-align: center !important;
                }

                .sp-text-wrapper-p7ef8k,
                #sp-p7ef8k,
                #p7ef8k {
                    text-align: center !important;
                }

                #sp-d4et4f {
                    height: 10px !important;
                }

                #sp-button-parent-q09cvl {
                    text-align: center !important;
                }

                .sp-image-block {
                    margin-top: 0px;
                }

                .sp-el-section,
                .sp-el-row {
                    padding-top: 0px !important;
                    padding-bottom: 0px !important;
                }
            }

            @media only screen and (min-width: 481px) and (max-width: 1024px) {
                .sp-image-block {
                    margin-top: -60px;
                }
            }

            body {
                overflow: hidden;
                font-size: 16px;
                min-height: 100svh;
                background: rgb(10, 10, 10);
            }

            .sp-html {
                background: rgb(10, 10, 10);
            }

            @supports not (min-height: 100svh) {
                body {
                    min-height: 100vh;
                }
            }

            #sp-page {
                max-height: 100svh;
                overflow: auto;
            }

            .social-grid {
                display: flex;
            }

            .sp-el-col:empty {
                display: none;
            }

            .social-icon {
                color: #fff !important;
            }

            .social-icon:hover {
                color: white !important;
            }

            .social-icon i {
                margin: 0;
            }

            .sp-button-wrapper {
                padding: 0;
            }

            .mail-button:hover {
                background: #ebebeb !important;
                color: #0a0a0a !important;
            }

            .sp-image-wrapper img {
                max-width: 140px !important;
            }

            .wp-login {
                opacity: 0 !important;
            }

            /* Language Switcher Styles */
            .maintenance-language-switcher {
                position: fixed;
                top: 20px;
                left: 20px;
                z-index: 1000;
            }

            .language-dropdown {
                position: relative;
                display: inline-block;
            }

            .language-current {
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(0, 0, 0, 0.7);
                color: #ebebeb;
                border: 1px solid #dad1b3;
                border-radius: 6px;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 14px;
                font-family: 'Hind', sans-serif;
                transition: all 0.3s ease;
            }

            .language-current:hover {
                background: rgba(0, 0, 0, 0.9);
                border-color: #c9bc91;
            }

            .flag-icon {
                width: 16px;
                height: 12px;
                object-fit: cover;
                border-radius: 2px;
            }

            .dropdown-arrow {
                font-size: 10px;
                transition: transform 0.3s ease;
            }

            .language-dropdown.active .dropdown-arrow {
                transform: rotate(180deg);
            }

            .language-options {
                position: absolute;
                top: 100%;
                left: 0;
                min-width: 100%;
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid #dad1b3;
                border-radius: 6px;
                margin-top: 4px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
            }

            .language-dropdown.active .language-options {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .language-option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                color: #ebebeb;
                text-decoration: none;
                font-size: 14px;
                font-family: 'Hind', sans-serif;
                transition: background-color 0.3s ease;
            }

            .language-option:hover {
                background: rgba(218, 209, 179, 0.1);
                color: #dad1b3;
            }

            @media only screen and (max-width: 480px) {
                .maintenance-language-switcher {
                    top: 10px;
                    left: 10px;
                }

                .language-current {
                    padding: 6px 10px;
                    font-size: 12px;
                }

                .language-option {
                    padding: 6px 10px;
                    font-size: 12px;
                }
            }

            /* Social Media Styles */
            .social-media-links {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 16px;
                margin-top: 40px;
                flex-wrap: wrap;
            }

            .social-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                color: #dad1b3;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid #dad1b3;
                border-radius: 50%;
                text-decoration: none;
                transition: all 0.3s ease;
            }

            .social-icon:hover {
                color: #ebebeb;
                background: rgba(218, 209, 179, 0.2);
                border-color: #ebebeb;
                transform: translateY(-2px);
            }

            .social-icon svg {
                width: 20px;
                height: 20px;
            }

            @media only screen and (max-width: 480px) {
                .social-media-links {
                    gap: 12px;
                    margin-top: 30px;
                }

                .social-icon {
                    width: 36px;
                    height: 36px;
                }

                .social-icon svg {
                    width: 18px;
                    height: 18px;
                }
            }
        </style>
    </head>

    <body class="spBgcoverscroll sp-h-full sp-antialiased sp-bg-slideshow">
        <?php echo get_maintenance_language_switcher(); ?>

        <div id="sp-page" class="spBgcoverscroll sp-content-4" style="background-color: 191919; background-image: url('<?php echo esc_url($background_image); ?>') !important; font-family: 'Hind', Times, serif; font-weight: 400;">
            <section id="sp-ks8a8s" class="sp-el-section" style="width: 100%; max-width: 100%; border-radius: 10px;">
                <div id="sp-vw3kvy" class="sp-el-row sm:sp-flex sp-w-full sp-m-auto sp-justify-between" style="padding: 0px; width: auto; max-width: 1000px; margin-inline: auto;">
                    <div id="sp-ovbx1s" class="sp-el-col sp-w-full" style="width: calc(100% - 0px); height: 100vh; display: flex; flex-direction: column; justify-content:center; overflow: hidden;">
                        <figure id="sp-xp7nhn" class="sp-image-wrapper sp-el-block" style="margin: 0px; text-align: center;">
                            <div>
                                <span>
                                    <img src="<?php echo esc_url($logo); ?>" alt="<?php echo esc_attr(get_bloginfo('name')); ?> Logo" width="500" height="500" class="sp-image-block" style="width: 500px; max-width: 100%; height: auto;" />
                                </span>
                            </div>
                        </figure>
                        <div class="sp-footer">
                            <div id="sp-jknss8" class="sp-spacer" style="height: 39px;"></div>
                            <h1 id="sp-y0sc75" class="sp-css-target sp-el-block sp-headline-block-y0sc75 sp-type-header" style="font-size: 54px; text-align: center; margin: 0px;">
                                <?php echo esc_html($heading); ?>
                            </h1>
                            <div id="sp-p7ef8k" class="sp-css-target sp-text-wrapper sp-el-block sp-text-wrapper-p7ef8k" style="font-size: 22px; margin: 0px; text-align: center;">
                                <section class="section section-body">
                                    <p><?php echo esc_html($description); ?></p>
                                </section>
                            </div>
                            <div id="sp-d4et4f" class="sp-spacer" style="height: 10px;"></div>
                            <div id="sp-button-parent-q09cvl" class="sp-button-wrapper sp-el-block" style="margin: 0px; text-align: center;">
                                <a href="mailto:<?php echo esc_attr($contact_email); ?>" id="sp-q09cvl" target="" rel="noopener" class="sp-button sp-css-target sp-text-center sp-inline-block sp-leading-none sp-button-q09cvl mail-button" style="font-size: 18px; font-weight: 400; font-style: normal; background: transparent; color: #ebebeb; width: auto; padding: 12px 16px; border-radius: 4px; border: 3px solid #ebebeb; box-shadow: rgba(255, 255, 255, 0.2) 0px 1px 0px inset;">
                                    <span style="font-family: Hind;"><?php echo esc_html($contact_button_text); ?></span>
                                </a>
                            </div>
                            <?php echo get_maintenance_social_media_links(); ?>
                            <div id="sp-qkrns1" class="sp-spacer" style="height: 12px;"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <div class="wp-login">
            <a href="<?php echo esc_url(wp_login_url()); ?>" target="_self" class="wp-login-button" style="position:fixed; top: 10px; right: 10px; opacity: 0.3; color: #fff; text-decoration: none; background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 3px; font-size: 12px;">Log-in</a>
        </div>

        <script>
            function toggleLanguageDropdown() {
                const dropdown = document.querySelector('.language-dropdown');
                dropdown.classList.toggle('active');
            }

            // Close dropdown when clicking outside
            document.addEventListener('click', function(event) {
                const dropdown = document.querySelector('.language-dropdown');
                if (!dropdown.contains(event.target)) {
                    dropdown.classList.remove('active');
                }
            });

            // Close dropdown when pressing Escape
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    document.querySelector('.language-dropdown').classList.remove('active');
                }
            });
        </script>
    </body>

    </html>
<?php
}

// Function to get the current language for maintenance page
function get_maintenance_current_language()
{
    if (!function_exists('pll_languages_list')) {
        return null;
    }

    $languages = pll_languages_list();

    // First, check for URL parameter (for language switcher)
    if (isset($_GET['lang']) && in_array($_GET['lang'], $languages)) {
        return $_GET['lang'];
    }

    // Try to get language from Polylang
    if (function_exists('pll_current_language')) {
        $current_lang = pll_current_language();
        if ($current_lang) {
            return $current_lang;
        }
    }

    // If no language detected, try to get from browser
    $browser_lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '', 0, 2);

    // Check if browser language is available
    if (in_array($browser_lang, $languages)) {
        return $browser_lang;
    }

    // Default to first language
    return $languages[0] ?? null;
}

// Function to get translated text for maintenance page
function get_maintenance_translation($option_key, $default_value = '')
{
    $current_lang = get_maintenance_current_language();

    if ($current_lang) {
        $translated_value = get_option($option_key . '_' . $current_lang, '');
        if (!empty($translated_value)) {
            return $translated_value;
        }
    }

    // Fallback to default
    $default = get_option($option_key, $default_value);
    return !empty($default) ? $default : $default_value;
}

// Generate language switcher HTML for maintenance page
function get_maintenance_language_switcher()
{
    if (!function_exists('pll_languages_list') || !get_option('maintenance_mode_show_language_switcher', true)) {
        return '';
    }

    $languages = pll_languages_list();
    $current_lang = get_maintenance_current_language();

    if (count($languages) <= 1) {
        return '';
    }

    $switcher_html = '<div class="maintenance-language-switcher">';
    $switcher_html .= '<div class="language-dropdown">';

    // Current language button
    $current_lang_name = $current_lang ? strtoupper($current_lang) : 'EN';
    $current_flag = $current_lang ? get_maintenance_flag_url($current_lang) : '';

    $switcher_html .= '<button class="language-current" onclick="toggleLanguageDropdown()">';
    if ($current_flag) {
        $switcher_html .= '<img src="' . esc_url($current_flag) . '" alt="' . esc_attr($current_lang_name) . '" class="flag-icon">';
    }
    $switcher_html .= '<span>' . esc_html($current_lang_name) . '</span>';
    $switcher_html .= '<span class="dropdown-arrow">▼</span>';
    $switcher_html .= '</button>';

    // Dropdown options
    $switcher_html .= '<div class="language-options" id="languageOptions">';
    foreach ($languages as $lang) {
        if ($lang === $current_lang) continue;

        $lang_name = strtoupper($lang);
        $flag_url = get_maintenance_flag_url($lang);
        $lang_url = get_maintenance_language_url($lang);

        $switcher_html .= '<a href="' . esc_url($lang_url) . '" class="language-option">';
        if ($flag_url) {
            $switcher_html .= '<img src="' . esc_url($flag_url) . '" alt="' . esc_attr($lang_name) . '" class="flag-icon">';
        }
        $switcher_html .= '<span>' . esc_html($lang_name) . '</span>';
        $switcher_html .= '</a>';
    }
    $switcher_html .= '</div>';
    $switcher_html .= '</div>';
    $switcher_html .= '</div>';

    return $switcher_html;
}

// Get flag URL for a language
function get_maintenance_flag_url($lang)
{
    // Common flag URLs - you can customize these based on your setup
    $flags = [
        'en' => 'https://flagcdn.com/w20/us.png',
        'pl' => 'https://flagcdn.com/w20/pl.png',
        'de' => 'https://flagcdn.com/w20/de.png',
        'fr' => 'https://flagcdn.com/w20/fr.png',
        'es' => 'https://flagcdn.com/w20/es.png',
        'it' => 'https://flagcdn.com/w20/it.png',
    ];

    return $flags[$lang] ?? '';
}

// Get language URL for maintenance page
function get_maintenance_language_url($lang)
{
    // Build the URL with language parameter
    $current_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

    // Remove existing language parameter if present
    $current_url = preg_replace('/[?&]lang=[^&]*/', '', $current_url);

    // Add language parameter
    $separator = strpos($current_url, '?') !== false ? '&' : '?';
    return $current_url . $separator . 'lang=' . $lang;
}

// Generate social media links HTML for maintenance page
function get_maintenance_social_media_links()
{
    $social_media_platforms = [
        'facebook' => ['name' => 'Facebook', 'icon' => 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'],
        'linkedin' => ['name' => 'LinkedIn', 'icon' => 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'],
        'instagram' => ['name' => 'Instagram', 'icon' => 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'],
        'tiktok' => ['name' => 'TikTok', 'icon' => 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'],
        'github' => ['name' => 'GitHub', 'icon' => 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'],
        'whatsapp' => ['name' => 'WhatsApp', 'icon' => 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488'],
        'twitter' => ['name' => 'Twitter/X', 'icon' => 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'],
        'youtube' => ['name' => 'YouTube', 'icon' => 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'],
        'discord' => ['name' => 'Discord', 'icon' => 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189Z']
    ];

    $social_html = '';
    $active_platforms = [];

    // Check which platforms have URLs
    foreach ($social_media_platforms as $platform => $details) {
        $url = get_option('maintenance_mode_' . $platform . '_url', '');
        if (!empty($url)) {
            $active_platforms[$platform] = [
                'url' => $url,
                'name' => $details['name'],
                'icon' => $details['icon']
            ];
        }
    }

    // If no social media links, return empty
    if (empty($active_platforms)) {
        return '';
    }

    $social_html .= '<div class="social-media-links">';

    foreach ($active_platforms as $platform => $details) {
        $social_html .= '<a href="' . esc_url($details['url']) . '" target="_blank" rel="noopener noreferrer" class="social-icon social-' . esc_attr($platform) . '" aria-label="' . esc_attr($details['name']) . '">';
        $social_html .= '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">';
        $social_html .= '<path d="' . $details['icon'] . '"/>';
        $social_html .= '</svg>';
        $social_html .= '</a>';
    }

    $social_html .= '</div>';

    return $social_html;
}