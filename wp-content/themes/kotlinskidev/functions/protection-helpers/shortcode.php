<?php

if (!function_exists('kotlinskidev_protection_shortcode')) {
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
