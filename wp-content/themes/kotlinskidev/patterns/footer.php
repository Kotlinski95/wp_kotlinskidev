<?php

/**
 * Title: Footer
 * Slug: kotlinskidev/footer
 * Categories: footer, kotlinskidev/footer, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/kotlinskidev-logo.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/footer","name":"Footer"},"tagName":"footer","className":"kotlinskidev-footer","layout":{"type":"constrained","contentSize":"1180px"}} -->
<footer class="wp-block-group kotlinskidev-footer">
    <!-- wp:group {"style":{"spacing":{"padding":{"right":"var:preset|spacing|40","left":"var:preset|spacing|40","top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}},"layout":{"type":"constrained","contentSize":"1180px"}} -->
    <div class="wp-block-group" style="padding-right:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40);padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80);">
        <!-- wp:columns {"style":{"spacing":{"margin":{"top":"0px"}}}} -->
        <div class="wp-block-columns" style="margin-top:0px">
            <!-- wp:column {"width":"40%"} -->
            <div class="wp-block-column" style="flex-basis:40%">
                <!-- wp:group {"layout":{"type":"constrained","contentSize":"380px","justifyContent":"left"}} -->
                <div class="wp-block-group">
                    <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"className":"kotlinskidev-logo","layout":{"type":"flex","flexWrap":"nowrap"}} -->
                    <div class="wp-block-group kotlinskidev-logo"><!-- wp:image {"id":8815,"width":"200px","height":"200px","scale":"contain","sizeSlug":"full","linkDestination":"none"} -->
                        <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" class="wp-image-8815" style="object-fit:contain;width:200px;height:200px" /></figure>
                        <!-- /wp:image -->
                    </div>
                    <!-- /wp:group -->

                    <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                    <p><?php esc_html_e(
                            'Footer description',
                            'kotlinskidev'
                        ); ?></p>
                    <!-- /wp:paragraph -->

                    <!-- wp:social-links {"iconColor":"foreground-alt-color","iconColorValue":"foreground-alt","className":"is-style-logos-only","style":{"spacing":{"blockGap":{"top":"0","left":"var:preset|spacing|40"},"margin":{"bottom":"0"}}}} -->
                    <ul class="wp-block-social-links has-icon-color is-style-logos-only" style="margin-bottom:0"><!-- wp:social-link {"url":"#","service":"instagram"} /-->

                        <!-- wp:social-link {"url":"#","service":"facebook"} /-->

                        <!-- wp:social-link {"url":"#","service":"linkedin"} /-->

                        <!-- wp:social-link {"url":"#","service":"vk"} /-->

                        <!-- wp:social-link {"url":"#","service":"x"} /-->

                        <!-- wp:social-link {"url":"#","service":"youtube"} /-->
                    </ul>
                    <!-- /wp:social-links -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"className":"kotlinskidev-footer-list"} -->
            <div class="wp-block-column kotlinskidev-footer-list">
                <!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"medium"} -->
                <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-medium-font-size" style="font-style:normal;font-weight:600;text-transform:none"><?php esc_html_e(
                                                                                                                                                                                            'Quick Links',
                                                                                                                                                                                            'kotlinskidev'
                                                                                                                                                                                        ); ?></h3>
                <!-- /wp:heading -->

                <!-- wp:list {"className":"is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet","style":{"spacing":{"padding":{"top":"0","right":"0","bottom":"0","left":"0"}},"typography":{"lineHeight":"2.5","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"},":hover":{"color":{"text":"var:preset|color|primary"}}}}},"fontSize":"small"} -->
                <ul style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;line-height:2.5;text-transform:none" class="wp-block-list is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet has-link-color has-small-font-size">
                    <!-- wp:list-item -->
                    <li><a href="<?php echo esc_url(home_url('/about/')); ?>"><?php esc_html_e('About Us', 'kotlinskidev'); ?></a></li>
                    <!-- /wp:list-item -->


                    <!-- wp:list-item -->
                    <li><a href="<?php echo esc_url(home_url('/privacy-policy/')); ?>"><?php esc_html_e(
                                                                                            'Policy',
                                                                                            'kotlinskidev'
                                                                                        ); ?></a></li>
                    <!-- /wp:list-item -->

                    <!-- wp:list-item -->
                    <li><a href="<?php echo esc_url(home_url('/terms-and-conditions/')); ?>"><?php esc_html_e(
                                                                                                    'Terms and Conditions',
                                                                                                    'kotlinskidev'
                                                                                                ); ?></a></li>
                    <!-- /wp:list-item -->

                    <!-- wp:list-item -->
                    <li><a href="<?php echo esc_url(home_url('/career/')); ?>"><?php esc_html_e(
                                                                                    'Career',
                                                                                    'kotlinskidev'
                                                                                ); ?></a></li>
                    <!-- /wp:list-item -->

                    <!-- wp:list-item -->
                    <li><a href="<?php echo esc_url(home_url('/blog/')); ?>"><?php esc_html_e(
                                                                                    'Blog',
                                                                                    'kotlinskidev'
                                                                                ); ?></a></li>
                    <!-- /wp:list-item -->

                    <!-- wp:list-item -->
                    <li><a href="<?php echo esc_url(home_url('/contact/')); ?>"><?php esc_html_e(
                                                                                    'Contact me',
                                                                                    'kotlinskidev'
                                                                                ); ?></a></li>
                    <!-- /wp:list-item -->

                    <!-- wp:list-item -->
                    <li><a href="<?php echo esc_url(home_url('/faq/')); ?>"><?php esc_html_e(
                                                                                'FAQ',
                                                                                'kotlinskidev'
                                                                            ); ?></a></li>
                    <!-- /wp:list-item -->
                </ul>
                <!-- /wp:list -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"className":"kotlinskidev-footer-list"} -->
            <div class="wp-block-column kotlinskidev-footer-list">
                <!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"medium"} -->
                <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-medium-font-size" style="font-style:normal;font-weight:600;text-transform:none"><?php esc_html_e(
                                                                                                                                                                                            'Services',
                                                                                                                                                                                            'kotlinskidev'
                                                                                                                                                                                        ); ?></h3>
                <!-- /wp:heading -->

                <!-- wp:list {"className":"is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet","style":{"spacing":{"padding":{"top":"0","right":"0","bottom":"0","left":"0"}},"typography":{"lineHeight":"2.5","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"},":hover":{"color":{"text":"var:preset|color|primary"}}}}},"fontSize":"small"} -->
                <ul style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;line-height:2.5;text-transform:none" class="wp-block-list is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet has-link-color has-small-font-size">
                    <!-- wp:list-item -->
                    <li><a href="<?php echo esc_url(home_url('/web-development/')); ?>"><?php esc_html_e(
                                                                                            'Web development',
                                                                                            'kotlinskidev'
                                                                                        ); ?></a></li>
                    <!-- /wp:list-item -->

                    <!-- wp:list-item -->
                    <li><a href="<?php echo esc_url(home_url('/web-optimization/')); ?>"><?php esc_html_e(
                                                                                                'Website optimization',
                                                                                                'kotlinskidev'
                                                                                            ); ?></a></li>
                    <!-- /wp:list-item -->

                    <!-- wp:list-item -->
                    <li><a href="<?php echo esc_url(home_url('/web-performance/')); ?>"><?php esc_html_e(
                                                                                            'Website performance',
                                                                                            'kotlinskidev'
                                                                                        ); ?></a></li>
                    <!-- /wp:list-item -->

                    <!-- wp:list-item -->
                    <li><a href="<?php echo esc_url(home_url('/e-commerce/')); ?>"><?php esc_html_e(
                                                                                        'E-commerce',
                                                                                        'kotlinskidev'
                                                                                    ); ?></a></li>
                    <!-- /wp:list-item -->
                </ul>
                <!-- /wp:list -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"width":"","className":"kotlinskidev-footer-list"} -->
            <div class="wp-block-column kotlinskidev-footer-list">


                <!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"medium"} -->
                <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-medium-font-size" style="font-style:normal;font-weight:600;text-transform:none"><?php esc_html_e(
                                                                                                                                                                                            'Contact me',
                                                                                                                                                                                            'kotlinskidev'
                                                                                                                                                                                        ); ?></h3>
                <!-- /wp:heading -->

                <!-- wp:group {"className":"kotlinskidev-footer-list","style":{"spacing":{"blockGap":"var:preset|spacing|40","margin":{"top":"0","bottom":"0"},"padding":{"left":"0px","top":"0px"}}},"layout":{"type":"flex","orientation":"vertical"}} -->
                <div class="wp-block-group kotlinskidev-footer-list" style="margin-top:0;margin-bottom:0;padding-top:0px;padding-left:0px">
                    <!-- wp:list {"className":"is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet","style":{"spacing":{"padding":{"top":"0","right":"0","bottom":"0","left":"0"}},"typography":{"lineHeight":"2.5","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"},":hover":{"color":{"text":"var:preset|color|primary"}}}}},"fontSize":"small"} -->
                    <ul style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;line-height:2.5;text-transform:none" class="wp-block-list is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet has-link-color has-small-font-size">
                        <!-- wp:list-item {"fontSize":"small"} -->
                        <li class="has-small-font-size"><a href="<?php echo esc_url('https://maps.app.goo.gl/WaB16BznSwfbX1LN8'); ?>" target="_blank"><?php esc_html_e(
                                                                                                                                                            'Contact address',
                                                                                                                                                            'kotlinskidev'
                                                                                                                                                        ); ?></a></li>
                        <!-- /wp:list-item -->
                    </ul>
                    <!-- /wp:list -->

                    <!-- wp:list {"className":"is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet","style":{"spacing":{"padding":{"top":"0","right":"0","bottom":"0","left":"0"}},"typography":{"lineHeight":"2.5","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"},":hover":{"color":{"text":"var:preset|color|primary"}}}}},"fontSize":"small"} -->
                    <ul style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;line-height:2.5;text-transform:none" class="wp-block-list is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet has-link-color has-small-font-size">
                        <!-- wp:list-item {"fontSize":"small"} -->
                        <li class="has-small-font-size"><?php esc_html_e(
                                                            'Contact hours',
                                                            'kotlinskidev'
                                                        ); ?></li>
                        <!-- /wp:list-item -->
                    </ul>
                    <!-- /wp:list -->

                    <!-- wp:list {"className":"is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet","style":{"spacing":{"padding":{"top":"0","right":"0","bottom":"0","left":"0"}},"typography":{"lineHeight":"2.5","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"},":hover":{"color":{"text":"var:preset|color|primary"}}}}},"fontSize":"small"} -->
                    <ul style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;line-height:2.5;text-transform:none" class="wp-block-list is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet has-link-color has-small-font-size">
                        <!-- wp:list-item {"fontSize":"small"} -->
                        <li class="has-small-font-size"><a href="<?php echo esc_url('mailto:kotlinskidev@gmail.com'); ?>"><?php esc_html_e(
                                                                                                                                'Contact email',
                                                                                                                                'kotlinskidev'
                                                                                                                            ); ?></a></li>
                        <!-- /wp:list-item -->
                    </ul>
                    <!-- /wp:list -->

                    <!-- wp:list {"className":"is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet","style":{"spacing":{"padding":{"top":"0","right":"0","bottom":"0","left":"0"}},"typography":{"lineHeight":"2.5","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"},":hover":{"color":{"text":"var:preset|color|primary"}}}}},"fontSize":"small"} -->
                    <ul style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;line-height:2.5;text-transform:none" class="wp-block-list is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet has-link-color has-small-font-size">
                        <!-- wp:list-item {"fontSize":"small"} -->
                        <li class="has-small-font-size"><a href="<?php echo esc_url('tel:608418911'); ?>"><?php esc_html_e(
                                                                                                                'Contact phone',
                                                                                                                'kotlinskidev'
                                                                                                            ); ?></a></li>
                        <!-- /wp:list-item -->
                    </ul>
                    <!-- /wp:list -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->

    <!-- wp:group {"style":{"spacing":{"padding":{"right":"var:preset|spacing|0","left":"var:preset|spacing|0","top":"2px","bottom":"2px"},"margin":{"top":"0","bottom":"0"}},"border":{"top":{"color":"var:preset|color|border-color","width":"1px"}}},"layout":{"type":"constrained","contentSize":"1180px"}} -->
    <div class="wp-block-group" style="padding-right:var(--wp--preset--spacing--0);padding-left:var(--wp--preset--spacing--0);padding-top:2px;padding-bottom:2px;margin-top:0;margin-bottom:0;border-top-color:var(--wp--preset--color--border-color);border-top-width:1px;">
    </div>
    <!-- /wp:group -->

    <!-- wp:shortcode -->
    [copyrights_shortcode_here]
    <!-- /wp:shortcode -->

    <!-- wp:column {"verticalAlignment":"top","width":"100%"} -->
    <div class="wp-block-column is-vertically-aligned-top" style="flex-basis:100%">
        <!-- wp:shortcode -->
        [scroll_to_top_shortcode_here]
        <!-- /wp:shortcode -->
    </div>
    <!-- /wp:column -->
</footer>
<!-- /wp:group -->