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

        /* Social media icons */
        .social-menu-items a[href*="facebook.com"] {
            background-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/facebook.svg');
            /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/facebook.svg');
            -webkit-mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/facebook.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
        }

        .social-menu-items a[href*="linkedin.com"] {
            background-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/linkedin.svg');
                        /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/linkedin.svg');
            -webkit-mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/linkedin.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
        }

        .social-menu-items a[href*="twitter.com"],
        .social-menu-items a[href*="x.com"] {
            background-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/x.svg');
                        /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/x.svg');
            -webkit-mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/x.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
        }

        .social-menu-items a[href*="youtube.com"] {
            background-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/youtube.svg');
                        /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/youtube.svg');
            -webkit-mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/youtube.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
        }

        .social-menu-items a[href*="tiktok.com"] {
            background-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/tiktok.svg');
                        /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/tiktok.svg');
            -webkit-mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/tiktok.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
        }

        .social-menu-items a[href*="instagram.com"] {
            background-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/instagram.svg');
                        /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/instagram.svg');
            -webkit-mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/instagram.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
        }

        .social-menu-items a[href*="github.com"] {
            background-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/github.svg');
                        /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/github.svg');
            -webkit-mask-image: url('<?php echo get_template_directory_uri(); ?>/assets/icons/github.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
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
