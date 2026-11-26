<?php
function kotlinskidev_render_article_tags_fresh_per_language() {
    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"0.625rem","bottom":"0.625rem"},"margin":{"top":"0.625rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group" style="margin-top:0.625rem;padding-top:0.625rem;padding-bottom:0.625rem;">
        <!-- wp:heading {"level":3,"className":"wp-block-heading has-foreground-color has-text-color has-link-color has-large-font-size"} -->
        <h3 class="wp-block-heading has-foreground-color has-text-color has-link-color has-large-font-size">
            <?php esc_html_e('Tags', 'kotlinskidev'); ?>
        </h3>
        <!-- /wp:heading -->
        <!-- wp:post-terms {"term":"post_tag","className":"link-dark-variant-support kt-gradient-text"} /-->
    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}
