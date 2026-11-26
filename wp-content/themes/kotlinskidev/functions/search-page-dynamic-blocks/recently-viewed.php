<?php
function kotlinskidev_render_recently_viewed_shell( bool $blur_other_cards = false ) {
    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"top":"2.5rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group is-layout-constrained wp-block-group-is-layout-constrained" id="kt-recently-viewed" style="margin-top:2.5rem" hidden>

        <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground","fontSize":"x-large"} -->
        <h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Recently Viewed', 'kotlinskidev'); ?></h3>
        <!-- /wp:heading -->

        <!-- wp:html -->
        <div class="kt-post-card-grid<?php echo $blur_other_cards ? ' has-blur-siblings' : ''; ?>"></div>
        <!-- /wp:html -->

    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}
