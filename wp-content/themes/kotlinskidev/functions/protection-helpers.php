<?php

/**
 * PHP Helper Functions for Protected Content
 * Server-side utilities for the Protected Content block with RSA encryption
 */

if (!defined('KOTLINSKIDEV_MAX_DECRYPT_BATCH_SIZE')) {
    define('KOTLINSKIDEV_MAX_DECRYPT_BATCH_SIZE', 50);
}

if (!function_exists('kotlinskidev_generate_rsa_keys')) {
    /**
     * Generate RSA key pair for content protection
     */
    function kotlinskidev_generate_rsa_keys()
    {
        $config = array(
            "digest_alg" => "sha512",
            "private_key_bits" => 2048,
            "private_key_type" => OPENSSL_KEYTYPE_RSA,
        );

        $resource = openssl_pkey_new($config);
        if (!$resource) {
            return false;
        }

        // Extract private key
        openssl_pkey_export($resource, $private_key);

        // Extract public key
        $key_details = openssl_pkey_get_details($resource);
        $public_key = $key_details["key"];

        return array(
            'private_key' => $private_key,
            'public_key' => $public_key
        );
    }
}

if (!function_exists('kotlinskidev_get_or_create_keys')) {
    /**
     * Get existing keys or create new ones
     * Priority: wp-config.php constants > WordPress options > generate new
     */
    function kotlinskidev_get_or_create_keys()
    {
        // First, check for keys defined in wp-config.php (most secure)
        if (defined('KOTLINSKIDEV_PRIVATE_KEY') && defined('KOTLINSKIDEV_PUBLIC_KEY')) {
            return array(
                'private_key' => KOTLINSKIDEV_PRIVATE_KEY,
                'public_key' => KOTLINSKIDEV_PUBLIC_KEY
            );
        }

        // Fallback to WordPress options
        $private_key = get_option('kotlinskidev_private_key');
        $public_key = get_option('kotlinskidev_public_key');

        // If keys don't exist or are invalid, generate new ones
        if (empty($private_key) || empty($public_key)) {
            $keys = kotlinskidev_generate_rsa_keys();
            if ($keys) {
                // Store based on user preference
                $storage_method = get_option('kotlinskidev_key_storage_method', 'database');

                if ($storage_method === 'database') {
                    update_option('kotlinskidev_private_key', $keys['private_key']);
                    update_option('kotlinskidev_public_key', $keys['public_key']);
                }
                // For wp-config storage, we'll provide instructions to the user

                return $keys;
            }
            return false;
        }

        return array(
            'private_key' => $private_key,
            'public_key' => $public_key
        );
    }
}

if (!function_exists('kotlinskidev_encrypt_content')) {
    /**
     * Encrypt content using RSA public key
     */
    function kotlinskidev_encrypt_content($content)
    {
        $keys = kotlinskidev_get_or_create_keys();
        if (!$keys) {
            // Fallback to base64 if encryption fails
            return base64_encode($content);
        }

        $encrypted = '';
        $success = openssl_public_encrypt($content, $encrypted, $keys['public_key']);

        if ($success) {
            return base64_encode($encrypted);
        }

        // Fallback to base64 if encryption fails
        return base64_encode($content);
    }
}

if (!function_exists('kotlinskidev_decrypt_content')) {
    /**
     * Decrypt content using RSA private key
     */
    function kotlinskidev_decrypt_content($encrypted_content)
    {
        $keys = kotlinskidev_get_or_create_keys();
        if (!$keys) {
            // If no keys available, try to decode as base64, otherwise return as-is
            $decoded = base64_decode($encrypted_content, true);
            return $decoded !== false ? $decoded : $encrypted_content;
        }

        // Try to decode as base64 first
        $encrypted_data = base64_decode($encrypted_content, true);
        if ($encrypted_data === false) {
            // Not valid base64, return original content
            return $encrypted_content;
        }

        $decrypted = '';
        $success = openssl_private_decrypt($encrypted_data, $decrypted, $keys['private_key']);

        if ($success) {
            return $decrypted;
        }

        // RSA decryption failed - check if content is valid base64
        $base64_decoded = base64_decode($encrypted_content, true);
        if ($base64_decoded !== false && mb_check_encoding($base64_decoded, 'UTF-8')) {
            // Valid base64 with valid UTF-8 content
            return $base64_decoded;
        }

        // Neither RSA nor base64 worked, return original content
        return $encrypted_content;
    }
}

