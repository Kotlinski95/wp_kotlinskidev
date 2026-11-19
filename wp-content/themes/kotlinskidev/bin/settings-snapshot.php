<?php
wp_set_current_user(1);
require_once ABSPATH . 'wp-admin/includes/admin.php';
do_action('admin_init');
$dir = WP_CONTENT_DIR . '/themes/kotlinskidev/artifacts/' . getenv('SNAPSHOT_NAME');
@mkdir($dir, 0777, true);
foreach (array_keys(kotlinskidev_settings_tabs()) as $tab) {
    $_GET['tab'] = $tab;
    ob_start();
    kotlinskidev_render_settings_page();
    $html = ob_get_clean();
    $html = preg_replace(['/\s+/', '/value="[0-9a-f]{10}"/'], [' ', 'value="NONCE"'], $html);
    file_put_contents("$dir/$tab.html", $html);
}
echo count(glob("$dir/*.html")) . " files\n";
