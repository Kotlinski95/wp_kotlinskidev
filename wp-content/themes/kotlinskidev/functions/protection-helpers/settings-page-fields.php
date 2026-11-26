<?php

if (!function_exists('kotlinskidev_render_protection_auto_protect_fields')) {
    function kotlinskidev_render_protection_auto_protect_fields($auto_protect_emails, $auto_protect_phones)
    {
?>
                <h2><?php esc_html_e('Auto-Protection Settings', 'kotlinskidev'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="auto_protect_emails"><?php esc_html_e('Auto-protect Emails', 'kotlinskidev'); ?></label></th>
                        <td>
                            <input type="checkbox" id="auto_protect_emails" name="auto_protect_emails" <?php checked($auto_protect_emails); ?> />
                            <p class="description"><?php esc_html_e('Automatically protect all email addresses in content', 'kotlinskidev'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="auto_protect_phones"><?php esc_html_e('Auto-protect Phone Numbers', 'kotlinskidev'); ?></label></th>
                        <td>
                            <input type="checkbox" id="auto_protect_phones" name="auto_protect_phones" <?php checked($auto_protect_phones); ?> />
                            <p class="description"><?php esc_html_e('Automatically protect all phone numbers in content', 'kotlinskidev'); ?></p>
                        </td>
                    </tr>
                </table>

<?php
    }
}

if (!function_exists('kotlinskidev_render_protection_encryption_fields')) {
    function kotlinskidev_render_protection_encryption_fields($keys_exist, $using_wp_config, $key_storage_method)
    {
?>
                <h2><?php esc_html_e('Encryption Settings', 'kotlinskidev'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('Encryption Status', 'kotlinskidev'); ?></th>
                        <td>
                            <?php if ($keys_exist): ?>
                                <span style="color: green;">✓ <?php esc_html_e('RSA-2048 encryption is active', 'kotlinskidev'); ?></span>
                                <?php if ($using_wp_config): ?>
                                    <br><small style="color: #0073aa;">🔒 <?php esc_html_e('Keys are stored securely in wp-config.php', 'kotlinskidev'); ?></small>
                                <?php else: ?>
                                    <br><small style="color: #d63638;">⚠️ <?php esc_html_e('Keys are stored in database (less secure)', 'kotlinskidev'); ?></small>
                                <?php endif; ?>
                            <?php else: ?>
                                <span style="color: red;">✗ <?php esc_html_e('No encryption keys found', 'kotlinskidev'); ?></span>
                            <?php endif; ?>
                            <p class="description"><?php esc_html_e('Content is encrypted using RSA-2048 encryption for maximum security.', 'kotlinskidev'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="key_storage_method"><?php esc_html_e('Key Storage Method', 'kotlinskidev'); ?></label></th>
                        <td>
                            <?php if ($using_wp_config): ?>
                                <p><strong><?php esc_html_e('Currently using wp-config.php (Recommended)', 'kotlinskidev'); ?></strong></p>
                                <p class="description"><?php esc_html_e('Keys are securely stored in wp-config.php constants.', 'kotlinskidev'); ?></p>
                            <?php else: ?>
                                <select id="key_storage_method" name="key_storage_method">
                                    <option value="database" <?php selected($key_storage_method, 'database'); ?>><?php esc_html_e('Database (Default)', 'kotlinskidev'); ?></option>
                                    <option value="wp_config" <?php selected($key_storage_method, 'wp_config'); ?>><?php esc_html_e('wp-config.php (More Secure)', 'kotlinskidev'); ?></option>
                                </select>
                                <p class="description">
                                    <?php esc_html_e('Database storage is convenient but less secure. wp-config.php storage requires manual setup but is more secure.', 'kotlinskidev'); ?>
                                </p>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Generate New Keys', 'kotlinskidev'); ?></th>
                        <td>
                            <button type="button" id="regenerate-keys" class="button button-secondary">
                                <?php esc_html_e('Generate New Encryption Keys', 'kotlinskidev'); ?>
                            </button>
                            <p class="description">
                                <?php esc_html_e('Warning: Regenerating keys will make all existing protected content unreadable until re-protected.', 'kotlinskidev'); ?>
                            </p>
                        </td>
                    </tr>
                </table>

<?php
    }
}

if (!function_exists('kotlinskidev_render_protection_wp_config_notice')) {
    function kotlinskidev_render_protection_wp_config_notice()
    {
?>
                <div class="notice notice-info">
                    <h3><?php esc_html_e('wp-config.php Setup Instructions', 'kotlinskidev'); ?></h3>
                    <p><?php esc_html_e('To use wp-config.php storage, add these constants to your wp-config.php file:', 'kotlinskidev'); ?></p>
                    <button type="button" id="show-wp-config-keys" class="button button-primary">
                        <?php esc_html_e('Generate & Show wp-config.php Constants', 'kotlinskidev'); ?>
                    </button>
                    <div id="wp-config-instructions" style="display: none; margin-top: 0.9375rem;">
                        <label for="wp-config-constants" class="screen-reader-text"><?php esc_html_e('Generated wp-config.php constants', 'kotlinskidev'); ?></label>
                        <textarea readonly style="width: 100%; height: 9.375rem; font-family: monospace; font-size: 0.75rem;" id="wp-config-constants"></textarea>
                        <p><strong><?php esc_html_e('Instructions:', 'kotlinskidev'); ?></strong></p>
                        <ol>
                            <li><?php esc_html_e('Copy the constants above', 'kotlinskidev'); ?></li>
                            <li><?php esc_html_e('Add them to your wp-config.php file before the line that says "/* That\'s all, stop editing! */"', 'kotlinskidev'); ?></li>
                            <li><?php esc_html_e('Save the file and reload this page', 'kotlinskidev'); ?></li>
                        </ol>
                    </div>
                </div>
<?php
    }
}

if (!function_exists('kotlinskidev_render_protection_usage_examples')) {
    function kotlinskidev_render_protection_usage_examples()
    {
?>
            <h2><?php esc_html_e('Usage Examples', 'kotlinskidev'); ?></h2>
            <h3><?php esc_html_e('Block Editor', 'kotlinskidev'); ?></h3>
            <p><?php esc_html_e('Use the "Protected Content" block from the KotlinskiDev category.', 'kotlinskidev'); ?></p>

            <h3><?php esc_html_e('Shortcode', 'kotlinskidev'); ?></h3>
            <code>[protect type="email"]example@email.com[/protect]</code><br>
            <code>[protect type="phone"]+1 (555) 123-4567[/protect]</code><br>
            <code>[protect type="text"]Sensitive information[/protect]</code>
<?php
    }
}
