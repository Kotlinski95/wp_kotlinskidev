<?php
function maintenance_mode_enabled_field()
{
    $checked = get_option('maintenance_mode_enabled', false) ? 'checked' : '';
    echo '<input type="checkbox" name="maintenance_mode_enabled" value="1" ' .
        esc_attr($checked) .
        '> Enable Maintenance Mode';
}

function maintenance_mode_customization_section_callback()
{
    echo '<p>Customize the appearance and content of your maintenance page.</p>';
}

function maintenance_mode_background_image_field()
{
    $image_url = get_option('maintenance_mode_background_image', 'https://kotlinskidev.wordifysites.com/wp-content/uploads/2024/09/kotlinskidev-coming-soon-compressed.webp');
?>
    <div style="margin-bottom: 0.625rem;">
        <input type="url" id="maintenance_mode_background_image" name="maintenance_mode_background_image" value="<?php echo esc_attr($image_url); ?>" style="width: 100%; max-width: 25rem;" placeholder="Enter background image URL or use media library">
    </div>
    <div style="margin-bottom: 0.625rem;">
        <button type="button" id="maintenance_background_upload_button" class="button">📁 Choose from Media Library</button>
        <button type="button" id="maintenance_background_clear_button" class="button">🗑️ Clear Image</button>
    </div>
    <div id="maintenance_background_preview" style="margin-top: 0.625rem;">
        <?php if ($image_url): ?>
            <img src="<?php echo esc_url($image_url); ?>" style="max-width: 12.5rem; height: auto; border: 0.0625rem solid #ddd; padding: 0.3125rem;">
        <?php endif; ?>
    </div>
    <p class="description">Upload a background image using the media library or enter a URL directly.</p>
<?php
}

function maintenance_mode_logo_field()
{
    $logo_url = get_option('maintenance_mode_logo', 'https://kotlinskidev.wordifysites.com/wp-content/uploads/2024/09/Kotlinskidev-transparent.webp');
?>
    <div style="margin-bottom: 0.625rem;">
        <input type="url" id="maintenance_mode_logo" name="maintenance_mode_logo" value="<?php echo esc_attr($logo_url); ?>" style="width: 100%; max-width: 25rem;" placeholder="Enter logo URL or use media library">
    </div>
    <div style="margin-bottom: 0.625rem;">
        <button type="button" id="maintenance_logo_upload_button" class="button">📁 Choose from Media Library</button>
        <button type="button" id="maintenance_logo_clear_button" class="button">🗑️ Clear Image</button>
    </div>
    <div id="maintenance_logo_preview" style="margin-top: 0.625rem;">
        <?php if ($logo_url): ?>
            <img src="<?php echo esc_url($logo_url); ?>" style="max-width: 9.375rem; height: auto; border: 0.0625rem solid #ddd; padding: 0.3125rem;">
        <?php endif; ?>
    </div>
    <p class="description">Upload a logo using the media library or enter a URL directly.</p>
<?php
}

function maintenance_mode_contact_email_field()
{
    $email = get_option('maintenance_mode_contact_email', 'kotlinskidev@gmail.com');
    echo '<input type="email" name="maintenance_mode_contact_email" value="' . esc_attr($email) . '" style="width: 100%; max-width: 31.25rem;" placeholder="Enter contact email">';
    echo '<br><small>The email address for the contact button.</small>';
}

function maintenance_mode_language_switcher_field()
{
    $show_switcher = get_option('maintenance_mode_show_language_switcher', true);
    $checked = $show_switcher ? 'checked' : '';

    echo '<input type="checkbox" name="maintenance_mode_show_language_switcher" value="1" ' . esc_attr($checked) . '> Show language switcher with flags';
    echo '<br><small>Display a language dropdown with flags on the maintenance page for visitors to switch languages.</small>';
}

function maintenance_mode_social_media_section_callback()
{
    echo '<p>Add links to your social media profiles. Leave empty to hide that social media icon.</p>';
}

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

    echo '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(18.75rem, 1fr)); gap: 0.9375rem; margin-bottom: 1.25rem;">';

    foreach ($social_media_platforms as $platform => $details) {
        $option_name = 'maintenance_mode_' . $platform . '_url';
        $value = get_option($option_name, '');

        echo '<div style="background: #f9f9f9; padding: 0.9375rem; border-radius: 0.5rem; border: 0.0625rem solid #ddd;">';
        echo '<label style="display: block; font-weight: bold; margin-bottom: 0.5rem;">';
        echo '<span style="margin-right: 0.5rem;">' . esc_html($details['icon']) . '</span>';
        echo esc_html($details['name']);
        echo '</label>';
        echo '<input type="url" name="' . esc_attr($option_name) . '" value="' . esc_attr($value) . '" style="width: 100%;" placeholder="Enter ' . esc_attr($details['name']) . ' URL">';
        echo '</div>';
    }

    echo '</div>';
    echo '<p class="description">Enter the full URL for each social media profile you want to display. Icons will only appear for platforms with URLs provided.</p>';
}
