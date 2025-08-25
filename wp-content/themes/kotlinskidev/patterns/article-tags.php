<?php
/**
 * Title: Article Tags
 * Slug: kotlinskidev/article-tags
 * Categories: blog, kotlinskidev/blog
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"10px","bottom":"10px"},"margin":{"top":"10px"}}},"layout":{"type":"constrained","contentSize":"1180px"}} -->
<div class="wp-block-group" style="margin-top: 10px; padding-top: 10px; padding-bottom: 10px">
    <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-large-font-size">
        <?php esc_html_e('Tags', 'kotlinskidev'); ?>
    </h3>
    <!-- wp:post-terms {"term":"post_tag","className":"link-dark-variant-support","style":{"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary"} /-->
</div>
<!-- /wp:group -->