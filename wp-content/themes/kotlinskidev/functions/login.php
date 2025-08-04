<?php
function custom_login_page_styles() {
    echo '<style type="text/css">
        body.login {
            background-color: #333; /* Change to your desired color */
            background-image: url("' . get_template_directory_uri() . '/assets/images/kotlinskidev-background.webp"); /* Replace with your image */
            background-size: cover;
            background-position: center;
        }
    </style>';
}
add_action('login_head', 'custom_login_page_styles');

function custom_login_logo() {
    echo '<style type="text/css">
        .login h1 a {
            background-image: url("' . get_template_directory_uri() . '/assets/images/kotlinskidev-logo.webp"); /* Replace with your logo path */
            background-size: contain;
            width: 100%;
        }
    </style>';
}
add_action('login_head', 'custom_login_logo');

function custom_login_input_styles() {
    echo '<style type="text/css">
        .login input[type="text"], .login input[type="password"] {
            background-color: #f7f7f7;
            border: 1px solid #ccc;
            padding: 10px;
        }
    </style>';
}
add_action('login_head', 'custom_login_input_styles');