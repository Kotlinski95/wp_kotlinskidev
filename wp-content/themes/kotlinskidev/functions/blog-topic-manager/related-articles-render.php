<?php
function kotlinskidev_related_article_badge_label($current_categories, $current_tags, $post_categories, $post_tags) {
    $same_category = !empty($current_categories) && !empty($post_categories) &&
                   $current_categories[0]->term_id === $post_categories[0]->term_id;

    $same_tags = false;
    if (!empty($current_tags) && !empty($post_tags)) {
        $current_tag_ids = array_column($current_tags, 'term_id');
        $post_tag_ids = array_column($post_tags, 'term_id');
        $same_tags = !empty(array_intersect($current_tag_ids, $post_tag_ids));
    }

    if ($same_category && $same_tags) {
        return '🎯 ' . __('Highly Related', 'kotlinskidev');
    }
    if ($same_category) {
        return '📂 ' . __('Same Topic', 'kotlinskidev');
    }
    if ($same_tags) {
        return '🏷️ ' . __('Similar Tags', 'kotlinskidev');
    }

    return '';
}

function kotlinskidev_render_related_articles_fresh_per_language( bool $blur_other_cards = false ) {
    $current_post_id = get_the_ID();
    $current_categories = get_the_category($current_post_id);
    $current_tags = get_the_tags($current_post_id);
    $related_posts = kotlinskidev_get_related_articles_for_current_post(3);

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group has-light-shade-background-color has-background" style="padding-top:1.25rem;padding-right:var(--wp--preset--spacing--40);padding-bottom:1.25rem;padding-left:var(--wp--preset--spacing--40)">

        <!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"},"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground","fontSize":"x-large"} -->
        <h2 class="wp-block-heading has-text-align-center has-foreground-color has-text-color has-link-color has-x-large-font-size" style="font-style:normal;font-weight:700"><?php esc_html_e('Related Articles', 'kotlinskidev') ?></h2>
        <!-- /wp:heading -->

        <!-- wp:html -->
        <?php if (!empty($related_posts)) : ?>
        <div class="kt-post-card-grid<?php echo $blur_other_cards ? ' has-blur-siblings' : ''; ?>">
            <?php foreach ($related_posts as $display_post) :
                $post_categories = get_the_category($display_post->ID);
                $post_tags = get_the_tags($display_post->ID);
                $badge_label = kotlinskidev_related_article_badge_label($current_categories, $current_tags, $post_categories, $post_tags);

                echo kotlinskidev_render_post_card($display_post->ID, [
                    'badge_label' => $badge_label,
                    'tags' => !empty($post_categories) ? [$post_categories[0]->name] : [],
                ]); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_post_card() escapes every dynamic value at the point of output
            endforeach; ?>
        </div>

        <?php else : ?>
        <div style="text-align:center;padding:2.5rem 0;">
            <p style="color:var(--wp--preset--color--foreground);"><?php esc_html_e('No related articles found.', 'kotlinskidev'); ?></p>
        </div>
        <?php endif; ?>
        <!-- /wp:html -->

    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}
