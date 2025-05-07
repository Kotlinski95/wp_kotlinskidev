<?php
/*
Plugin Name: Custom Google Analytics Loader
Description: Allows you to manually provide a Google Analytics (gtag.js) script or just a GA ID for your WordPress site.
Version: 1.0.0
Author: Your Name
*/

// Add settings page
add_action('admin_menu', function() {
    add_options_page(
        'Custom Google Analytics',
        'Custom Google Analytics',
        'manage_options',
        'custom-ga-loader',
        'custom_ga_loader_settings_page'
    );
});

// Register setting
add_action('admin_init', function() {
    register_setting('custom_ga_loader_options', 'custom_ga_loader_ga_id');
    register_setting('custom_ga_loader_options', 'custom_ga_loader_custom_script');
});

// Settings page HTML
function custom_ga_loader_settings_page() {
    ?>
    <div class="wrap">
        <h1>Custom Google Analytics Loader</h1>
        <form method="post" action="options.php">
            <?php settings_fields('custom_ga_loader_options'); ?>
            <?php do_settings_sections('custom_ga_loader_options'); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Google Analytics Measurement ID (e.g. G-XXXXXXXXXX)</th>
                    <td><input type="text" name="custom_ga_loader_ga_id" value="<?php echo esc_attr(get_option('custom_ga_loader_ga_id')); ?>" style="width: 300px;" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Or provide custom GA script (overrides ID above)</th>
                    <td><textarea name="custom_ga_loader_custom_script" rows="8" cols="60"><?php echo esc_textarea(get_option('custom_ga_loader_custom_script')); ?></textarea></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// Output GA code in wp_head only on the frontend (not admin, not login, not REST)
add_action('wp_head', function() {
    if (is_admin() || defined('REST_REQUEST') && REST_REQUEST) {
        return;
    }
    $custom_script = get_option('custom_ga_loader_custom_script');
    $ga_id = trim(get_option('custom_ga_loader_ga_id'));
    if ($custom_script) {
        echo $custom_script;
    } elseif ($ga_id) {
        ?>
        <!-- Google tag (gtag.js) -->
        <script defer src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr($ga_id); ?>"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '<?php echo esc_js($ga_id); ?>');
        </script>
        <?php
    }
});
