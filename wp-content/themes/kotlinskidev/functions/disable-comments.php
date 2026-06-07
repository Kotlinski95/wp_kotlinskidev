<?php
add_action('init', 'kotlinskidev_maybe_disable_comments');

function kotlinskidev_maybe_disable_comments(): void
{
    if (!(bool) get_option('kotlinskidev_disable_comments', true)) {
        return;
    }

    add_filter('comments_open', 'kotlinskidev_disable_comments', 20, 2);
    add_filter('pings_open', 'kotlinskidev_disable_comments', 20, 2);
    add_filter('preprocess_comment', 'kotlinskidev_block_comment_submission');
    add_filter('xmlrpc_methods', 'kotlinskidev_disable_xmlrpc_comments');
    add_action('admin_init', 'kotlinskidev_remove_comment_support');
    add_action('admin_menu', 'kotlinskidev_remove_comments_menu');
    add_action('wp_before_admin_bar_render', 'kotlinskidev_remove_comments_admin_bar');
}

function kotlinskidev_disable_comments(): bool
{
    return false;
}

function kotlinskidev_block_comment_submission(): never
{
    wp_die(
        esc_html__('Comments are disabled on this site.', 'kotlinskidev'),
        esc_html__('Comments Disabled', 'kotlinskidev'),
        ['response' => 403, 'back_link' => true]
    );
}

function kotlinskidev_disable_xmlrpc_comments(array $methods): array
{
    unset($methods['wp.newComment'], $methods['wp.editComment'], $methods['wp.deleteComment'], $methods['wp.getComments'], $methods['wp.getComment']);
    return $methods;
}

function kotlinskidev_remove_comment_support(): void
{
    foreach (get_post_types() as $post_type) {
        if (post_type_supports($post_type, 'comments')) {
            remove_post_type_support($post_type, 'comments');
            remove_post_type_support($post_type, 'trackbacks');
        }
    }
}

function kotlinskidev_remove_comments_menu(): void
{
    remove_menu_page('edit-comments.php');
}

function kotlinskidev_remove_comments_admin_bar(): void
{
    global $wp_admin_bar;
    $wp_admin_bar->remove_menu('comments');
}
