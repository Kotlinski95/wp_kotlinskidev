<?php
add_action('wp_head', function () {
?>
    <style>
        body .is-layout-flex {
            display: flex;
        }

        /* contact page above fold inlinestyles */
        .contact-above-fold [class*="wp-container-core-group-is-layout"] {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--wp--preset--spacing--20);
        }

        .contact-above-fold h2{
            font-size: var(--wp--preset--font-size--xx-large);
            line-height: 1.6;
        }

        .contact-above-fold h2 ~ p{
            font-size: var(--wp--preset--font-size--normal);
            line-height: 1.6;
        }
        .contact-above-fold .wp-block-column.is-vertically-aligned-top {
            align-self: flex-start;
        }
    </style>
<?php
}, 1); // Priority 1 to load as early as possibleS

add_action('wp_head', function () {
?>
    <link rel="preload" as="font" type="font/ttf" href="<?php echo get_theme_file_uri('assets/fonts/sora/Sora-VariableFont_wght.ttf'); ?>" crossorigin>
<?php
}, 1);

// use this if need to skip the core block styles .css generation in body.
// add_action('wp_footer', function () {
//     wp_dequeue_style('core-block-supports');
// });
