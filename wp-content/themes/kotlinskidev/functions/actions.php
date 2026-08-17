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
}, 1); // Priority 1 to load as early as possibleS

add_action('wp_head', function () {
?>
    <link rel="preload" as="font" type="font/woff2" href="<?php echo esc_url(get_theme_file_uri('assets/fonts/sora/Sora-VariableFont_wght.woff2')); ?>" crossorigin>
    <link rel="preconnect" href="https://kotlinskidev.com" crossorigin>

<?php
}, 1);
// use this if need to skip the core block styles .css generation in body.
// add_action('wp_footer', function () {
//     wp_dequeue_style('core-block-supports');
// });

// Remove all viewport meta tags except our custom one using output buffering
add_action('template_redirect', function() {
    ob_start(function($buffer) {
        // Remove all viewport meta tags
        $buffer = preg_replace('/<meta[^>]+name=["\']viewport["\'][^>]*>/i', '', $buffer);
        // Add our custom viewport meta tag just after <head>
        $buffer = preg_replace('/<head[^>]*>/', '$0<meta name="viewport" content="height=device-height, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=3.0, viewport-fit=cover, target-densitydpi=device-dpi">', $buffer, 1);
        return $buffer;
    });
});
