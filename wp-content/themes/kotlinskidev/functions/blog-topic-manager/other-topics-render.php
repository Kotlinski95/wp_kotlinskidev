<?php
function kotlinskidev_render_other_topics_fresh_per_language( bool $blur_other_cards = false ) {
    $current_category = get_queried_object();
    $other_categories = get_categories(array(
        'hide_empty' => true,
        'exclude' => array(1, $current_category->term_id),
        'number' => 4,
        'orderby' => 'count',
        'order' => 'DESC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    ));

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"top":"1.25rem"},"padding":{"top":"1.25rem"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group" style="margin-top:1.25rem;padding-top:1.25rem;">

        <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground","fontSize":"x-large"} -->
        <h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Other Topics', 'kotlinskidev'); ?></h3>
        <!-- /wp:heading -->

        <?php if (!empty($other_categories)) : ?>
        <!-- wp:html -->
        <div class="kt-blog-topics-grid<?php echo $blur_other_cards ? ' has-blur-siblings' : ''; ?>">
            <?php foreach ($other_categories as $category) :
                echo kotlinskidev_render_topic_card($category); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_topic_card() escapes every dynamic value at the point of output
            endforeach; ?>
        </div>
        <!-- /wp:html -->

        <?php else : ?>
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"2.5rem","bottom":"2.5rem"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group" style="padding-top:2.5rem;padding-bottom:2.5rem">
            <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground"} -->
            <p class="has-text-align-center has-foreground-color has-text-color has-link-color"><?php esc_html_e('No other topics available yet.', 'kotlinskidev'); ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <?php endif; ?>

    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}
