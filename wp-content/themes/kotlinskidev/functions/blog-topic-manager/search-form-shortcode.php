<?php
function kotlinskidev_search_form_shortcode($atts) {
    $locale = get_locale();
    $is_polish = ($locale == 'pl_PL');

    $defaults = array(
        'placeholder' => __('Search for content', 'kotlinskidev'),
        'button_text' => __('Search Content', 'kotlinskidev')
    );

    $atts = shortcode_atts($defaults, $atts);

    $search_action = $is_polish ? home_url('/szukaj') : home_url('/');
    $input_id = wp_unique_id('kotlinskidev-inline-search-');

    ob_start();
    ?>
    <form method="get" action="<?php echo esc_url($search_action); ?>" class="kotlinskidev-inline-search">
        <div style="display:flex;gap:0.625rem;align-items:center;">
            <label for="<?php echo esc_attr($input_id); ?>" class="sr-only"><?php echo esc_html($atts['placeholder']); ?></label>
            <input type="text"
                   id="<?php echo esc_attr($input_id); ?>"
                   name="s"
                   value="<?php echo esc_attr(get_search_query()); ?>"
                   placeholder="<?php echo esc_attr($atts['placeholder']); ?>"
                   style="flex-grow:1;padding:0.625rem 0.9375rem;border:0.125rem solid var(--wp--preset--color--border-color);border-radius:0.5rem;font-size:0.875rem;"
                   required />
            <button type="submit" 
                    style="background:var(--wp--preset--color--primary);color:white;border:none;padding:0.625rem 1.25rem;border-radius:0.5rem;font-weight:600;cursor:pointer;">
                <?php echo esc_html($atts['button_text']); ?>
            </button>
        </div>
    </form>
    <?php
    return ob_get_clean();
}
add_shortcode('kotlinskidev_search', 'kotlinskidev_search_form_shortcode');
