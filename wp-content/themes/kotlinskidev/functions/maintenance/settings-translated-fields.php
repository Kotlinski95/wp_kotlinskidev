<?php
function maintenance_mode_heading_field()
{
    $heading = get_option('maintenance_mode_heading', 'Website under development!');

    if (function_exists('pll_languages_list')) {
        $languages = pll_languages_list();
        echo '<div style="margin-bottom: 0.9375rem;">';
        echo '<strong>Heading Translations:</strong><br>';
        echo '<small>Enter the heading text for each language. If left empty, the default will be used.</small>';
        echo '</div>';

        foreach ($languages as $lang) {
            $lang_name = strtoupper($lang);
            $heading_key = 'maintenance_mode_heading_' . $lang;
            $heading_value = get_option($heading_key, '');

            echo '<div style="margin-bottom: 0.625rem;">';
            echo '<label style="display: inline-block; width: 3.75rem; font-weight: bold;">' . esc_html($lang_name) . ':</label>';
            echo '<input type="text" name="' . esc_attr($heading_key) . '" value="' . esc_attr($heading_value) . '" style="width: calc(100% - 4.375rem); max-width: 26.875rem;" placeholder="Enter heading for ' . esc_attr($lang_name) . '">';
            echo '</div>';
        }

        echo '<div style="margin-top: 0.9375rem;">';
        echo '<strong>Default Heading (fallback):</strong><br>';
        echo '<input type="text" name="maintenance_mode_heading" value="' . esc_attr($heading) . '" style="width: 100%; max-width: 31.25rem;" placeholder="Enter default heading">';
        echo '<br><small>This will be used if no translation is available for a language.</small>';
        echo '</div>';
    } else {
        echo '<input type="text" name="maintenance_mode_heading" value="' . esc_attr($heading) . '" style="width: 100%; max-width: 31.25rem;" placeholder="Enter main heading">';
        echo '<br><small>The main heading text displayed on the maintenance page.</small>';
    }
}

function maintenance_mode_description_field()
{
    $description = get_option('maintenance_mode_description', 'Work is underway to complete this site. Those interested in contacting me are invited to use social media.');

    if (function_exists('pll_languages_list')) {
        $languages = pll_languages_list();
        echo '<div style="margin-bottom: 0.9375rem;">';
        echo '<strong>Description Translations:</strong><br>';
        echo '<small>Enter the description text for each language. If left empty, the default will be used.</small>';
        echo '</div>';

        foreach ($languages as $lang) {
            $lang_name = strtoupper($lang);
            $description_key = 'maintenance_mode_description_' . $lang;
            $description_value = get_option($description_key, '');

            echo '<div style="margin-bottom: 0.625rem;">';
            echo '<label style="display: inline-block; width: 3.75rem; font-weight: bold; vertical-align: top; margin-top: 0.3125rem;">' . esc_html($lang_name) . ':</label>';
            echo '<textarea name="' . esc_attr($description_key) . '" rows="3" style="width: calc(100% - 4.375rem); max-width: 26.875rem;" placeholder="Enter description for ' . esc_attr($lang_name) . '">' . esc_textarea($description_value) . '</textarea>';
            echo '</div>';
        }

        echo '<div style="margin-top: 0.9375rem;">';
        echo '<strong>Default Description (fallback):</strong><br>';
        echo '<textarea name="maintenance_mode_description" rows="4" style="width: 100%; max-width: 31.25rem;" placeholder="Enter default description">' . esc_textarea($description) . '</textarea>';
        echo '<br><small>This will be used if no translation is available for a language.</small>';
        echo '</div>';
    } else {
        echo '<textarea name="maintenance_mode_description" rows="4" style="width: 100%; max-width: 31.25rem;" placeholder="Enter description text">' . esc_textarea($description) . '</textarea>';
        echo '<br><small>The description text displayed below the heading.</small>';
    }
}

function maintenance_mode_contact_button_text_field()
{
    $button_text = get_option('maintenance_mode_contact_button_text', 'Contact');

    if (function_exists('pll_languages_list')) {
        $languages = pll_languages_list();
        echo '<div style="margin-bottom: 0.9375rem;">';
        echo '<strong>Button Text Translations:</strong><br>';
        echo '<small>Enter the contact button text for each language. If left empty, the default will be used.</small>';
        echo '</div>';

        foreach ($languages as $lang) {
            $lang_name = strtoupper($lang);
            $button_text_key = 'maintenance_mode_contact_button_text_' . $lang;
            $button_text_value = get_option($button_text_key, '');

            echo '<div style="margin-bottom: 0.625rem;">';
            echo '<label style="display: inline-block; width: 3.75rem; font-weight: bold;">' . esc_html($lang_name) . ':</label>';
            echo '<input type="text" name="' . esc_attr($button_text_key) . '" value="' . esc_attr($button_text_value) . '" style="width: calc(100% - 4.375rem); max-width: 26.875rem;" placeholder="Enter button text for ' . esc_attr($lang_name) . '">';
            echo '</div>';
        }

        echo '<div style="margin-top: 0.9375rem;">';
        echo '<strong>Default Button Text (fallback):</strong><br>';
        echo '<input type="text" name="maintenance_mode_contact_button_text" value="' . esc_attr($button_text) . '" style="width: 100%; max-width: 31.25rem;" placeholder="Enter default button text">';
        echo '<br><small>This will be used if no translation is available for a language.</small>';
        echo '</div>';
    } else {
        echo '<input type="text" name="maintenance_mode_contact_button_text" value="' . esc_attr($button_text) . '" style="width: 100%; max-width: 31.25rem;" placeholder="Enter button text">';
        echo '<br><small>The text displayed on the contact button.</small>';
    }
}
