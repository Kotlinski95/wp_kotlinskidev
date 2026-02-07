<?php

/**
 * Title: Popular Content
 * Slug: kotlinskidev/popular-content
 * Categories: blog, kotlinskidev/blog
 */
?>
<!-- wp:group {"style":{"spacing":{"margin":{"top":"2.5rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group is-layout-constrained wp-block-group-is-layout-constrained" style="margin-top:2.5rem">

    <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
    <h3 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Popular Content', 'kotlinskidev'); ?></h3>
    <!-- /wp:heading -->

    <!-- wp:html -->
    <?php
    $query_args = array(
        'post_type' => array('post', 'page'),
        'post_status' => 'publish',
        'posts_per_page' => 12,
        'order' => 'DESC',
        'meta_query' => array(
            'relation' => 'OR',
            array(
                'key' => '_wp_page_visibility',
                'compare' => 'NOT EXISTS'
            ),
            array(
                'key' => '_wp_page_visibility',
                'value' => 'private',
                'compare' => '!='
            )
        )
    );

    global $wpdb;
    $has_views = $wpdb->get_var("SELECT COUNT(*) FROM $wpdb->postmeta WHERE meta_key = '_kotlinskidev_page_views'");
    
    if ($has_views > 0) {
        $query_args['meta_key'] = '_kotlinskidev_page_views';
        $query_args['orderby'] = 'meta_value_num';
    } else {
        $query_args['orderby'] = 'date';
    }
    
    $popular_posts = new WP_Query($query_args);

    if ($popular_posts->have_posts()) :
        $displayed_count = 0;
        $max_display = 6;
    ?>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: 0.9375rem; margin-top: 1.25rem; margin-bottom: 1.25rem;">
            <?php while ($popular_posts->have_posts() && $displayed_count < $max_display) :
                $popular_posts->the_post();

                $should_index = true;

                if (
                    get_post_meta(get_the_ID(), '_genesis_noindex', true) == '1' ||
                    get_post_meta(get_the_ID(), '_yoast_wpseo_meta-robots-noindex', true) == '1' ||
                    get_post_meta(get_the_ID(), '_aioseop_noindex', true) == 'on' ||
                    get_post_meta(get_the_ID(), 'rank_math_robots', true) == 'noindex'
                ) {
                    $should_index = false;
                }

                if (!$should_index) continue;

                $post_type = get_post_type();
                $is_page = ($post_type === 'page');
                $displayed_count++;
            ?>
                <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0.125rem;border-radius:1.125rem;padding:0.9375rem;display:flex;flex-direction:column;height:100%;">

                    <?php if (has_post_thumbnail()) : ?>
                        <div style="margin-bottom:0.9375rem;flex-shrink:0;">
                            <a href="<?php the_permalink(); ?>">
                                <img src="<?php the_post_thumbnail_url('medium'); ?>"
                                    alt="<?php the_title(); ?>"
                                    style="width:100%;height:9.375rem;object-fit:contain;border-radius:0.75rem;" />
                            </a>
                        </div>
                    <?php endif; ?>

                    <div style="margin-bottom:0.9375rem;flex-shrink:0;">
                        <span style="background:linear-gradient(135deg, var(--wp--preset--color--primary) 0%, rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.8) 100%);color:white;padding:0.25rem 0.75rem;border-radius:0.9375rem;font-size:0.75rem;font-weight:600;">
                            <?php echo $is_page ? '📄 ' . esc_html__('Page', 'kotlinskidev') : '📝 ' . esc_html__('Article', 'kotlinskidev'); ?>
                        </span>
                    </div>

                    <h4 style="margin-bottom:0.9375rem;font-size:1.125rem;font-weight:600;flex-shrink:0;">
                        <a href="<?php the_permalink(); ?>" style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                            <?php the_title(); ?>
                        </a>
                    </h4>

                    <div style="color:var(--wp--preset--color--foreground-alt);margin-bottom:1.25rem;flex-grow:1;font-size:0.875rem;">
                        <?php echo wp_trim_words(get_the_excerpt(), 20, '...'); ?>
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;flex-shrink:0;font-size:0.75rem;">
                        <span style="color:var(--wp--preset--color--foreground-alt);">
                            <?php echo $is_page ? esc_html__('Updated', 'kotlinskidev') . ' ' . get_the_modified_date() : get_the_date(); ?>
                        </span>
                        <a href="<?php the_permalink(); ?>" class="search-link"
                            style="background:linear-gradient(135deg, var(--wp--preset--color--primary) 0%, rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.8) 100%);color:white;border:none;padding:0.625rem 1.5rem;border-radius:0.75rem;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);display:inline-flex;align-items:center;gap:0.5rem;box-shadow:0 0.25rem 0.75rem rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.25), 0 0.125rem 0.25rem rgba(0, 0, 0, 0.08);text-transform:none;letter-spacing:0.025em;outline:none;text-decoration:none;line-height:1.4;">
                            <?php echo $is_page ? esc_html__('View', 'kotlinskidev') : esc_html__('Read', 'kotlinskidev'); ?>
                        </a>
                    </div>

                </div>
            <?php endwhile; ?>
        </div>
    <?php
    endif;
    wp_reset_postdata();
    ?>
    <!-- /wp:html -->

</div>
<!-- /wp:group -->