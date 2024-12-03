<?php
// Add Maintenance Mode option to WordPress admin
function add_maintenance_mode_settings() {
    add_options_page(
        'Maintenance Mode Settings', 
        'Maintenance Mode', 
        'manage_options', 
        'maintenance-mode', 
        'maintenance_mode_settings_page'
    );
}
add_action('admin_menu', 'add_maintenance_mode_settings');

// Display the settings page
function maintenance_mode_settings_page() {
    ?>
    <div class="wrap">
        <h1><?php _e('Maintenance Mode Settings', 'your-theme'); ?></h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('maintenance_mode_options');
            do_settings_sections('maintenance-mode');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

// Register and define the settings
function setup_maintenance_mode_settings() {
    register_setting('maintenance_mode_options', 'maintenance_mode_enabled');
    add_settings_section(
        'maintenance_mode_main',
        'General Settings',
        null,
        'maintenance-mode'
    );
    add_settings_field(
        'maintenance_mode_enabled',
        'Enable Maintenance Mode',
        'maintenance_mode_enabled_field',
        'maintenance-mode',
        'maintenance_mode_main'
    );
}
add_action('admin_init', 'setup_maintenance_mode_settings');

// Create the settings field
function maintenance_mode_enabled_field() {
    $checked = get_option('maintenance_mode_enabled', false) ? 'checked' : '';
    echo '<input type="checkbox" name="maintenance_mode_enabled" value="1" ' . $checked . '> Enable Maintenance Mode';
}
?>