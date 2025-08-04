<?php
if (!defined('ABSPATH')) exit;
function block_visibility_settings_page() {
    ?>
    <div class="wrap">
        <h1>Block Visibility Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('block_visibility_settings');
            do_settings_sections('block_visibility_settings');
            ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Mobile/Desktop Breakpoint (px)</th>
                    <td>
                        <input type="number" name="block_visibility_breakpoint" value="<?php echo esc_attr(get_option('block_visibility_breakpoint', 767)); ?>" min="320" max="1920" />
                        <p class="description">Blocks set to "Mobile only" or "Desktop only" will use this breakpoint.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

function block_visibility_register_settings() {
    register_setting('block_visibility_settings', 'block_visibility_breakpoint');
}
add_action('admin_init', 'block_visibility_register_settings');

function block_visibility_add_settings_page() {
    add_options_page('Block Visibility', 'Block Visibility', 'manage_options', 'block-visibility', 'block_visibility_settings_page');
}
add_action('admin_menu', 'block_visibility_add_settings_page');