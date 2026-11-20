<?php

const KOTLINSKIDEV_CONTENT_VISIBILITY_CLASS = 'kt-cv-auto';

function kotlinskidev_content_visibility_enabled(): bool
{
    $enabled = (bool) get_option('kotlinskidev_content_visibility', false)
        && ! is_admin()
        && ! is_feed()
        && ! is_customize_preview()
        && ! wp_is_json_request()
        && is_singular();

    return (bool) apply_filters('kotlinskidev_content_visibility_enabled', $enabled);
}

function kotlinskidev_content_visibility_skip_pattern(): string
{
    return '/scroll-section|parallax|-on-scroll|hero|kt-bg-effect|canvas-background|kotlinskidev-sticky|is-position-sticky|kotlinskidev-scrollto-top|kt-scroll-to-top|data-wp-interactive|position:\s*(?:fixed|sticky)/i';
}

function kotlinskidev_content_visibility_subtree_blocks(array $block): array
{
    $names = array();
    if (! empty($block['blockName'])) {
        $names[] = $block['blockName'];
    }
    foreach ($block['innerBlocks'] ?? array() as $inner) {
        $names = array_merge($names, kotlinskidev_content_visibility_subtree_blocks($inner));
    }

    return $names;
}

function kotlinskidev_content_visibility_has_anchor(array $block): bool
{
    if (! empty($block['attrs']['anchor'])) {
        return true;
    }
    foreach ($block['innerBlocks'] ?? array() as $inner) {
        if (kotlinskidev_content_visibility_has_anchor($inner)) {
            return true;
        }
    }

    return false;
}

function kotlinskidev_content_visibility_references_anchor(string $html, string $post_content): bool
{
    if (! preg_match_all('/\sid=["\']([^"\']+)["\']/', $html, $ids)) {
        return false;
    }
    foreach (array_unique($ids[1]) as $id) {
        if (false !== strpos($post_content, '#' . $id)) {
            return true;
        }
    }

    return false;
}

function kotlinskidev_content_visibility_should_skip(array $block, string $html, array $above_fold, string $post_content): bool
{
    if ('' === trim($html) || '<' !== $html[0]) {
        return true;
    }

    $names = kotlinskidev_content_visibility_subtree_blocks($block);

    if (array_intersect($names, $above_fold)) {
        return true;
    }

    if (in_array('core/heading', $names, true) || kotlinskidev_content_visibility_has_anchor($block)) {
        return true;
    }

    if (preg_match(kotlinskidev_content_visibility_skip_pattern(), $html)) {
        return true;
    }

    return kotlinskidev_content_visibility_references_anchor($html, $post_content);
}

function kotlinskidev_content_visibility_add_class(string $html, string $class_name = KOTLINSKIDEV_CONTENT_VISIBILITY_CLASS, string $match_class = ''): string
{
    $processor = new WP_HTML_Tag_Processor($html);
    $found     = '' === $match_class ? $processor->next_tag() : $processor->next_tag(array('class_name' => $match_class));
    if (! $found) {
        return $html;
    }
    $processor->add_class($class_name);

    return $processor->get_updated_html();
}

function kotlinskidev_content_visibility_state(?bool $reset = null): int
{
    static $count = 0;

    if (true === $reset) {
        $count = 0;
        return 0;
    }

    return $count++;
}

const KOTLINSKIDEV_CONTENT_VISIBILITY_FOOTER_MATCH_CLASS = 'kotlinskidev-footer__top';

function kotlinskidev_content_visibility_is_footer_template_part(array $block): bool
{
    return 'core/template-part' === $block['blockName'] && 'footer' === ($block['attrs']['slug'] ?? '');
}

function kotlinskidev_content_visibility_filter_footer(string $block_content): string
{
    if (! kotlinskidev_content_visibility_enabled()) {
        return $block_content;
    }

    return kotlinskidev_content_visibility_add_class($block_content, KOTLINSKIDEV_CONTENT_VISIBILITY_CLASS, KOTLINSKIDEV_CONTENT_VISIBILITY_FOOTER_MATCH_CLASS);
}

function kotlinskidev_content_visibility_is_nested_render($instance): bool
{
    return is_object($instance) && null !== ($instance->parent ?? null);
}

function kotlinskidev_content_visibility_filter_block($block_content, $block, $instance = null)
{
    if (! is_string($block_content) || empty($block['blockName'])) {
        return $block_content;
    }

    if (kotlinskidev_content_visibility_is_footer_template_part($block)) {
        return kotlinskidev_content_visibility_filter_footer($block_content);
    }

    if ('core/template-part' === $block['blockName']) {
        return $block_content;
    }

    if (! doing_filter('the_content') || kotlinskidev_content_visibility_is_nested_render($instance)) {
        return $block_content;
    }

    if (! kotlinskidev_content_visibility_enabled() || get_the_ID() !== get_queried_object_id()) {
        return $block_content;
    }

    $position = kotlinskidev_content_visibility_state();
    if (0 === $position) {
        return $block_content;
    }

    $post         = get_post();
    $post_content = $post instanceof WP_Post ? (string) $post->post_content : '';

    if (kotlinskidev_content_visibility_should_skip($block, $block_content, kotlinskidev_get_above_fold_block_names(), $post_content)) {
        return $block_content;
    }

    return kotlinskidev_content_visibility_add_class($block_content);
}

function kotlinskidev_content_visibility_reset(): void
{
    kotlinskidev_content_visibility_state(true);
}

add_filter('render_block', 'kotlinskidev_content_visibility_filter_block', 20, 3);
add_action('wp', 'kotlinskidev_content_visibility_reset');
