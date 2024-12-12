<?php

/**
 * Title: Footer
 * Slug: kotlinskidev/footer
 * Categories: kotlinskidev, footer
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
?>
<!-- wp:group {"className":"kotlinskidev-footer","style":{"spacing":{"padding":{"top":"0px","right":"0","left":"0","bottom":"0px"},"margin":{"top":"0","bottom":"0"}},"border":{"width":"0px","style":"none"}},"gradient":"gradient-nine","layout":{"type":"constrained","contentSize":"100%"}} -->
<div class="wp-block-group kotlinskidev-footer has-gradient-nine-gradient-background has-background" style="border-style:none;border-width:0px;margin-top:0;margin-bottom:0;padding-top:0px;padding-right:0;padding-bottom:0px;padding-left:0"><!-- wp:group {"style":{"spacing":{"padding":{"right":"var:preset|spacing|40","left":"var:preset|spacing|40","top":"80px","bottom":"80px"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"1180px"}} -->
    <div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:20px;padding-right:0;padding-bottom:20px;padding-left:0"><!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"44px"},"margin":{"top":"0px"}}}} -->
        <div class="wp-block-columns" style="margin-block:0px"><!-- wp:column {"width":"40%"} -->
            <div class="wp-block-column" style="flex-basis:40%;margin-inline-end: 20px;"><!-- wp:group {"layout":{"type":"constrained","contentSize":"380px","justifyContent":"left"}} -->
                <div class="wp-block-group"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
                    <div class="wp-block-group"><!-- wp:image {"id":8817,"width":"40px","height":"40px","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
                        <figure class="wp-block-image" style="width: 50%;">
                            <?php
                            if (has_custom_logo()) {
                                the_custom_logo(); // Display the custom logo
                            } else {
                                // If no custom logo, display site title
                            ?>
                                <a href="<?php echo esc_url(home_url('/')); ?>">
                                    <h1><?php bloginfo('name'); ?></h1>
                                </a>
                            <?php
                            }
                            ?>
                        </figure>
                        <!-- /wp:image -->

                        <!-- wp:site-title {"level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"},":hover":{"color":{"text":"var:preset|color|primary"}}}},"typography":{"fontSize":"28px"}}} /-->
                    </div>
                    <!-- /wp:group -->

                    <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                    <p class="has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e(
                                                                                            'Footer description',
                                                                                            'kotlinskidev'
                                                                                        ); ?></p>
                    <!-- /wp:paragraph -->

                    <!-- wp:social-links {"iconColor":"light-color","iconColorValue":"#FFFFFE","className":"is-style-logos-only","style":{"spacing":{"blockGap":{"top":"0","left":"var:preset|spacing|40"},"margin":{"bottom":"0"}}}} -->
                    <ul class="wp-block-social-links has-icon-color is-style-logos-only" style="margin-bottom:0">
                        <!-- wp:social-link {"url":"#","service":"instagram"} /-->

                        <!-- wp:social-link {"url":"#","service":"facebook"} /-->

                        <!-- wp:social-link {"url":"#","service":"linkedin"} /-->

                        <!-- wp:social-link {"url":"#","service":"github"} /-->

                        <!-- wp:social-link {"url":"#","service":"youtube"} /-->
                    </ul>
                    <!-- /wp:social-links -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"className":"kotlinskidev-footer-list"} -->
            <div class="wp-block-column kotlinskidev-footer-list"><!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}},"textColor":"light-color","fontSize":"medium"} -->
                <h3 class="wp-block-heading has-light-color-color has-text-color has-link-color has-medium-font-size" style="font-style:normal;font-weight:600;text-transform:none;"><?php esc_html_e(
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
                </ul>
                <!-- /wp:list -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"className":"kotlinskidev-footer-list"} -->
            <div class="wp-block-column kotlinskidev-footer-list"><!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}},"textColor":"light-color","fontSize":"medium"} -->
                <h3 class="wp-block-heading has-light-color-color has-text-color has-link-color has-medium-font-size" style="font-style:normal;font-weight:600;text-transform:none"><?php esc_html_e(
                                                                                                                                                                                        'Services',
                                                                                                                                                                                        'kotlinskidev'
                                                                                                                                                                                    ); ?></h3>
                <!-- /wp:heading -->

                <!-- wp:list {"className":"is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet","style":{"spacing":{"padding":{"top":"0","right":"0","bottom":"0","left":"0"}},"typography":{"lineHeight":"2.5","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"},":hover":{"color":{"text":"var:preset|color|primary"}}}}},"fontSize":"small"} -->
                <ul style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;line-height:2.5;text-transform:none" class="wp-block-list is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet has-link-color has-small-font-size"><!-- wp:list-item -->
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
            <div class="wp-block-column kotlinskidev-footer-list"><!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}},"textColor":"light-color","fontSize":"medium"} -->
                <h3 class="wp-block-heading has-light-color-color has-text-color has-link-color has-medium-font-size" style="font-style:normal;font-weight:600;text-transform:none"><?php esc_html_e(
                                                                                                                                                                                        'Contact me',
                                                                                                                                                                                        'kotlinskidev'
                                                                                                                                                                                    ); ?></h3>
                <!-- /wp:heading -->

                <!-- wp:group {"className":"kotlinskidev-footer-list","style":{"spacing":{"blockGap":"var:preset|spacing|40","margin":{"top":"0","bottom":"0"},"padding":{"left":"0px","top":"0px"}}},"layout":{"type":"flex","orientation":"vertical"}} -->
                <div class="wp-block-group kotlinskidev-footer-list" style="margin-top:0;margin-bottom:0;padding-top:0px;padding-left:0px"><!-- wp:list {"className":"is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"0","bottom":"0","left":"0"}},"typography":{"lineHeight":"1.5","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"},":hover":{"color":{"text":"var:preset|color|primary"}}}}},"fontSize":"small"} -->
                    <ul style="padding-top:var(--wp--preset--spacing--50);padding-right:0;padding-bottom:0;padding-left:0;line-height:1.5;text-transform:none" class="wp-block-list is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet has-link-color has-small-font-size"><!-- wp:list-item {"fontSize":"small"} -->
                        <li class="has-small-font-size"><a href="<?php echo esc_url('https://maps.app.goo.gl/WaB16BznSwfbX1LN8'); ?>" target="_blank"><?php esc_html_e(
                                                                        'Contact address',
                                                                        'kotlinskidev'
                                                                    ); ?></a></li>
                        <!-- /wp:list-item -->
                    </ul>
                    <!-- /wp:list -->

                    <!-- wp:list {"className":"is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet","style":{"spacing":{"padding":{"top":"0","right":"0","bottom":"0","left":"0"}},"typography":{"lineHeight":"1.5","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"},":hover":{"color":{"text":"var:preset|color|primary"}}}}},"textColor":"foreground-alt","fontSize":"small"} -->
                    <ul style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;line-height:1.5;text-transform:none" class="wp-block-list is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet has-foreground-alt-color has-text-color has-link-color has-small-font-size"><!-- wp:list-item {"fontSize":"small"} -->
                        <li class="has-small-font-size"><?php esc_html_e(
                                                            'Contact hours',
                                                            'kotlinskidev'
                                                        ); ?></li>
                        <!-- /wp:list-item -->
                    </ul>
                    <!-- /wp:list -->

                    <!-- wp:list {"className":"is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet","style":{"spacing":{"padding":{"top":"0","right":"0","bottom":"0","left":"0"}},"typography":{"lineHeight":"1.5","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"},":hover":{"color":{"text":"var:preset|color|primary"}}}}},"fontSize":"small"} -->
                    <ul style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;line-height:1.5;text-transform:none" class="wp-block-list is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet has-link-color has-small-font-size"><!-- wp:list-item {"fontSize":"small"} -->
                        <li class="has-small-font-size"><a href="<?php echo esc_url('mailto:kotlinskidev@gmail.com'); ?>"><?php esc_html_e(
                                                                        'Contact email',
                                                                        'kotlinskidev'
                                                                    ); ?></a></li>
                        <!-- /wp:list-item -->
                    </ul>
                    <!-- /wp:list -->

                    <!-- wp:list {"className":"is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet","style":{"spacing":{"padding":{"top":"0","right":"0","bottom":"0","left":"0"}},"typography":{"lineHeight":"1.5","textTransform":"none"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"},":hover":{"color":{"text":"var:preset|color|primary"}}}}},"fontSize":"small"} -->
                    <ul style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;line-height:1.5;text-transform:none" class="wp-block-list is-style-hide-bullet-list-link-hover-style-white is-style-list-style-no-bullet has-link-color has-small-font-size"><!-- wp:list-item {"fontSize":"small"} -->
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

    <!-- wp:group {"style":{"spacing":{"padding":{"right":"var:preset|spacing|40","left":"var:preset|spacing|40","top":"32px","bottom":"32px"},"margin":{"top":"0","bottom":"0"}},"border":{"top":{"color":"var:preset|color|border-color","width":"1px"}}},"layout":{"type":"constrained","contentSize":"1180px"}} -->
    <div class="wp-block-group" style="border-top-color:var(--wp--preset--color--border-color);border-top-width:1px;margin-top:0;margin-bottom:0;padding-top:2px;padding-right:0;padding-bottom:2px;padding-left:0">
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->

<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}}} -->
<div class="wp-block-buttons" style="margin-top:0;margin-bottom:0"><!-- wp:button {"backgroundColor":"tertiary","textColor":"foregound-alt","className":"kotlinskidev-scrollto-top is-style-button-hover-secondary-bgcolor","style":{"border":{"radius":"50%"}}} -->
    <div class="wp-block-button kotlinskidev-scrollto-top is-style-button-hover-secondary-bgcolor">
        <a id="scroll-top-top" class="wp-block-button__link has-foregound-alt-color has-tertiary-background-color has-text-color has-background wp-element-button" style="border-radius:100%">
         <span class="icon-circle-up" style="font-size:2rem;"></span>   
        <span style="visibility: hidden;"><?php esc_html_e('Scroll to Top', 'kotlinskidev'); ?></span>
        </a>
    </div>
    <!-- /wp:button -->
</div>
<!-- /wp:buttons -->