if (!function_exists('kotlinskidev_register_protected_content_block')) {
    /**
     * Register the protected content block
     */
    function kotlinskidev_register_protected_content_block()
    {
        // Register block category if it doesn't exist
        add_filter('block_categories_all', function ($categories) {
            $category_exists = false;
            foreach ($categories as $category) {
                if ($category['slug'] === 'kotlinskidev') {
                    $category_exists = true;
                    break;
                }
            }

            if (!$category_exists) {
                array_unshift($categories, array(
                    'slug'  => 'kotlinskidev',
                    'title' => __('KotlinskiDev', 'kotlinskidev'),
                    'icon'  => 'shield'
                ));
            }

            return $categories;
        });
    }
    add_action('init', 'kotlinskidev_register_protected_content_block');
}

if (!function_exists('kotlinskidev_enqueue_protection_scripts')) {
    /**
     * Enqueue protection scripts and styles
     */
    function kotlinskidev_enqueue_protection_scripts()
    {
        // Since the protection script is bundled in main.js, we don't need to check for specific blocks
        // The script will automatically detect and process protected content on any page

        $theme_version = wp_get_theme()->get('Version');

        // The protection script is already bundled in main.js, so we just need to add the config
        $config = array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('kotlinskidev_protection_nonce'),
            'errorText' => __('Failed to load protected content', 'kotlinskidev'),
            'themeUrl' => get_template_directory_uri(),
        );

        wp_localize_script('wp-typescript', 'kotlinskidevProtectionConfig', $config);
        
        // Add no-cache headers for protection-related requests
        add_action('wp_ajax_kotlinskidev_decrypt_content', 'kotlinskidev_set_nocache_headers', 1);
        add_action('wp_ajax_nopriv_kotlinskidev_decrypt_content', 'kotlinskidev_set_nocache_headers', 1);
    }
    add_action('wp_enqueue_scripts', 'kotlinskidev_enqueue_protection_scripts');
}

if (!function_exists('kotlinskidev_protection_shortcode')) {
    /**
     * Shortcode for quick protection of inline content
     * Usage: [protect type="email"]example@email.com[/protect]
     */
    function kotlinskidev_protection_shortcode($atts, $content = '')
    {
        $atts = shortcode_atts(array(
            'type' => 'text',
            'tag' => 'span',
        ), $atts);

        if (empty($content)) {
            return '';
        }

        $encrypted_content = kotlinskidev_encrypt_content($content);
        $class = sprintf('protected-content protected-content--%s', esc_attr($atts['type']));

        return sprintf(
            '<%1$s class="%2$s" data-protected="true" data-protection-type="%3$s" data-original-content="%4$s"></%1$s>',
            esc_attr($atts['tag']),
            esc_attr($class),
            esc_attr($atts['type']),
            esc_attr($encrypted_content)
        );
    }
    add_shortcode('protect', 'kotlinskidev_protection_shortcode');
}

