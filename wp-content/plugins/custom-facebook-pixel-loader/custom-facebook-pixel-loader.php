<?php
/*
Plugin Name: Custom Facebook Pixel Loader
Description: Allows you to manually provide a Facebook Pixel script or just a Pixel ID for your WordPress site.
Version: 1.0.0
Author: Your Name
*/

// Add settings page
add_action('admin_menu', function() {
    add_options_page(
        'Custom Facebook Pixel',
        'Custom Facebook Pixel',
        'manage_options',
        'custom-fb-pixel-loader',
        'custom_fb_pixel_loader_settings_page'
    );
});

// Register setting
add_action('admin_init', function() {
    register_setting('custom_fb_pixel_loader_options', 'custom_fb_pixel_loader_pixel_id');
    register_setting('custom_fb_pixel_loader_options', 'custom_fb_pixel_loader_custom_script');
});

// Settings page HTML
function custom_fb_pixel_loader_settings_page() {
    ?>
    <div class="wrap">
        <h1>Custom Facebook Pixel Loader</h1>
        <form method="post" action="options.php">
            <?php settings_fields('custom_fb_pixel_loader_options'); ?>
            <?php do_settings_sections('custom_fb_pixel_loader_options'); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Facebook Pixel ID (e.g. 123456789012345)</th>
                    <td><input type="text" name="custom_fb_pixel_loader_pixel_id" value="<?php echo esc_attr(get_option('custom_fb_pixel_loader_pixel_id')); ?>" style="width: 300px;" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Or provide custom Pixel script (overrides ID above)</th>
                    <td><textarea name="custom_fb_pixel_loader_custom_script" rows="8" cols="60"><?php echo esc_textarea(get_option('custom_fb_pixel_loader_custom_script')); ?></textarea></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// Output Pixel code in wp_head only on the frontend (not admin, not login, not REST)
add_action('wp_head', function() {
    if (is_admin() || defined('REST_REQUEST') && REST_REQUEST) {
        return;
    }
    $custom_script = get_option('custom_fb_pixel_loader_custom_script');
    $pixel_id = trim(get_option('custom_fb_pixel_loader_pixel_id'));
    if ($custom_script) {
        echo $custom_script;
    } elseif ($pixel_id) {
        ?>
        <!-- Facebook Pixel Code -->
        <script>
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '<?php echo esc_js($pixel_id); ?>');
          fbq('track', 'PageView');
        </script>
        <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=<?php echo esc_attr($pixel_id); ?>&ev=PageView&noscript=1"/></noscript>
        <!-- End Facebook Pixel Code -->
        <?php
    }
});
