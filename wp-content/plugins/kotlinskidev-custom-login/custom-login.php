<?php
/*
Plugin Name: KotlinskiDev Login Page
Description: Customize the WordPress login page background, logo, and styling.
Version: 1.0
Author: Adrian Kotlinski
*/
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
// Add admin menu
add_action('admin_menu', 'kotlinski_login_admin_menu');

function kotlinski_login_admin_menu()
{
    add_options_page(
        'KotlinskiDev Login Settings',
        'Login Customizer',
        'manage_options',
        'kotlinski-login-settings',
        'kotlinski_login_settings_page'
    );
}

// Settings page
function kotlinski_login_settings_page()
{
    if (isset($_POST['submit'])) {
        update_option('kotlinski_login_bg_image', sanitize_url($_POST['bg_image']));
        update_option('kotlinski_login_logo_image', sanitize_url($_POST['logo_image']));
        update_option('kotlinski_login_bg_color', sanitize_hex_color($_POST['bg_color']));
        update_option('kotlinski_login_accent_color', sanitize_hex_color($_POST['accent_color']));
        update_option('kotlinski_login_enable_custom', isset($_POST['enable_custom']) ? 1 : 0);

        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }

    $bg_image = get_option('kotlinski_login_bg_image', plugin_dir_url(__FILE__) . 'kotlinskidev-background.webp');
    $logo_image = get_option('kotlinski_login_logo_image', plugin_dir_url(__FILE__) . 'kotlinskidev-logo.webp');
    $bg_color = get_option('kotlinski_login_bg_color', '#000000');
    $accent_color = get_option('kotlinski_login_accent_color', '#fd0d0d');
    $enable_custom = get_option('kotlinski_login_enable_custom', 1);
?>
    <div class="wrap">
        <h1>KotlinskiDev Login Customizer</h1>
        <form method="post" action="">
            <table class="form-table">
                <tr>
                    <th scope="row">Enable Custom Login</th>
                    <td>
                        <input type="checkbox" name="enable_custom" value="1" <?php checked($enable_custom, 1); ?> />
                        <label>Enable custom login page styling</label>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Background Image URL</th>
                    <td>
                        <input type="url" name="bg_image" value="<?php echo esc_attr($bg_image); ?>" class="regular-text" />
                        <button type="button" class="button" onclick="openMediaUploader('bg_image')">Choose Image</button>
                        <p class="description">Enter the URL of your background image or use the media library.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Logo Image URL</th>
                    <td>
                        <input type="url" name="logo_image" value="<?php echo esc_attr($logo_image); ?>" class="regular-text" />
                        <button type="button" class="button" onclick="openMediaUploader('logo_image')">Choose Image</button>
                        <p class="description">Enter the URL of your logo image or use the media library.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Background Color</th>
                    <td>
                        <input type="color" name="bg_color" value="<?php echo esc_attr($bg_color); ?>" />
                        <p class="description">Fallback background color when no image is set.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Accent Color</th>
                    <td>
                        <input type="color" name="accent_color" value="<?php echo esc_attr($accent_color); ?>" />
                        <p class="description">Color for links and hover effects.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>

        <h2>Preview</h2>
        <div style="border: 1px solid #ddd; padding: 20px; background: <?php echo esc_attr($bg_color); ?>; background-image: url('<?php echo esc_url($bg_image); ?>'); background-size: cover; background-position: center; min-height: 200px; position: relative;">
            <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 5px; max-width: 300px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="<?php echo esc_url($logo_image); ?>" style="max-width: 150px; height: auto;" alt="Logo Preview" />
                </div>
                <p style="text-align: center; margin: 0;">Login Form Preview</p>
                <a href="#" style="color: <?php echo esc_attr($accent_color); ?>;">Link Example</a>
            </div>
        </div>
    </div>

    <script>
        function openMediaUploader(inputName) {
            var mediaUploader = wp.media({
                title: 'Choose Image',
                button: {
                    text: 'Use Image'
                },
                multiple: false
            });

            mediaUploader.on('select', function() {
                var attachment = mediaUploader.state().get('selection').first().toJSON();
                document.getElementsByName(inputName)[0].value = attachment.url;
            });

            mediaUploader.open();
        }
    </script>
<?php
}

// Enqueue media uploader in admin
add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook === 'settings_page_kotlinski-login-settings') {
        wp_enqueue_media();
    }
});

function custom_login_page_styles()
{
    if (!get_option('kotlinski_login_enable_custom', 1)) {
        return;
    }

    $bg_image = get_option('kotlinski_login_bg_image', plugin_dir_url(__FILE__) . 'kotlinskidev-background.webp');
    $bg_color = get_option('kotlinski_login_bg_color', '#000000');

    echo '<style type="text/css">
        body.login {
            background-color: ' . esc_attr($bg_color) . ';
            background-image: url("' . esc_url($bg_image) . '");
            background-size: cover;
            background-position: center;
        }
    </style>';
}
add_action('login_head', 'custom_login_page_styles');

function custom_login_logo()
{
    if (!get_option('kotlinski_login_enable_custom', 1)) {
        return;
    }

    $logo_image = get_option('kotlinski_login_logo_image', plugin_dir_url(__FILE__) . 'kotlinskidev-logo.webp');

    echo '<style type="text/css">
        .login h1 a {
            background-image: url("' . esc_url($logo_image) . '");
            background-size: contain;
            width: 100%;
            min-height: 200px;
        }
    </style>';
}
add_action('login_head', 'custom_login_logo');

function custom_login_input_styles()
{
    if (!get_option('kotlinski_login_enable_custom', 1)) {
        return;
    }

    $accent_color = get_option('kotlinski_login_accent_color', '#fd0d0d');

    echo '<style type="text/css">
        .login input[type="text"], .login input[type="password"] {
            background-color: #f7f7f7;
            border: 1px solid #ccc;
            padding: 10px;
        }
        .login #nav a,
        .login #backtoblog a,
        #language-switcher{
            color: #fff;
        }
        
        .login #nav a:hover,
        .login #backtoblog a:hover,
        #language-switcher:hover{
            color: ' . esc_attr($accent_color) . ';
        }
    </style>';
}
add_action('login_head', 'custom_login_input_styles');