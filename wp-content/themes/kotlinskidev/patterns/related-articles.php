<?php
/**
 * Title: Related Articles Section
 * Slug: kotlinskidev/related-articles
 * Categories: blog, kotlinskidev/blog, themeslug/custom
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"60px","bottom":"60px","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"1180px"}} -->
<div class="wp-block-group has-light-shade-background-color has-background" style="padding-top:60px;padding-right:var(--wp--preset--spacing--40);padding-bottom:60px;padding-left:var(--wp--preset--spacing--40)">
    
    <!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
    <h2 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size" style="font-style:normal;font-weight:700"><?php esc_html_e('Related Articles', 'kotlinskidev') ?></h2>
    <!-- /wp:heading -->
    
    <!-- wp:query {"queryId":10,"query":{"perPage":"3","pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","exclude":[],"sticky":"exclude","inherit":false},"layout":{"type":"constrained"}} -->
    <div class="wp-block-query">
        <!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"25px","bottom":"25px","left":"25px","right":"25px"}},"border":{"radius":"12px","width":"1px"}},"borderColor":"border-color","backgroundColor":"background-alt","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-border-color has-border-color-border-color has-background-alt-background-color has-background" style="border-width:1px;border-radius:12px;padding-top:25px;padding-right:25px;padding-bottom:25px;padding-left:25px;box-shadow:var(--wp--preset--shadow--natural)">
                
                <!-- wp:post-featured-image {"isLink":true,"style":{"border":{"radius":"8px"},"spacing":{"margin":{"bottom":"15px"}}}} /-->
                
                <!-- wp:post-title {"level":3,"isLink":true,"style":{"spacing":{"margin":{"bottom":"10px"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"medium"} /-->
                
                <!-- wp:post-excerpt {"moreText":"Read more","excerptLength":20,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} /-->
                
                <!-- wp:group {"style":{"spacing":{"margin":{"top":"15px"}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
                <div class="wp-block-group" style="margin-top:15px">
                    <!-- wp:post-date {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-small"} /-->
                    <!-- wp:post-terms {"term":"category","style":{"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"x-small"} /-->
                </div>
                <!-- /wp:group -->
                
            </div>
            <!-- /wp:group -->
        <!-- /wp:post-template -->
    </div>
    <!-- /wp:query -->
    
</div>
<!-- /wp:group -->
