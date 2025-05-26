<?php
/**
 * Plugin Name: Contact Form TS
 * Description: A customizable contact form block for WordPress with TypeScript support.
 * Version: 1.0.0
 * Author: Adrian Kotlinski
 * Text Domain: contact-form-ts
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// Enqueue scripts and styles.
require_once plugin_dir_path( __FILE__ ) . 'includes/enqueue-scripts.php';

// Register the block.
require_once plugin_dir_path( __FILE__ ) . 'includes/register-block.php';

// Handle form submissions.
require_once plugin_dir_path( __FILE__ ) . 'includes/form-handler.php';
