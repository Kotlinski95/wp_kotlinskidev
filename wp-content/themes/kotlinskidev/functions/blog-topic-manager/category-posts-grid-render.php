<?php
function kotlinskidev_render_category_posts_grid_fresh_per_language( bool $blur_other_cards = false ) {
    $current_category = get_queried_object();

    $category_posts = new WP_Query(array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => 6,
        'cat' => $current_category->term_id,
        'orderby' => 'date',
        'order' => 'DESC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    ));

    ob_start();
    ?>
    <!-- wp:query {"queryId":1,"query":{"perPage":6,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true},"layout":{"type":"constrained"}} -->
    <div class="wp-block-query">

        <!-- wp:html -->
        <?php if ($category_posts->have_posts()) : ?>
        <div class="kt-post-card-grid<?php echo $blur_other_cards ? ' has-blur-siblings' : ''; ?>">
            <?php while ($category_posts->have_posts()) : $category_posts->the_post();
                $post_tags = get_the_tags();
                echo kotlinskidev_render_post_card(get_the_ID(), [
                    'tags' => $post_tags ? wp_list_pluck($post_tags, 'name') : [],
                ]); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_post_card() escapes every dynamic value at the point of output
            endwhile; ?>
        </div>

        <?php if ($category_posts->max_num_pages > 1) : ?>
        <div style="display:flex;justify-content:center;margin-top:2.5rem;">
            <?php
            echo paginate_links(array(
                'total' => $category_posts->max_num_pages,
                'prev_text' => '← ' . esc_html__('Previous', 'kotlinskidev'),
                'next_text' => esc_html__('Next', 'kotlinskidev') . ' →',
            ));
            ?>
        </div>
        <?php endif; ?>

        <?php else : ?>
        <div style="text-align:center;padding:3.75rem 0;">
            <h2 style="color:var(--wp--preset--color--foreground);"><?php esc_html_e('No articles in this topic yet', 'kotlinskidev'); ?></h2>
            <p style="color:var(--wp--preset--color--foreground);"><?php esc_html_e('Articles for this topic are coming soon!', 'kotlinskidev'); ?></p>
        </div>
        <?php
        endif;
        wp_reset_postdata();
        ?>
        <!-- /wp:html -->
    </div>
    <!-- /wp:query -->
    <?php
    return do_blocks(ob_get_clean());
}