if (!function_exists('kotlinskidev_add_protection_to_content')) {
    /**
     * Automatically protect emails and phones in content
     * This function can be used as a filter on content
     */
    function kotlinskidev_add_protection_to_content($content)
    {
        // Only run on frontend
        if (is_admin()) {
            return $content;
        }

        $auto_protect_emails = get_option('kotlinskidev_auto_protect_emails', false);
        $auto_protect_phones = get_option('kotlinskidev_auto_protect_phones', false);

        if (!$auto_protect_emails && !$auto_protect_phones) {
            return $content;
        }

        // Use DOMDocument for safer HTML manipulation
        $dom = new DOMDocument();
        $dom->encoding = 'UTF-8';

        // Suppress warnings for malformed HTML
        libxml_use_internal_errors(true);

        // Load content with UTF-8 support
        $dom->loadHTML('<?xml encoding="UTF-8">' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        // Clear libxml errors
        libxml_clear_errors();

        $xpath = new DOMXPath($dom);

        // Strategy: Protect ALL emails and phones, even if already in links

        // Find and protect emails (including those in links)
        if ($auto_protect_emails) {
            // Find all email links
            $emailLinks = $xpath->query('//a[starts-with(@href, "mailto:")]');
            foreach ($emailLinks as $link) {
                $href = $link->getAttribute('href');
                $email = trim(str_replace('mailto:', '', $href));
                if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $encrypted = kotlinskidev_encrypt_content($email);
                    $protectedSpan = $dom->createElement('span');
                    $protectedSpan->setAttribute('class', 'protected-content protected-content--email');
                    $protectedSpan->setAttribute('data-protected', 'true');
                    $protectedSpan->setAttribute('data-protection-type', 'email');
                    $protectedSpan->setAttribute('data-original-content', $encrypted);
                    $link->parentNode->replaceChild($protectedSpan, $link);
                } else {
                    error_log('Invalid email found: ' . $email);
                }
            }

            // Find and protect plain text emails (not in links)
            $textNodes = $xpath->query('//text()[not(ancestor::a)]');
            foreach ($textNodes as $textNode) {
                $text = $textNode->nodeValue;
                $email_pattern = '/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/';
                if (preg_match($email_pattern, $text)) {
                    $newText = preg_replace_callback($email_pattern, function ($matches) {
                        $email = $matches[0];
                        $encrypted = kotlinskidev_encrypt_content($email);
                        return sprintf(
                            '<span class="protected-content protected-content--email" data-protected="true" data-protection-type="email" data-original-content="%s"></span>',
                            htmlspecialchars($encrypted, ENT_QUOTES)
                        );
                    }, $text);

                    if ($newText !== $text) {
                        $fragment = $dom->createDocumentFragment();
                        $fragment->appendXML($newText);
                        $textNode->parentNode->replaceChild($fragment, $textNode);
                    }
                }
            }
        }

        // Find and protect phones (including those in links)
        if ($auto_protect_phones) {
            // Find all phone links
            $phoneLinks = $xpath->query('//a[starts-with(@href, "tel:")]');
            foreach ($phoneLinks as $link) {
                $href = $link->getAttribute('href');
                $phone = $link->textContent;
                $encrypted = kotlinskidev_encrypt_content($phone);
                $protectedSpan = $dom->createElement('span');
                $protectedSpan->setAttribute('class', 'protected-content protected-content--phone');
                $protectedSpan->setAttribute('data-protected', 'true');
                $protectedSpan->setAttribute('data-protection-type', 'phone');
                $protectedSpan->setAttribute('data-original-content', $encrypted);
                $link->parentNode->replaceChild($protectedSpan, $link);
            }

            // Find and protect plain text phones (not in links)
            $textNodes = $xpath->query('//text()[not(ancestor::a)]');
            foreach ($textNodes as $textNode) {
                $text = $textNode->nodeValue;
                $phone_pattern = '/\b(?:\+?48[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{3}|\(?[0-9]{2}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{2}[-.\s]?[0-9]{2})\b/';
                if (preg_match($phone_pattern, $text)) {
                    $newText = preg_replace_callback($phone_pattern, function ($matches) {
                        $phone = $matches[0];
                        $encrypted = kotlinskidev_encrypt_content($phone);
                        return sprintf(
                            '<span class="protected-content protected-content--phone" data-protected="true" data-protection-type="phone" data-original-content="%s"></span>',
                            htmlspecialchars($encrypted, ENT_QUOTES)
                        );
                    }, $text);

                    if ($newText !== $text) {
                        $fragment = $dom->createDocumentFragment();
                        $fragment->appendXML($newText);
                        $textNode->parentNode->replaceChild($fragment, $textNode);
                    }
                }
            }
        }

        // Get the modified content
        $modifiedContent = $dom->saveHTML();

        // Clean up the XML declaration that was added for UTF-8 support
        $modifiedContent = preg_replace('/^<!DOCTYPE.+?>/', '', $modifiedContent);
        $modifiedContent = preg_replace('/<\?xml[^>]+\?>/', '', $modifiedContent);
        $modifiedContent = str_replace(['<html><body>', '</body></html>'], '', $modifiedContent);

        return $modifiedContent;
    }
}

