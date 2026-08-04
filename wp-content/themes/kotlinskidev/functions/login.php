<?php
function kotlinskidev_custom_login_page_styles(): void
{
    if (!get_option('kotlinskidev_login_enable_custom', true)) {
        return;
    }

    $bg_image = get_option('kotlinskidev_login_bg_image', '') ?: kotlinskidev_login_default_bg_image();
    $bg_color = get_option('kotlinskidev_login_bg_color', '#191919');

    echo '<style type="text/css">
        body.login {
            background-color: ' . esc_attr($bg_color) . ';
            background-image: url("' . esc_url($bg_image) . '");
            background-size: cover;
            background-position: center;
        }
    </style>';
}
add_action('login_head', 'kotlinskidev_custom_login_page_styles');

function kotlinskidev_custom_login_logo(): void
{
    if (!get_option('kotlinskidev_login_enable_custom', true)) {
        return;
    }

    $logo_image = get_option('kotlinskidev_login_logo_image', '') ?: kotlinskidev_login_default_logo_image();

    echo '<style type="text/css">
        .login h1 a {
            background-image: url("' . esc_url($logo_image) . '");
            background-size: contain;
            width: 100%;
            min-height: 12.5rem;
        }
    </style>';
}
add_action('login_head', 'kotlinskidev_custom_login_logo');

function kotlinskidev_custom_login_input_styles(): void
{
    if (!get_option('kotlinskidev_login_enable_custom', true)) {
        return;
    }

    $accent_color = get_option('kotlinskidev_login_accent_color', '#8209d3');

    echo '<style type="text/css">
        .login input[type="text"], .login input[type="password"] {
            background-color: #f7f7f7;
            border: 0.0625rem solid #ccc;
            padding: 0.625rem;
        }
        .login #nav a,
        .login #backtoblog a,
        #language-switcher {
            color: #fff;
        }
        .login #nav a:hover,
        .login #backtoblog a:hover,
        #language-switcher:hover {
            color: ' . esc_attr($accent_color) . ';
        }
    </style>';
}
add_action('login_head', 'kotlinskidev_custom_login_input_styles');
