<?php
function kotlinskidev_render_tag_header_fresh_per_language() {
    $current_tag = get_queried_object();
    $tag_name = $current_tag->name;
    $tag_description = $current_tag->description;
    $post_count = $current_tag->count;
    $breadcrumb_settings = kotlinskidev_get_breadcrumb_settings(get_locale());

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"bottom":"1.25rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group" style="margin-bottom:1.25rem">

        <!-- wp:html -->
        <div style="text-align:center;">
            <div class="kt-gradient-pill" style="padding:0.5rem 1rem;border-radius:1.25rem;font-size:0.875rem;font-weight:600;margin-bottom:0.9375rem;">
                #<?php echo esc_html($tag_name); ?>
            </div>

            <h1 style="color:var(--wp--preset--color--foreground);font-weight:800;font-size:2.5rem;margin-bottom:0.625rem;">
                <?php printf(esc_html__('Articles tagged with "%s"', 'kotlinskidev'), esc_html($tag_name)); ?>
            </h1>

            <?php if ($tag_description) : ?>
                <p style="color:var(--wp--preset--color--foreground);font-size:1.125rem;margin-bottom:0.9375rem;">
                    <?php echo esc_html($tag_description); ?>
                </p>
            <?php endif; ?>

            <div style="display:flex;justify-content:center;align-items:center;gap:1.25rem;margin-bottom:1.875rem;">
                <span class="link-dark-variant-support kt-gradient-text" style="font-weight:600;">
                    <?php echo absint($post_count) . ' ' . ($post_count === 1 ? esc_html__('Article', 'kotlinskidev') : esc_html__('Articles', 'kotlinskidev')); ?>
                </span>
                <span style="color:var(--wp--preset--color--foreground);">•</span>
                <a href="<?php echo esc_url($breadcrumb_settings['topics_url']); ?>" style="text-decoration:none;" class="link-dark-variant-support kt-gradient-text">
                    ← <?php esc_html_e('Browse All Topics', 'kotlinskidev'); ?>
                </a>
            </div>
        </div>
        <!-- /wp:html -->
    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}