if (!function_exists('kotlinskidev_maybe_add_auto_protection')) {
    /**
     * Conditionally add auto-protection based on admin settings
     */
    function kotlinskidev_maybe_add_auto_protection()
    {
        $auto_protect_emails = get_option('kotlinskidev_auto_protect_emails', false);
        $auto_protect_phones = get_option('kotlinskidev_auto_protect_phones', false);

        // Only add the filters if at least one protection type is enabled
        if ($auto_protect_emails || $auto_protect_phones) {
            // Main content protection
            add_filter('the_content', 'kotlinskidev_add_protection_to_content');

            // Widget content protection
            add_filter('widget_text', 'kotlinskidev_add_protection_to_content');
            add_filter('widget_custom_html', 'kotlinskidev_add_protection_to_content');

            // Navigation menu protection
            add_filter('wp_nav_menu', 'kotlinskidev_add_protection_to_content');
            add_filter('render_block_kotlinskidev/navigation', 'kotlinskidev_add_protection_to_content');

            // Theme content protection (for template parts, footer, etc.)
            add_filter('kotlinskidev_protect_content', 'kotlinskidev_add_protection_to_content');

            // General text widget protection
            add_filter('widget_text_content', 'kotlinskidev_add_protection_to_content');
        }
    }
    add_action('init', 'kotlinskidev_maybe_add_auto_protection');
}

if (!function_exists('kotlinskidev_admin_protection_settings')) {
    /**
     * Add protection settings to admin
     */
    function kotlinskidev_admin_protection_settings()
    {
        add_options_page(
            __('Content Protection', 'kotlinskidev'),
            __('Content Protection', 'kotlinskidev'),
            'manage_options',
            'kotlinskidev-protection',
            'kotlinskidev_protection_settings_page'
        );
    }
    add_action('admin_menu', 'kotlinskidev_admin_protection_settings');
}

if (!function_exists('kotlinskidev_protection_settings_page')) {
    /**
     * Protection settings page
     */
    function kotlinskidev_protection_settings_page()
    {
        if (isset($_POST['submit'])) {
            if (!isset($_POST['kotlinskidev_protection_settings_nonce']) ||
                !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['kotlinskidev_protection_settings_nonce'])), 'kotlinskidev_protection_settings_action')) {
                wp_die(esc_html__('Security check failed', 'kotlinskidev'));
            }

            if (!current_user_can('manage_options')) {
                wp_die(esc_html__('You do not have permission to change these settings', 'kotlinskidev'));
            }

            update_option('kotlinskidev_auto_protect_emails', isset($_POST['auto_protect_emails']));
            update_option('kotlinskidev_auto_protect_phones', isset($_POST['auto_protect_phones']));
            update_option('kotlinskidev_key_storage_method', isset($_POST['key_storage_method']) ? sanitize_text_field(wp_unslash($_POST['key_storage_method'])) : 'database');
            echo '<div class="notice notice-success"><p>' . esc_html__('Settings saved!', 'kotlinskidev') . '</p></div>';
        }

        $auto_protect_emails = get_option('kotlinskidev_auto_protect_emails', false);
        $auto_protect_phones = get_option('kotlinskidev_auto_protect_phones', false);
        $key_storage_method = get_option('kotlinskidev_key_storage_method', 'database');
        $keys = kotlinskidev_get_or_create_keys();
        $keys_exist = !empty($keys['private_key']) && !empty($keys['public_key']);
        $using_wp_config = defined('KOTLINSKIDEV_PRIVATE_KEY') && defined('KOTLINSKIDEV_PUBLIC_KEY');
