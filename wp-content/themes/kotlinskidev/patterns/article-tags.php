<?php
/**
 * Title: Article Tags
 * Slug: kotlinskidev/article-tags
 * Categories: blog, kotlinskidev/blog
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"0.625rem","bottom":"0.625rem"},"margin":{"top":"0.625rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0.625rem;padding-top:0.625rem;padding-bottom:0.625rem;">
    <!-- wp:heading {"level":3,"className":"wp-block-heading has-foreground-alt-color has-text-color has-link-color has-large-font-size"} -->
    <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-large-font-size">
        <?php esc_html_e('Tags', 'kotlinskidev'); ?>
    </h3>
    <!-- /wp:heading -->
    <!-- wp:post-terms {"term":"post_tag","className":"link-dark-variant-support","style":{"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary"} /-->
</div>
<!-- /wp:group -->