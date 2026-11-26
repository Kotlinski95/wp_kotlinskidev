<?php

if (!function_exists('kotlinskidev_protect_email_links')) {
    function kotlinskidev_protect_email_links($dom, $xpath)
    {
        $emailLinks = $xpath->query('//a[starts-with(@href, "mailto:")]');
        foreach ($emailLinks as $link) {
            $href = $link->getAttribute('href');
            $email = trim(str_replace('mailto:', '', $href));
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $encrypted = kotlinskidev_encrypt_content($email);
                $protectedSpan = kotlinskidev_create_protected_span($dom, 'email', $encrypted);
                $link->parentNode->replaceChild($protectedSpan, $link);
            } else {
                error_log('Invalid email found: ' . $email);
            }
        }
    }
}

if (!function_exists('kotlinskidev_protect_phone_links')) {
    function kotlinskidev_protect_phone_links($dom, $xpath)
    {
        $phoneLinks = $xpath->query('//a[starts-with(@href, "tel:")]');
        foreach ($phoneLinks as $link) {
            $phone = $link->textContent;
            $encrypted = kotlinskidev_encrypt_content($phone);
            $protectedSpan = kotlinskidev_create_protected_span($dom, 'phone', $encrypted);
            $link->parentNode->replaceChild($protectedSpan, $link);
        }
    }
}

if (!function_exists('kotlinskidev_protect_emails_in_dom')) {
    function kotlinskidev_protect_emails_in_dom($dom, $xpath)
    {
        kotlinskidev_protect_email_links($dom, $xpath);

        $email_pattern = '/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/';
        kotlinskidev_protect_text_nodes_matching($dom, $xpath, $email_pattern, 'email');
    }
}

if (!function_exists('kotlinskidev_protect_phones_in_dom')) {
    function kotlinskidev_protect_phones_in_dom($dom, $xpath)
    {
        kotlinskidev_protect_phone_links($dom, $xpath);

        $phone_pattern = '/\b(?:\+?48[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{3}|\(?[0-9]{2}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{2}[-.\s]?[0-9]{2})\b/';
        kotlinskidev_protect_text_nodes_matching($dom, $xpath, $phone_pattern, 'phone');
    }
}

if (!function_exists('kotlinskidev_add_protection_to_content')) {
    function kotlinskidev_add_protection_to_content($content)
    {
        if (is_admin()) {
            return $content;
        }

        $auto_protect_emails = get_option('kotlinskidev_auto_protect_emails', false);
        $auto_protect_phones = get_option('kotlinskidev_auto_protect_phones', false);

        if (!$auto_protect_emails && !$auto_protect_phones) {
            return $content;
        }

        $dom = kotlinskidev_load_protection_dom($content);
        $xpath = new DOMXPath($dom);

        if ($auto_protect_emails) {
            kotlinskidev_protect_emails_in_dom($dom, $xpath);
        }

        if ($auto_protect_phones) {
            kotlinskidev_protect_phones_in_dom($dom, $xpath);
        }

        return kotlinskidev_serialize_protection_dom($dom);
    }
}

if (!function_exists('kotlinskidev_maybe_add_auto_protection')) {
    function kotlinskidev_maybe_add_auto_protection()
    {
        $auto_protect_emails = get_option('kotlinskidev_auto_protect_emails', false);
        $auto_protect_phones = get_option('kotlinskidev_auto_protect_phones', false);

        if ($auto_protect_emails || $auto_protect_phones) {
            add_filter('the_content', 'kotlinskidev_add_protection_to_content');

            add_filter('widget_text', 'kotlinskidev_add_protection_to_content');
            add_filter('widget_custom_html', 'kotlinskidev_add_protection_to_content');

            add_filter('wp_nav_menu', 'kotlinskidev_add_protection_to_content');
            add_filter('render_block_kotlinskidev/navigation', 'kotlinskidev_add_protection_to_content');

            add_filter('kotlinskidev_protect_content', 'kotlinskidev_add_protection_to_content');

            add_filter('widget_text_content', 'kotlinskidev_add_protection_to_content');
        }
    }
    add_action('init', 'kotlinskidev_maybe_add_auto_protection');
}

if (!function_exists('kotlinskidev_protect_output')) {
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
