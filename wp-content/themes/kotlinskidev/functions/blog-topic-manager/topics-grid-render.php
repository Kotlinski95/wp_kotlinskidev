<?php
function kotlinskidev_build_blog_topics_grid_style_vars( array $attributes = [] ): string {
    $vars = [];

    $color_attribute_map = [
        'cardTextColor'              => '--kt-blog-topics-grid-card-text-color',
        'cardBorderColor'            => '--kt-blog-topics-grid-card-border-color',
        'cardBackgroundColor'        => '--kt-blog-topics-grid-card-bg',
        'buttonBackgroundColor'      => '--kt-blog-topics-grid-button-bg',
        'buttonTextColor'            => '--kt-blog-topics-grid-button-text-color',
        'buttonHoverBackgroundColor' => '--kt-blog-topics-grid-button-hover-bg',
        'buttonHoverTextColor'       => '--kt-blog-topics-grid-button-hover-text-color',
        'cardHoverBackgroundColor'   => '--kt-blog-topics-grid-card-hover-bg',
    ];

    foreach ( $color_attribute_map as $attribute_key => $css_var ) {
        $color_value = trim( (string) ( $attributes[ $attribute_key ] ?? '' ) );
        if ( '' !== $color_value ) {
            $vars[ $css_var ] = $color_value;
        }
    }

    if ( ! empty( $attributes['blurOtherCards'] ) ) {
        $blur_amount = trim( (string) ( $attributes['blurAmount'] ?? '' ) );
        if ( '' !== $blur_amount ) {
            $vars['--kt-blur-amount'] = $blur_amount;
        }
    }

    if ( empty( $vars ) ) {
        return '';
    }

    $declarations = [];
    foreach ( $vars as $property => $value ) {
        $declarations[] = $property . ':' . $value;
    }

    return implode( ';', $declarations ) . ';';
}

function kotlinskidev_render_blog_topics_empty_state() {
    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group" style="padding-top:1.25rem;padding-bottom:1.25rem">
        <!-- wp:heading {"textAlign":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground"} -->
        <h2 class="wp-block-heading has-text-align-center has-foreground-color has-text-color has-link-color"><?php esc_html_e('No topics found', 'kotlinskidev'); ?></h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground"} -->
        <p class="has-text-align-center has-foreground-color has-text-color has-link-color"><?php esc_html_e('No blog topics have been created yet. Create some categories and add posts to them!', 'kotlinskidev'); ?></p>
        <!-- /wp:paragraph -->

        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
        <div class="wp-block-buttons">
            <!-- wp:button -->
            <div class="wp-block-button">
                <a class="wp-block-button__link wp-element-button" href="<?php echo esc_url(admin_url('edit-tags.php?taxonomy=category')); ?>"><?php esc_html_e('Create Your First Topic', 'kotlinskidev'); ?></a>
            </div>
            <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}

function kotlinskidev_render_blog_topics_grid_fresh_per_language( bool $blur_other_cards = false ) {
    $categories = get_categories(array(
        'hide_empty' => true,
        'exclude' => array(1),
        'orderby' => 'name',
        'order' => 'ASC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    ));

    if (empty($categories)) {
        return kotlinskidev_render_blog_topics_empty_state();
    }

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group" style="margin-top:0;margin-bottom:0">

        <!-- wp:html -->
        <div class="kt-blog-topics-grid<?php echo $blur_other_cards ? ' has-blur-siblings' : ''; ?>">
            <?php foreach ($categories as $category) :
                echo kotlinskidev_render_topic_card($category); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_topic_card() escapes every dynamic value at the point of output
            endforeach; ?>
        </div>
        <!-- /wp:html -->

    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}
