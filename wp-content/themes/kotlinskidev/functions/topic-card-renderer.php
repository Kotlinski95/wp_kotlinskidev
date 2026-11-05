<?php
function kotlinskidev_render_topic_card( WP_Term $category ): string {
    $category_link        = get_category_link( $category->term_id );
    $extended_description = kotlinskidev_get_category_description( $category->term_id );

    $latest_post = get_posts( [
        'category'         => $category->term_id,
        'posts_per_page'   => 1,
        'post_status'      => 'publish',
        'suppress_filters' => false,
        'lang'             => function_exists( 'pll_current_language' ) ? pll_current_language() : '',
    ] );

    $featured_image = '';
    if ( ! empty( $latest_post ) && has_post_thumbnail( $latest_post[0]->ID ) ) {
        $featured_image = get_the_post_thumbnail_url( $latest_post[0]->ID, 'medium' );
    }

    ob_start();
    ?>
    <div class="kt-blog-topics-grid__card">

        <?php if ( $featured_image ) : ?>
        <a href="<?php echo esc_url( $category_link ); ?>">
            <img src="<?php echo esc_url( $featured_image ); ?>"
                 alt="<?php echo esc_attr( $category->name ); ?>"
                 class="kt-blog-topics-grid__image" />
        </a>
        <?php endif; ?>

        <div class="kt-blog-topics-grid__body">
            <h2 class="kt-blog-topics-grid__title">
                <a href="<?php echo esc_url( $category_link ); ?>" class="kt-blog-topics-grid__title-link"><?php echo esc_html( $category->name ); ?></a>
            </h2>

            <?php if ( $extended_description ) : ?>
            <p class="kt-blog-topics-grid__description"><?php echo esc_html( $extended_description ); ?></p>
            <?php endif; ?>

            <div class="kt-blog-topics-grid__meta-row">
                <span class="link-dark-variant-support kt-gradient-text kt-blog-topics-grid__count">
                    <?php echo absint( $category->count ); ?> <?php echo 1 === (int) $category->count ? esc_html__( 'Article', 'kotlinskidev' ) : esc_html__( 'Articles', 'kotlinskidev' ); ?>
                </span>
                <span class="kt-blog-topics-grid__updated">
                    <?php
                    if ( ! empty( $latest_post ) ) {
                        printf(
                            esc_html__( 'Updated %s ago', 'kotlinskidev' ),
                            esc_html( human_time_diff( get_the_time( 'U', $latest_post[0]->ID ), current_time( 'timestamp' ) ) )
                        );
                    }
                    ?>
                </span>
            </div>

            <a href="<?php echo esc_url( $category_link ); ?>" class="wp-element-button has-background has-text-color kt-blog-topics-grid__button">
                <?php printf( esc_html__( 'Explore %s', 'kotlinskidev' ), esc_html( $category->name ) ); ?>
            </a>
        </div>

    </div>
    <?php
    return ob_get_clean();
}
