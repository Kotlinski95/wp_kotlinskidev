<?php
function kotlinskidev_blog_topics_url_for_locale($locale) {
    return ($locale == 'pl_PL') ? home_url('/tematy-bloga/') : home_url('/blog-topics/');
}

function kotlinskidev_blog_breadcrumbs() {
    $locale = get_locale();
    $home_text = __('Home', 'kotlinskidev');
    $blog_text = __('Blog', 'kotlinskidev');
    $topics_text = __('Topics', 'kotlinskidev');

    $breadcrumbs = array();
    $breadcrumbs[] = '<a href="' . esc_url(home_url('/')) . '">' . $home_text . '</a>';

    if (is_category()) {
        $category = get_queried_object();
        $topics_url = kotlinskidev_blog_topics_url_for_locale($locale);
        $breadcrumbs[] = '<a href="' . esc_url($topics_url) . '">' . $topics_text . '</a>';
        $breadcrumbs[] = '<span>' . esc_html($category->name) . '</span>';
    } elseif (is_single() && get_post_type() === 'post') {
        $categories = get_the_category();
        if (!empty($categories)) {
            $category = $categories[0];
            $topics_url = kotlinskidev_blog_topics_url_for_locale($locale);
            $breadcrumbs[] = '<a href="' . esc_url($topics_url) . '">' . $topics_text . '</a>';
            $breadcrumbs[] = '<a href="' . esc_url(get_category_link($category->term_id)) . '">' . esc_html($category->name) . '</a>';
            $breadcrumbs[] = '<span>' . esc_html(get_the_title()) . '</span>';
        }
    }

    if (count($breadcrumbs) > 1) {
        echo '<nav class="kotlinskidev-breadcrumbs" style="margin-bottom:1.875rem;font-size:0.875rem;color:var(--wp--preset--color--foreground);">';
        echo implode(' <span style="margin:0 0.5rem;">→</span> ', $breadcrumbs); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- every $breadcrumbs element is esc_url()/esc_html() wrapped at construction above
        echo '</nav>';
    }
}
