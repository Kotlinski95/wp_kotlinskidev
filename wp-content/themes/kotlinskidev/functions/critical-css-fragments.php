<?php
function kotlinskidev_get_critical_css_fragments(): array
{
    return apply_filters('kotlinskidev_critical_css_fragments', array(
        'kotlinskidev/certificate' => 'critical-certificate.css',
    ));
}

function kotlinskidev_get_active_critical_css_fragments(): array
{
    $fragments = array();

    if (is_search()) {
        $fragments[] = 'critical-search.css';
    }

    if (is_singular()) {
        $post = get_queried_object();
        if ($post instanceof WP_Post) {
            foreach (kotlinskidev_get_critical_css_fragments() as $block_name => $file) {
                if (has_block($block_name, $post)) {
                    $fragments[] = $file;
                }
            }
        }
    }

    return array_values(array_unique($fragments));
}
