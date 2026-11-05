<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/page-view-tracking.php';

beforeEach(function () {
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
});

it('returns 0 page views when no meta is stored', function () {
    Functions\when('get_post_meta')->justReturn('');

    expect(kotlinskidev_get_page_views(5))->toBe(0);
});

it('returns the stored view count as an integer', function () {
    Functions\when('get_post_meta')->justReturn('42');

    expect(kotlinskidev_get_page_views(5))->toBe(42);
});

it('outputs a formatted number for the page_views column when there are views', function () {
    Functions\when('get_post_meta')->justReturn('1234');

    ob_start();
    kotlinskidev_show_views_column('page_views', 5);
    $output = ob_get_clean();

    expect($output)->toBe('1,234');
});

it('outputs an em dash for the page_views column when there are no views', function () {
    Functions\when('get_post_meta')->justReturn('');

    ob_start();
    kotlinskidev_show_views_column('page_views', 5);
    $output = ob_get_clean();

    expect($output)->toBe('—');
});

it('outputs nothing for a column it does not handle', function () {
    ob_start();
    kotlinskidev_show_views_column('author', 5);
    $output = ob_get_clean();

    expect($output)->toBe('');
});

it('does nothing to the query orderby outside of the admin', function () {
    Functions\when('is_admin')->justReturn(false);

    $query = new class {
        public array $set = [];
        public function get($key)
        {
            return '_kotlinskidev_page_views';
        }
        public function set($key, $value)
        {
            $this->set[$key] = $value;
        }
    };

    kotlinskidev_views_column_orderby($query);

    expect($query->set)->toBe([]);
});

it('leaves an unrelated orderby untouched in the admin', function () {
    Functions\when('is_admin')->justReturn(true);

    $query = new class {
        public array $set = [];
        public function get($key)
        {
            return 'date';
        }
        public function set($key, $value)
        {
            $this->set[$key] = $value;
        }
    };

    kotlinskidev_views_column_orderby($query);

    expect($query->set)->toBe([]);
});

it('rewires the page-views orderby to a numeric meta sort in the admin', function () {
    Functions\when('is_admin')->justReturn(true);

    $query = new class {
        public array $set = [];
        public function get($key)
        {
            return '_kotlinskidev_page_views';
        }
        public function set($key, $value)
        {
            $this->set[$key] = $value;
        }
    };

    kotlinskidev_views_column_orderby($query);

    expect($query->set)->toBe([
        'meta_key' => '_kotlinskidev_page_views',
        'orderby' => 'meta_value_num',
    ]);
});

class KotlinskidevTestWpDieException extends Exception
{
}

it('halts with a security error when the nonce is missing or invalid', function () {
    $_POST = [];
    Functions\when('wp_verify_nonce')->justReturn(false);
    Functions\when('wp_die')->alias(function ($message) {
        throw new KotlinskidevTestWpDieException($message);
    });

    expect(fn () => kotlinskidev_handle_page_view_tracking())
        ->toThrow(KotlinskidevTestWpDieException::class, 'Security check failed');
});

it('reports an error for an invalid or missing post id', function () {
    $_POST = ['nonce' => 'valid', 'post_id' => 0];
    Functions\when('wp_verify_nonce')->justReturn(true);
    Functions\expect('wp_send_json_error')->once()->with('Invalid post ID');
    Functions\expect('update_post_meta')->never();

    kotlinskidev_handle_page_view_tracking();
});

it('increments the view count and records the last-viewed time for a valid post', function () {
    $_POST = ['nonce' => 'valid', 'post_id' => 7];
    Functions\when('wp_verify_nonce')->justReturn(true);
    Functions\when('get_post')->justReturn((object) ['ID' => 7]);
    Functions\when('get_post_meta')->justReturn('4');
    Functions\when('current_time')->justReturn('2026-01-01 00:00:00');
    Functions\expect('update_post_meta')
        ->once()
        ->with(7, '_kotlinskidev_page_views', 5);
    Functions\expect('update_post_meta')
        ->once()
        ->with(7, '_kotlinskidev_last_viewed', '2026-01-01 00:00:00');
    Functions\expect('wp_send_json_success')->once()->with(['views' => 5, 'post_id' => 7]);

    kotlinskidev_handle_page_view_tracking();
});
