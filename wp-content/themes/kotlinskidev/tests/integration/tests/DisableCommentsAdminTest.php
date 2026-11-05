<?php

uses(Tests\Integration\TestCase::class);

it('removes the xmlrpc comment methods', function () {
    $methods = kotlinskidev_disable_xmlrpc_comments([
        'wp.newComment' => 'fn',
        'wp.editComment' => 'fn',
        'wp.deleteComment' => 'fn',
        'wp.getComments' => 'fn',
        'wp.getComment' => 'fn',
        'wp.getPost' => 'fn',
    ]);

    expect($methods)->toBe(['wp.getPost' => 'fn']);
});

it('removes comment and trackback support from every post type that has it', function () {
    add_post_type_support('post', 'comments');
    add_post_type_support('post', 'trackbacks');

    kotlinskidev_remove_comment_support();

    expect(post_type_supports('post', 'comments'))->toBeFalse();
    expect(post_type_supports('post', 'trackbacks'))->toBeFalse();
});

it('removes the comments admin menu page', function () {
    global $menu;
    $menu = [['Comments', 'edit_posts', 'edit-comments.php']];

    kotlinskidev_remove_comments_menu();

    $slugs = array_column($menu, 2);
    expect($slugs)->not->toContain('edit-comments.php');
});
