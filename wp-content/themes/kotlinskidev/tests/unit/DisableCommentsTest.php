<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/disable-comments.php';

beforeEach(function () {
    Functions\when('esc_html__')->alias(fn ($t) => $t);
});

it('always reports comments/pings as closed', function () {
    expect(kotlinskidev_disable_comments())->toBeFalse();
});

it('removes only the comment-related xmlrpc methods', function () {
    $methods = [
        'wp.newComment' => 'a',
        'wp.editComment' => 'b',
        'wp.deleteComment' => 'c',
        'wp.getComments' => 'd',
        'wp.getComment' => 'e',
        'wp.getPost' => 'keep',
    ];

    expect(kotlinskidev_disable_xmlrpc_comments($methods))->toBe(['wp.getPost' => 'keep']);
});

it('removes comment and trackback support only from post types that currently support comments', function () {
    Functions\when('get_post_types')->justReturn(['post', 'page', 'attachment']);
    Functions\when('post_type_supports')->alias(fn ($type, $feature) => $type !== 'attachment');
    $removed = [];
    Functions\when('remove_post_type_support')->alias(function ($type, $feature) use (&$removed) {
        $removed[] = "{$type}:{$feature}";
    });

    kotlinskidev_remove_comment_support();

    expect($removed)->toBe(['post:comments', 'post:trackbacks', 'page:comments', 'page:trackbacks']);
});

it('removes the comments admin menu page', function () {
    Functions\expect('remove_menu_page')->once()->with('edit-comments.php');

    kotlinskidev_remove_comments_menu();
});

it('removes the comments node from the admin bar', function () {
    global $wp_admin_bar;
    $removed = [];
    $wp_admin_bar = new class ($removed) {
        public array $removed = [];
        public function remove_menu($id)
        {
            $this->removed[] = $id;
        }
    };

    kotlinskidev_remove_comments_admin_bar();

    expect($wp_admin_bar->removed)->toBe(['comments']);
});

class KotlinskidevTestCommentDieException extends Exception
{
}

it('halts comment submission with a 403 error', function () {
    Functions\when('wp_die')->alias(function ($message) {
        throw new KotlinskidevTestCommentDieException($message);
    });

    expect(fn () => kotlinskidev_block_comment_submission())
        ->toThrow(KotlinskidevTestCommentDieException::class, 'Comments are disabled on this site.');
});