?>
        <div class="wrap">
            <h1><?php esc_html_e('Content Protection Settings', 'kotlinskidev'); ?></h1>

            <form method="post" action="">
                <?php wp_nonce_field('kotlinskidev_protection_settings_action', 'kotlinskidev_protection_settings_nonce'); ?>
                <h2><?php esc_html_e('Auto-Protection Settings', 'kotlinskidev'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('Auto-protect Emails', 'kotlinskidev'); ?></th>
                        <td>
                            <input type="checkbox" name="auto_protect_emails" <?php checked($auto_protect_emails); ?> />
                            <p class="description"><?php esc_html_e('Automatically protect all email addresses in content', 'kotlinskidev'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Auto-protect Phone Numbers', 'kotlinskidev'); ?></th>
                        <td>
                            <input type="checkbox" name="auto_protect_phones" <?php checked($auto_protect_phones); ?> />
                            <p class="description"><?php esc_html_e('Automatically protect all phone numbers in content', 'kotlinskidev'); ?></p>
                        </td>
                    </tr>
                </table>

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
                        <th scope="row"><?php esc_html_e('Key Storage Method', 'kotlinskidev'); ?></th>
                        <td>
                            <?php if ($using_wp_config): ?>
                                <p><strong><?php esc_html_e('Currently using wp-config.php (Recommended)', 'kotlinskidev'); ?></strong></p>
                                <p class="description"><?php esc_html_e('Keys are securely stored in wp-config.php constants.', 'kotlinskidev'); ?></p>
                            <?php else: ?>
                                <select name="key_storage_method">
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

                <?php submit_button(); ?>
            </form>

            <?php if ($key_storage_method === 'wp_config' && !$using_wp_config): ?>
                <div class="notice notice-info">
                    <h3><?php esc_html_e('wp-config.php Setup Instructions', 'kotlinskidev'); ?></h3>
                    <p><?php esc_html_e('To use wp-config.php storage, add these constants to your wp-config.php file:', 'kotlinskidev'); ?></p>
                    <button type="button" id="show-wp-config-keys" class="button button-primary">
                        <?php esc_html_e('Generate & Show wp-config.php Constants', 'kotlinskidev'); ?>
                    </button>
                    <div id="wp-config-instructions" style="display: none; margin-top: 0.9375rem;">
                        <textarea readonly style="width: 100%; height: 9.375rem; font-family: monospace; font-size: 0.75rem;" id="wp-config-constants"></textarea>
                        <p><strong><?php esc_html_e('Instructions:', 'kotlinskidev'); ?></strong></p>
                        <ol>
                            <li><?php esc_html_e('Copy the constants above', 'kotlinskidev'); ?></li>
                            <li><?php esc_html_e('Add them to your wp-config.php file before the line that says "/* That\'s all, stop editing! */"', 'kotlinskidev'); ?></li>
                            <li><?php esc_html_e('Save the file and reload this page', 'kotlinskidev'); ?></li>
                        </ol>
                    </div>
                </div>
            <?php endif; ?>

            <script>
                document.getElementById('regenerate-keys').addEventListener('click', function() {
                    if (!confirm('<?php echo esc_js(__('Are you sure? This will invalidate all existing protected content.', 'kotlinskidev')); ?>')) {
                        return;
                    }

                    var data = new FormData();
                    data.append('action', 'kotlinskidev_regenerate_keys');
                    data.append('nonce', '<?php echo esc_js(wp_create_nonce('kotlinskidev_admin_nonce')); ?>');

                    fetch('<?php echo esc_url(admin_url('admin-ajax.php')); ?>', {
                            method: 'POST',
                            body: data
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                alert('<?php echo esc_js(__('Keys regenerated successfully!', 'kotlinskidev')); ?>');
                                location.reload();
                            } else {
                                alert('<?php echo esc_js(__('Error: ', 'kotlinskidev')); ?>' + result.data);
                            }
                        })
                        .catch(error => {
                            alert('<?php echo esc_js(__('Network error occurred', 'kotlinskidev')); ?>');
                        });
                });

                <?php if ($key_storage_method === 'wp_config' && !$using_wp_config): ?>
                    document.getElementById('show-wp-config-keys').addEventListener('click', function() {
                        var data = new FormData();
                        data.append('action', 'kotlinskidev_get_wp_config_constants');
                        data.append('nonce', '<?php echo esc_js(wp_create_nonce('kotlinskidev_admin_nonce')); ?>');

                        fetch('<?php echo esc_url(admin_url('admin-ajax.php')); ?>', {
                                method: 'POST',
                                body: data
                            })
                            .then(response => response.json())
                            .then(result => {
                                if (result.success) {
                                    document.getElementById('wp-config-constants').value = result.data;
                                    document.getElementById('wp-config-instructions').style.display = 'block';
                                    this.textContent = '<?php echo esc_js(__('Constants Generated', 'kotlinskidev')); ?>';
                                    this.disabled = true;
                                } else {
                                    alert('<?php echo esc_js(__('Error: ', 'kotlinskidev')); ?>' + result.data);
                                }
                            })
                            .catch(error => {
                                alert('<?php echo esc_js(__('Network error occurred', 'kotlinskidev')); ?>');
                            });
                    });
                <?php endif; ?>
            </script>

            <h2><?php esc_html_e('Usage Examples', 'kotlinskidev'); ?></h2>
            <h3><?php esc_html_e('Block Editor', 'kotlinskidev'); ?></h3>
            <p><?php esc_html_e('Use the "Protected Content" block from the KotlinskiDev category.', 'kotlinskidev'); ?></p>

            <h3><?php esc_html_e('Shortcode', 'kotlinskidev'); ?></h3>
            <code>[protect type="email"]example@email.com[/protect]</code><br>
            <code>[protect type="phone"]+1 (555) 123-4567[/protect]</code><br>
            <code>[protect type="text"]Sensitive information[/protect]</code>
        </div>
<?php
    }
}

