<?php
function kotlinskidev_render_post_card( int $post_id, array $args = [] ): string {
    $args = wp_parse_args( $args, [
        'badge_label'  => '',
        'tags'         => [],
        'button_label' => __( 'Read Article', 'kotlinskidev' ),
    ] );

    $permalink = get_permalink( $post_id );
    $title     = get_the_title( $post_id );
    $thumbnail = has_post_thumbnail( $post_id ) ? get_the_post_thumbnail_url( $post_id, 'medium_large' ) : '';

    $excerpt = get_post_field( 'post_excerpt', $post_id );
    if ( '' === $excerpt ) {
        $excerpt = get_post_field( 'post_content', $post_id );
    }
    $excerpt = wp_trim_words( wp_strip_all_tags( $excerpt ), 25, '...' );

    $badge = '' !== $args['badge_label'] ? $args['badge_label'] : kotlinskidev_reading_time( $post_id );

    ob_start();
    ?>
    <div class="kt-post-card-grid__card">

        <a href="<?php echo esc_url( $permalink ); ?>" class="kt-post-card-grid__image-link">
            <?php if ( $thumbnail ) : ?>
            <img src="<?php echo esc_url( $thumbnail ); ?>"
                 alt="<?php echo esc_attr( $title ); ?>"
                 class="kt-post-card-grid__image"
                 loading="lazy"
                 decoding="async" />
            <?php else : ?>
            <span class="kt-post-card-grid__image-placeholder" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 6h16l8 8v28a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                    <path d="M29 6v8h8" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                    <path d="M17 26h14M17 32h14M17 20h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
            </span>
            <?php endif; ?>
        </a>

        <div class="kt-post-card-grid__body">

            <div class="kt-post-card-grid__meta-row">
                <span class="kt-post-card-grid__date"><?php echo esc_html( get_the_date( '', $post_id ) ); ?></span>
                <?php if ( '' !== $badge ) : ?>
                <span class="kt-post-card-grid__badge"><?php echo esc_html( $badge ); ?></span>
                <?php endif; ?>
            </div>

            <h3 class="kt-post-card-grid__title">
                <a href="<?php echo esc_url( $permalink ); ?>" class="kt-post-card-grid__title-link"><?php echo esc_html( $title ); ?></a>
            </h3>

            <div class="kt-post-card-grid__excerpt"><?php echo esc_html( $excerpt ); ?></div>

            <div class="kt-post-card-grid__footer">
                <?php if ( ! empty( $args['tags'] ) ) : ?>
                <div class="kt-post-card-grid__tags">
                    <?php foreach ( $args['tags'] as $tag_label ) : ?>
                    <span class="kt-post-card-grid__tag">#<?php echo esc_html( $tag_label ); ?></span>
                    <?php endforeach; ?>
                </div>
                <?php else : ?>
                <div></div>
                <?php endif; ?>
                <a href="<?php echo esc_url( $permalink ); ?>" class="wp-element-button has-background has-text-color kt-post-card-grid__button">
                    <?php echo esc_html( $args['button_label'] ); ?>
                </a>
            </div>

        </div>
    </div>
    <?php
    return ob_get_clean();
}
