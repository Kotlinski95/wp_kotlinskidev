<?php
function kotlinskidev_theme_switcher_shortcode()
{
    ob_start();
?>
    <button class="theme-switcher" tabindex="0" aria-label="Toggle light and dark theme">
        <input type="checkbox" name="check" id="theme-toggle">
        <label for="theme-toggle">
            <span class="wrapper">
                <span class="icon light" data-theme-icon="light">
                    <?php
                    $svg_path = get_template_directory() . '/assets/icons/light.svg';
                    if (file_exists($svg_path)) {
                        echo file_get_contents($svg_path); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static theme-bundled icon asset under version control, not user-uploaded content; unrelated to the media-upload SVG path in functions/svg-support.php
                    }
                    ?>
                </span>
                <span class="icon dark" data-theme-icon="dark">
                    <?php
                    $svg_path = get_template_directory() . '/assets/icons/dark.svg';
                    if (file_exists($svg_path)) {
                        echo file_get_contents($svg_path); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static theme-bundled icon asset under version control, not user-uploaded content; unrelated to the media-upload SVG path in functions/svg-support.php
                    }
                    ?>
                </span>
            </span>
        </label>
    </button>
<?php
    return ob_get_clean();
}
add_shortcode('theme_switcher', 'kotlinskidev_theme_switcher_shortcode');

function kotlinskidev_theme_switcher_config(): array {
    $mode = (string) get_option( 'kotlinskidev_theme_default_mode', 'auto' );
    if ( ! in_array( $mode, [ 'auto', 'light', 'dark' ], true ) ) {
        $mode = 'auto';
    }

    return [
        'enabled'     => (bool) get_option( 'kotlinskidev_theme_switching_enabled', true ),
        'defaultMode' => $mode,
    ];
}