function kotlinskidev_render_tag_posts_grid_fresh_per_language( bool $blur_other_cards = false ) {
    $current_tag = get_queried_object();

    $tag_posts = new WP_Query(array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => 6,
        'tag_id' => $current_tag->term_id,
        'orderby' => 'date',
        'order' => 'DESC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    ));

    ob_start();
    ?>
    <!-- wp:query {"queryId":1,"query":{"perPage":6,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true},"layout":{"type":"constrained"}} -->
    <div class="wp-block-query">
        <!-- wp:html -->
        <?php if ($tag_posts->have_posts()) : ?>
        <div class="kt-post-card-grid<?php echo $blur_other_cards ? ' has-blur-siblings' : ''; ?>">
            <?php while ($tag_posts->have_posts()) : $tag_posts->the_post();
                $post_tags = get_the_tags();
                $other_tag_names = array();
                if ($post_tags) {
                    foreach ($post_tags as $tag) {
                        if ($tag->term_id !== $current_tag->term_id) {
                            $other_tag_names[] = $tag->name;
                        }
                    }
                }

                echo kotlinskidev_render_post_card(get_the_ID(), [
                    'tags' => array_slice($other_tag_names, 0, 2),
                ]); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_post_card() escapes every dynamic value at the point of output
            endwhile; ?>
        </div>

        <?php if ($tag_posts->max_num_pages > 1) : ?>
        <div style="display:flex;justify-content:center;margin-top:2.5rem;">
            <?php
            echo paginate_links(array(
                'total' => $tag_posts->max_num_pages,
                'prev_text' => '← ' . esc_html__('Previous', 'kotlinskidev'),
                'next_text' => esc_html__('Next', 'kotlinskidev') . ' →',
            ));
            ?>
        </div>
        <?php endif; ?>

        <?php else : ?>
        <div style="text-align:center;padding:3.75rem 0;">
            <h2 style="color:var(--wp--preset--color--foreground);"><?php esc_html_e('No articles found with this tag', 'kotlinskidev'); ?></h2>
            <p style="color:var(--wp--preset--color--foreground);"><?php esc_html_e('Articles with this tag are coming soon!', 'kotlinskidev'); ?></p>
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

function kotlinskidev_render_related_tags_fresh_per_language() {
    $current_tag = get_queried_object();
    $related_tags = get_tags(array(
        'exclude' => array($current_tag->term_id),
        'orderby' => 'count',
        'order' => 'DESC',
        'number' => 8,
        'hide_empty' => true,
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    ));

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"top":"1.25rem"},"padding":{"top":"1.25rem"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group" style="margin-top:1.25rem;padding-top:1.25rem;">

        <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground","fontSize":"x-large"} -->
        <h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Related Tags', 'kotlinskidev'); ?></h3>
        <!-- /wp:heading -->

        <?php if (!empty($related_tags)) : ?>
        <!-- wp:html -->
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0.9375rem; margin-top: 1.25rem;">
            <?php foreach ($related_tags as $tag) :
                $tag_link = get_tag_link($tag->term_id);

                $latest_post_id = kotlinskidev_get_term_latest_post_id($tag->term_id, 'post_tag');

                $last_updated = '';
                if ($latest_post_id > 0) {
                    $last_updated = human_time_diff(get_the_time('U', $latest_post_id), current_time('timestamp')) . ' ago';
                }
            ?>
            <div style="text-align:center;padding:0.9375rem;border:0.125rem solid var(--wp--preset--color--border-color);border-radius:0.75rem;background:var(--wp--preset--color--light-shade);transition:transform 0.3s ease;hover:transform:translateY(-0.125rem);min-width:12.5rem;">
                <div style="margin-bottom:0.5rem;">
                    <span class="kt-gradient-pill" style="padding:0.375rem 0.75rem;border-radius:0.9375rem;font-size:0.875rem;font-weight:600;">
                        #<?php echo esc_html($tag->name); ?>
                    </span>
                </div>

                <p class="link-dark-variant-support kt-gradient-text" style="font-size:0.875rem;margin:0.3125rem 0;">
                    <?php echo absint($tag->count); ?> <?php echo $tag->count === 1 ? esc_html__('article', 'kotlinskidev') : esc_html__('articles', 'kotlinskidev'); ?>
                </p>

                <?php if ($last_updated) : ?>
                    <p style="color:var(--wp--preset--color--foreground);font-size:0.75rem;margin:0.3125rem 0;">
                        <?php printf(esc_html__('Updated %s', 'kotlinskidev'), esc_html($last_updated)); ?>
                    </p>
                <?php endif; ?>

                <div style="margin-top:0.9375rem;">
                    <a href="<?php echo esc_url($tag_link); ?>" class="search-link">
                        <?php esc_html_e('View Articles', 'kotlinskidev'); ?>
                    </a>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <!-- /wp:html -->

        <?php else : ?>
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group" style="padding-top:1.25rem;padding-bottom:1.25rem">
            <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground"} -->
            <p class="has-text-align-center has-foreground-color has-text-color has-link-color"><?php esc_html_e('No other tags available yet.', 'kotlinskidev'); ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <?php endif; ?>
    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}

function kotlinskidev_register_tag_archive_dynamic_blocks() {
    register_block_type('kotlinskidev/tag-header-dynamic', array(
        'render_callback' => 'kotlinskidev_render_tag_header_fresh_per_language',
    ));
    register_block_type('kotlinskidev/related-tags-dynamic', array(
        'render_callback' => 'kotlinskidev_render_related_tags_fresh_per_language',
    ));
}
add_action('init', 'kotlinskidev_register_tag_archive_dynamic_blocks');
