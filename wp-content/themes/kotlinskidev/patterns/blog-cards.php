<?php
/**
 * Title: Blog Cards Grid
 * Slug: kotlinskidev/blog-cards
 * Categories: blog, kotlinskidev/blog, themeslug/custom
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"20px","bottom":"60px","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1180px"}} -->
<div class="wp-block-group" style="padding-top:20px;padding-right:var(--wp--preset--spacing--40);padding-bottom:60px;padding-left:var(--wp--preset--spacing--40)">
    
    <!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontStyle":"normal","fontWeight":"800"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
    <h2 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size" style="font-style:normal;font-weight:800"><?php esc_html_e('Latest Articles', 'kotlinskidev') ?></h2>
    <!-- /wp:heading -->
    
    <!-- wp:query {"queryId":5,"query":{"perPage":"6","pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","exclude":[],"sticky":"","inherit":false},"layout":{"type":"constrained"}} -->
    <div class="wp-block-query">
        <!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"30px","bottom":"30px","left":"30px","right":"30px"},"margin":{"bottom":"30px"}},"border":{"radius":"16px","width":"1px"}},"borderColor":"border-color","backgroundColor":"light-shade","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:1px;border-radius:16px;margin-bottom:30px;padding-top:30px;padding-right:30px;padding-bottom:30px;padding-left:30px">
                
                <!-- wp:post-featured-image {"isLink":true,"style":{"border":{"radius":"12px"},"spacing":{"margin":{"bottom":"15px"}}}} /-->
                
                <!-- wp:group {"style":{"spacing":{"margin":{"bottom":"10px"}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
                <div class="wp-block-group" style="margin-bottom:10px">
                    <!-- wp:post-date {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} /-->
                    <!-- wp:post-terms {"term":"category","style":{"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} /-->
                </div>
                <!-- /wp:group -->
                
                <!-- wp:post-title {"level":3,"isLink":true,"style":{"spacing":{"margin":{"bottom":"10px"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"large"} /-->
                
                <!-- wp:post-excerpt {"moreText":"Continue reading →","excerptLength":25,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} /-->
                
                <!-- wp:group {"style":{"spacing":{"margin":{"top":"15px"}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
                <div class="wp-block-group" style="margin-top:15px">
                    <!-- wp:post-terms {"term":"post_tag","style":{"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} /-->
                    <!-- wp:buttons -->
                    <div class="wp-block-buttons">
                        <!-- wp:button {"className":"is-style-outline","style":{"border":{"radius":"8px"},"spacing":{"padding":{"left":"16px","right":"16px","top":"8px","bottom":"8px"}}},"fontSize":"small"} -->
                        <div class="wp-block-button is-style-outline has-small-font-size">
                            <a class="wp-block-button__link wp-element-button" style="border-radius:8px;padding-top:8px;padding-right:16px;padding-bottom:8px;padding-left:16px"><?php esc_html_e('Read More', 'kotlinskidev') ?></a>
                        </div>
                        <!-- /wp:button -->
                    </div>
                    <!-- /wp:buttons -->
                </div>
                <!-- /wp:group -->
                
            </div>
            <!-- /wp:group -->
        <!-- /wp:post-template -->
        
        <!-- wp:group {"style":{"spacing":{"margin":{"top":"40px"}}},"layout":{"type":"flex","justifyContent":"center"}} -->
        <div class="wp-block-group" style="margin-top:40px">
            <!-- wp:buttons -->
            <div class="wp-block-buttons">
                <!-- wp:button {"className":"is-style-outline","gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
                <div class="wp-block-button is-style-outline">
                    <a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button" href="<?php echo esc_url(home_url('/blog/')); ?>"><?php esc_html_e('View All Articles', 'kotlinskidev') ?></a>
                </div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
        
    </div>
    <!-- /wp:query -->
    
</div>
<!-- /wp:group -->