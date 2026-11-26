<?php

if (!function_exists('kotlinskidev_get_copy_button_markup')) {
    function kotlinskidev_get_copy_button_markup($value)
    {
        return sprintf(
            '<button type="button" class="kt-copy-btn kt-tooltip" data-copy-value="%1$s" data-tooltip="%2$s" data-copy-label="%2$s" data-copied-label="%3$s" aria-label="%2$s"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>',
            esc_attr($value),
            esc_attr__('Copy to clipboard', 'kotlinskidev'),
            esc_attr__('Copied to clipboard', 'kotlinskidev')
        );
    }
}

if (!function_exists('kotlinskidev_format_decrypted_content')) {
    function kotlinskidev_format_decrypted_content($decrypted_content, $protection_type)
    {
        switch ($protection_type) {
            case 'email':
                return sprintf(
                    '<span class="kt-protected-value"><a href="mailto:%1$s">%2$s</a>%3$s</span>',
                    esc_attr($decrypted_content),
                    esc_html($decrypted_content),
                    kotlinskidev_get_copy_button_markup($decrypted_content)
                );
            case 'phone':
                $clean_phone = preg_replace('/[^+0-9]/', '', $decrypted_content);
                return sprintf(
                    '<span class="kt-protected-value"><a href="tel:%1$s">%2$s</a>%3$s</span>',
                    esc_attr($clean_phone),
                    esc_html($decrypted_content),
                    kotlinskidev_get_copy_button_markup($decrypted_content)
                );
            case 'address':
                return sprintf(
                    '<span class="kt-protected-value"><a href="%1$s" target="_blank" rel="noopener noreferrer">%2$s</a></span>',
                    esc_url('https://www.google.com/maps/search/?api=1&query=' . rawurlencode($decrypted_content)),
                    esc_html($decrypted_content)
                );
            case 'text':
            case 'other':
                return wp_kses_post($decrypted_content);
            default:
                return esc_html($decrypted_content);
        }
    }
}