if (!function_exists('kotlinskidev_protect_output')) {
    /**
     * Helper function to manually protect content in theme files
     * Usage in templates: echo kotlinskidev_protect_output($content);
     */
    function kotlinskidev_protect_output($content)
    {
        $auto_protect_emails = get_option('kotlinskidev_auto_protect_emails', false);
        $auto_protect_phones = get_option('kotlinskidev_auto_protect_phones', false);

        if ($auto_protect_emails || $auto_protect_phones) {
            return kotlinskidev_add_protection_to_content($content);
        }

        return $content;
    }
}

if (!function_exists('kotlinskidev_format_decrypted_content')) {
    function kotlinskidev_format_decrypted_content($decrypted_content, $protection_type)
    {
        switch ($protection_type) {
            case 'email':
                return sprintf('<a href="mailto:%s">%s</a>', esc_attr($decrypted_content), esc_html($decrypted_content));
            case 'phone':
                $clean_phone = preg_replace('/[^+0-9]/', '', $decrypted_content);
                return sprintf('<a href="tel:%s">%s</a>', esc_attr($clean_phone), esc_html($decrypted_content));
            case 'text':
            case 'address':
            case 'other':
                return wp_kses_post($decrypted_content);
            default:
                return esc_html($decrypted_content);
        }
    }
}

if (!function_exists('kotlinskidev_ajax_decrypt_content')) {
    function kotlinskidev_ajax_decrypt_content()
    {
        kotlinskidev_set_nocache_headers();

        $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';

        if (!wp_verify_nonce($nonce, 'kotlinskidev_protection_nonce')) {
            wp_send_json_error(array(
                'message' => __('Security token expired. This may be due to page caching. Please refresh the page and try again.', 'kotlinskidev'),
                'error_code' => 'nonce_expired',
                'refresh_required' => true
            ));
        }

        $items = json_decode(wp_unslash($_POST['items'] ?? ''), true); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- decoded JSON items are sanitized per-field below (sanitize_text_field for type, decrypted content is escaped in kotlinskidev_format_decrypted_content)

        if (!is_array($items) || empty($items)) {
            wp_send_json_error(__('No content provided', 'kotlinskidev'));
        }

        if (count($items) > KOTLINSKIDEV_MAX_DECRYPT_BATCH_SIZE) {
            wp_send_json_error(__('Too many items requested', 'kotlinskidev'));
        }

        $results = array();

        foreach ($items as $key => $item) {
            $encrypted_content = trim((string) ($item['content'] ?? ''));
            $protection_type = sanitize_text_field($item['type'] ?? '');

            if (empty($encrypted_content)) {
                $results[$key] = null;
                continue;
            }

            $decrypted_content = kotlinskidev_decrypt_content($encrypted_content);

            $results[$key] = array(
                'content' => kotlinskidev_format_decrypted_content($decrypted_content, $protection_type),
                'raw_content' => $decrypted_content
            );
        }

        wp_send_json_success(array('results' => $results));
    }
    add_action('wp_ajax_kotlinskidev_decrypt_content', 'kotlinskidev_ajax_decrypt_content');
    add_action('wp_ajax_nopriv_kotlinskidev_decrypt_content', 'kotlinskidev_ajax_decrypt_content');
}

