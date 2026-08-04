<?php
if (!function_exists('kotlinskidev_allow_gradient_var_css')) {
    function kotlinskidev_allow_gradient_var_css($allow_css, $css_test_string)
    {
        if ($allow_css) {
            return $allow_css;
        }

        if (preg_match('/[\\\&=}]|\/\*/', $css_test_string)) {
            return false;
        }

        $without_known_wrappers = preg_replace('/-gradient\(|rgba?\(|\)/', '', $css_test_string);

        return !preg_match('/[()]/', $without_known_wrappers);
    }
}
add_filter('safecss_filter_attr_allow_css', 'kotlinskidev_allow_gradient_var_css', 10, 2);
