<?php
function kotlinskidev_search_form_view( $wrapper_background_color, $input_border_color, $label_color ): array {
    $categories = get_categories(array(
        'hide_empty' => true,
        'orderby' => 'count',
        'order' => 'DESC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    ));

    return [
        'current_search' => get_search_query(),
        'current_category' => kotlinskidev_search_request_value('search_category'),
        'current_type' => kotlinskidev_search_request_value('search_type'),
        'action_url' => kotlinskidev_search_action_url_for_current_language(),
        'categories' => $categories,
        'wrapper_style_override' => '' !== $wrapper_background_color ? 'background-color:' . esc_attr($wrapper_background_color) . ';' : '',
        'field_style_override' => '' !== $input_border_color ? ' style="border-color:' . esc_attr($input_border_color) . '"' : '',
        'label_style_override' => '' !== $label_color ? ' style="color:' . esc_attr($label_color) . '"' : '',
    ];
}

function kotlinskidev_render_search_form_fresh_per_language($wrapper_background_color = '', $input_border_color = '', $label_color = '') {
    $form = kotlinskidev_search_form_view($wrapper_background_color, $input_border_color, $label_color);
    $wrapper_style_override = $form['wrapper_style_override'];
    $search_action_url = $form['action_url'];
    $fields_markup = kotlinskidev_search_form_text_field_markup($form);
    $type_markup = kotlinskidev_search_form_type_field_markup($form);
    $category_markup = kotlinskidev_search_form_category_field_markup($form);
    $clear_link_markup = kotlinskidev_search_form_clear_link_markup($form);

    ob_start();
?>
    <!-- wp:group {"style":{"spacing":{"margin":{"bottom":"0.9375rem"},"padding":{"top":"0.9375rem","bottom":"0.9375rem","left":"1.25rem","right":"1.25rem"}},"border":{"radius":"1.25rem","width":"0rem"}},"borderColor":"border-color","backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"50rem"}} -->
    <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0rem;border-radius:1.25rem;margin-bottom:0.9375rem;padding-top:0.9375rem;padding-right:1.25rem;padding-bottom:0.9375rem;padding-left:1.25rem;<?php echo esc_attr($wrapper_style_override); ?>">

        <!-- wp:html -->
        <form method="get" action="<?php echo esc_url($search_action_url); ?>" class="kotlinskidev-search-form">

<?php echo $fields_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by kotlinskidev_search_form_text_field_markup(), which escapes every dynamic value at the point of output ?>
            <div class="search-filters-grid">

<?php echo $type_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by kotlinskidev_search_form_type_field_markup(), which escapes every dynamic value at the point of output ?>
<?php echo $category_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by kotlinskidev_search_form_category_field_markup(), which escapes every dynamic value at the point of output ?>
            </div>

<?php echo kotlinskidev_search_form_submit_markup(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup, every string escaped with esc_html__() ?>
<?php echo $clear_link_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by kotlinskidev_search_form_clear_link_markup(), which escapes every dynamic value at the point of output ?>
        </form>

<?php echo kotlinskidev_search_form_submit_script_markup(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static inline script with no dynamic values ?>
        <!-- /wp:html -->
    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}
