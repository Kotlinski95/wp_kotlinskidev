<?php
add_action('wp_head', function () {
?>
    <style>
        body .is-layout-flex {
            display: flex;
        }

        /* contact page above fold inlinestyles */
        .contact-above-fold h2{
            font-size: var(--wp--preset--font-size--xx-large);
            line-height: 1.6;
        }

        .contact-above-fold h2 ~ p{
            font-size: var(--wp--preset--font-size--normal);
            line-height: 1.6;
        }
    </style>
<?php
}, 1);

add_action('wp_head', function () {
?>
    <link rel="preload" as="font" type="font/woff2" href="<?php echo esc_url(get_theme_file_uri('assets/fonts/sora/Sora-VariableFont_wght.woff2')); ?>" crossorigin>

<?php
}, 1);

function kotlinskidev_replace_viewport_meta_tags($buffer) {
    $buffer = preg_replace('/<meta[^>]+name=["\']viewport["\'][^>]*>/i', '', $buffer);
    $buffer = preg_replace('/<head[^>]*>/', '$0<meta name="viewport" content="height=device-height, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=3.0, viewport-fit=cover">', $buffer, 1);
    return $buffer;
}

function kotlinskidev_buffer_viewport_meta_replacement() {
    ob_start('kotlinskidev_replace_viewport_meta_tags');
}
add_action('template_redirect', 'kotlinskidev_buffer_viewport_meta_replacement');
