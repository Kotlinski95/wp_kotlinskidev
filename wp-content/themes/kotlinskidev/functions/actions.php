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

        /* Social media icons */
        .social-menu-items a[href*="facebook.com"] {
            background-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/facebook.svg');
            /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/facebook.svg');
            -webkit-mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/facebook.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
        }

        .social-menu-items a[href*="linkedin.com"] {
            background-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/linkedin.svg');
                        /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/linkedin.svg');
            -webkit-mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/linkedin.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
        }

        .social-menu-items a[href*="twitter.com"],
        .social-menu-items a[href*="x.com"] {
            background-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/x.svg');
                        /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/x.svg');
            -webkit-mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/x.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
        }

        .social-menu-items a[href*="youtube.com"] {
            background-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/youtube.svg');
                        /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/youtube.svg');
            -webkit-mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/youtube.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
        }

        .social-menu-items a[href*="tiktok.com"] {
            background-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/tiktok.svg');
                        /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/tiktok.svg');
            -webkit-mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/tiktok.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
        }

        .social-menu-items a[href*="instagram.com"] {
            background-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/instagram.svg');
                        /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/instagram.svg');
            -webkit-mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/instagram.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
        }

        .social-menu-items a[href*="github.com"] {
            background-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/github.svg');
                        /* To color the SVG based on text color, use mask or inline SVG. With background-image, you can't change SVG fill directly. 
               Alternative: Use mask-image and background-color for color inheritance. Example: */
            mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/github.svg');
            -webkit-mask-image: url('<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/github.svg');
            background-color: currentColor;
            color: inherit; /* fallback or set via CSS */
            background-image: none; /* remove background-image if using mask */
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