if (!function_exists('kotlinskidev_ajax_regenerate_keys')) {
    /**
     * AJAX handler for regenerating encryption keys
     */
    function kotlinskidev_ajax_regenerate_keys()
    {
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }

        // Verify nonce
        $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';
        if (!wp_verify_nonce($nonce, 'kotlinskidev_admin_nonce')) {
            wp_die('Security check failed');
        }

        $keys = kotlinskidev_generate_rsa_keys();
        if ($keys) {
            $storage_method = get_option('kotlinskidev_key_storage_method', 'database');

            if ($storage_method === 'database') {
                update_option('kotlinskidev_private_key', $keys['private_key']);
                update_option('kotlinskidev_public_key', $keys['public_key']);
            }

            wp_send_json_success('Keys regenerated successfully');
        } else {
            wp_send_json_error('Failed to generate new keys');
        }
    }
    add_action('wp_ajax_kotlinskidev_regenerate_keys', 'kotlinskidev_ajax_regenerate_keys');
}

if (!function_exists('kotlinskidev_ajax_get_wp_config_constants')) {
    /**
     * AJAX handler for generating wp-config.php constants
     */
    function kotlinskidev_ajax_get_wp_config_constants()
    {
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }

        // Verify nonce
        $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';
        if (!wp_verify_nonce($nonce, 'kotlinskidev_admin_nonce')) {
            wp_die('Security check failed');
        }

        $keys = kotlinskidev_generate_rsa_keys();
        if ($keys) {
            $constants = "// Content Protection Encryption Keys\n";
            $constants .= "// Add these constants to your wp-config.php file for secure key storage\n";
            $constants .= "define('KOTLINSKIDEV_PRIVATE_KEY', '" . addslashes($keys['private_key']) . "');\n";
            $constants .= "define('KOTLINSKIDEV_PUBLIC_KEY', '" . addslashes($keys['public_key']) . "');\n";

            wp_send_json_success($constants);
        } else {
            wp_send_json_error('Failed to generate new keys');
        }
    }
    add_action('wp_ajax_kotlinskidev_get_wp_config_constants', 'kotlinskidev_ajax_get_wp_config_constants');
}

if (!function_exists('kotlinskidev_set_nocache_headers')) {
    /**
     * Set no-cache headers for AJAX requests to prevent nonce issues
     */
    function kotlinskidev_set_nocache_headers() {
        if (!headers_sent()) {
            header('Cache-Control: no-cache, no-store, must-revalidate');
            header('Pragma: no-cache');
            header('Expires: 0');
        }
    }
}

if (!function_exists('kotlinskidev_get_fresh_nonce')) {
    /**
     * AJAX endpoint to get a fresh nonce for protection requests
     */
    function kotlinskidev_get_fresh_nonce() {
        kotlinskidev_set_nocache_headers();
        
        wp_send_json_success(array(
            'nonce' => wp_create_nonce('kotlinskidev_protection_nonce')
        ));
    }
    add_action('wp_ajax_kotlinskidev_get_fresh_nonce', 'kotlinskidev_get_fresh_nonce');
    add_action('wp_ajax_nopriv_kotlinskidev_get_fresh_nonce', 'kotlinskidev_get_fresh_nonce');
}
