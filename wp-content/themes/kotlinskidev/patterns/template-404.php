<?php
/**
 * Title: 404 Template
 * Slug: kotlinskidev/template-404
 * Categories: pages, kotlinskidev/pages, themeslug/custom
 */
?>
<!-- wp:group {"tagName":"main","style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"margin":{"top":"6.25rem","bottom":"0"}}},"backgroundColor":"background-alt","layout":{"type":"constrained","contentSize":"100%"}} -->
<main class="main-wrapper wp-block-group has-background-alt-background-color has-background" style="margin-top:6.25rem;margin-bottom:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0" tabindex="-1"><!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"1rem"},"blockGap":"var:preset|spacing|3.125rem","margin":{"top":"0","bottom":"0"}}},"backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group has-light-shade-background-color has-background" style="margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:1rem">
        <div style="text-align:center;">
            <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/images/404.webp'); ?>" alt="404" style="max-width:50%;width:100%;height:auto;display:inline-block;" />
        </div>

        <!-- wp:heading {"textAlign":"center","level":1,"className":"kotlinskidev-404-title","style":{"typography":{"fontStyle":"normal","fontWeight":"600","lineHeight":"1.1"}},"textColor":"foreground-alt"} -->
        <h1 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color kotlinskidev-404-title" style="font-style:normal;font-weight:600;line-height:1.1;">
            <?php esc_html_e('OOPS! Page Not Found!', 'kotlinskidev') ?>
        </h1>
        <style>
            .kotlinskidev-404-title {
            font-size: 3.875rem;
            }
            @media (max-width: 37.5rem) {
            .kotlinskidev-404-title {
                font-size: 2rem;
            }
            }
        </style>
        <div style="text-align:center;margin:2rem 0 1.5rem 0;">
            <a href="<?php echo esc_url(home_url('/')); ?>"
               class="search-link"
               style="background:linear-gradient(135deg, var(--wp--preset--color--primary) 0%, rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.8) 100%);color:white;border:none;padding:0.875rem 1.5rem;border-radius:6.25rem;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);display:inline-flex;align-items:center;gap:0.5rem;box-shadow:0 0.25rem 0.75rem rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.25), 0 0.125rem 0.25rem rgba(0, 0, 0, 0.08);text-transform:none;letter-spacing:0.025em;outline:none;text-decoration:none;line-height:1.4;white-space:nowrap;">
                <?php esc_html_e('Go to Homepage', 'kotlinskidev'); ?>
            </a>
        </div>
        <!-- /wp:heading -->
    </div>
    <!-- /wp:group -->

    <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem","right":"var:preset|spacing|2.5rem","left":"var:preset|spacing|2.5rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group" style="padding-top:1.25rem;padding-right:var(--wp--preset--spacing--2.5rem);padding-bottom:1.25rem;padding-left:var(--wp--preset--spacing--2.5rem)"><!-- wp:columns -->
        <div class="wp-block-columns"><!-- wp:column -->
            <div class="wp-block-column"><!-- wp:heading {"style":{"typography":{"fontStyle":"normal","fontWeight":"500"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <h2 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color" style="font-style:normal;font-weight:500"><?php esc_html_e('Helpful Link', 'kotlinskidev') ?></h2>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="line-height:1.5"><?php esc_html_e('Something went wrong! We couldn’t find the page you were looking for. But don’t worry, we’ve got some other Links that might be helpful:', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->

        <!-- wp:columns {"style":{"spacing":{"margin":{"top":"2.5rem"}}}} -->
        <div class="wp-block-columns" style="margin-top:2.5rem">
            <!-- wp:column -->
            <div class="wp-block-column"><!-- wp:heading {"level":4,"style":{"typography":{"fontStyle":"normal","fontWeight":"500"},"spacing":{"margin":{"bottom":"var:preset|spacing|3.125rem"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:var(--wp--preset--spacing--3.125rem);font-style:normal;font-weight:500"><?php echo esc_html_x('Pages', '404', 'kotlinskidev') ?></h4>
                <!-- /wp:heading -->

                <!-- wp:page-list {"className":"is-style-kotlinskidev-page-list-bullet-hide-style is-style-kotlinskidev-page-list-bullet-hide-style","style":{"typography":{"lineHeight":"2"}}} /-->
            </div>
            <!-- /wp:column -->

            <!-- wp:column -->
            <div class="wp-block-column"><!-- wp:heading {"level":4,"style":{"typography":{"fontStyle":"normal","fontWeight":"500"},"spacing":{"margin":{"bottom":"var:preset|spacing|3.125rem"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:var(--wp--preset--spacing--3.125rem);font-style:normal;font-weight:500"><?php echo esc_html_x('Categories', '404', 'kotlinskidev') ?></h4>
                <!-- /wp:heading -->

                <!-- wp:categories {"className":"is-style-kotlinskidev-categories-bullet-hide-style is-style-kotlinskidev-categories-bullet-hide-style","style":{"typography":{"lineHeight":"2"}}} /-->
            </div>
            <!-- /wp:column -->

            <!-- wp:column -->
            <div class="wp-block-column">
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:var(--wp--preset--spacing--3.125rem);font-style:normal;font-weight:500">
                    <?php echo esc_html_x('Posts', '404', 'kotlinskidev'); ?>
                </h4>
                <ul class="kotlinskidev-404-post-list">
                <?php
                $recent_posts = get_posts([
                    'numberposts' => 10,
                    'post_status' => 'publish',
                ]);
                if ($recent_posts) {
                    foreach ($recent_posts as $post) {
                        echo '<li><a href="' . esc_url(get_permalink($post->ID)) . '" class="kotlinskidev-404-post-link">' . esc_html(get_the_title($post->ID)) . '</a></li>';
                    }
                } else {
                    echo '<li>' . esc_html__('No posts found.', 'kotlinskidev') . '</li>';
                }
                ?>
                </ul>
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->
</main>
<!-- /wp:group -->