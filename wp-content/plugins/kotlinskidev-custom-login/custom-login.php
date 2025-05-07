<?php
/*
Plugin Name: KotlinskiDev Login Page
Description: Customize the WordPress login page background.
Version: 1.0
Author: Adrian Kotlinski
*/

function custom_login_page_styles() {
    echo '<style type="text/css">
        body.login {
            background-color: #000;
            background-image: url("' . plugin_dir_url(__FILE__) . 'kotlinskidev-background.webp");
            background-size: cover;
            background-position: center;
        }
    </style>';
}
add_action('login_head', 'custom_login_page_styles');

function custom_login_logo() {
    echo '<style type="text/css">
        .login h1 a {
            background-image: url("' . plugin_dir_url(__FILE__) . 'kotlinskidev-logo.webp");
            background-size: contain;
            width: 100%;
            min-height: 200px;
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
        .login #nav a,
        .login #backtoblog a,
        #language-switcher{
            color: #fff;
        }
        
        .login #nav a:hover,
        .login #backtoblog a:hover,
        #language-switcher:hover{
            color: #fd0d0d;
        }
    </style>';
}
add_action('login_head', 'custom_login_input_styles');