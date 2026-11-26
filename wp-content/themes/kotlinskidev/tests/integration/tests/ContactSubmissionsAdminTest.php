<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_test_normalize_markup(string $markup): string
{
    return trim((string) preg_replace('/\s+/', ' ', $markup));
}

function kotlinskidev_test_assert_golden(string $name, string $actual): void
{
    $path       = __DIR__ . '/../fixtures/' . $name . '.html';
    $normalized = kotlinskidev_test_normalize_markup($actual);

    if (getenv('UPDATE_GOLDEN') === '1') {
        file_put_contents($path, $normalized . "\n");
    }

    expect($normalized . "\n")->toBe((string) file_get_contents($path));
}

function kotlinskidev_test_insert_submission(array $overrides = []): int
{
    global $wpdb;

    $wpdb->insert(
        kotlinskidev_contact_submissions_table_name(),
        array_merge(
            [
                'post_id'      => null,
                'name'         => 'Jane <b>Doe</b>',
                'email'        => 'jane@example.com',
                'topic'        => 'Pricing & scope',
                'message'      => "Line one <script>x</script>\nLine two",
                'agree'        => 1,
                'attachments'  => null,
                'email_sent'   => 1,
                'submitted_at' => '2026-01-02 03:04:05',
                'read_at'      => null,
            ],
            $overrides
        )
    );

    return (int) $wpdb->insert_id;
}

function kotlinskidev_test_reset_admin_request(): void
{
    $_GET  = [];
    $_POST = [];
    unset($_REQUEST['action'], $_REQUEST['action2']);
}

function kotlinskidev_test_throwing_die_handler(): void
{
    throw new RuntimeException('wp_die');
}

function kotlinskidev_test_return_throwing_die_handler(): callable
{
    return 'kotlinskidev_test_throwing_die_handler';
}

beforeEach(function () {
    $this->originalRequestUri = $_SERVER['REQUEST_URI'] ?? '';
    $_SERVER['REQUEST_URI']   = '/wp-admin/admin.php';
    add_filter('wp_die_handler', 'kotlinskidev_test_return_throwing_die_handler', PHP_INT_MAX);
    kotlinskidev_contact_submissions_maybe_create_table();

    global $wpdb;
    $wpdb->query('DELETE FROM ' . kotlinskidev_contact_submissions_table_name());
    kotlinskidev_test_reset_admin_request();
    set_current_screen('toplevel_page_kotlinskidev-contact-submissions');
});

afterEach(function () {
    $_SERVER['REQUEST_URI'] = $this->originalRequestUri;
    remove_filter('wp_die_handler', 'kotlinskidev_test_return_throwing_die_handler', PHP_INT_MAX);
    kotlinskidev_test_reset_admin_request();
});

it('registers the submissions hooks', function () {
    expect(has_action('after_switch_theme', 'kotlinskidev_contact_submissions_maybe_create_table'))->toBe(10);
    expect(has_action('admin_init', 'kotlinskidev_contact_submissions_maybe_create_table'))->toBe(10);
    expect(has_action('admin_menu', 'kotlinskidev_register_contact_submissions_page'))->toBe(10);
    expect(has_action('admin_post_kotlinskidev_delete_contact_submission', 'kotlinskidev_handle_delete_contact_submission'))->toBe(10);
});

it('exposes table name and db version', function () {
    global $wpdb;

    expect(kotlinskidev_contact_submissions_table_name())->toBe($wpdb->prefix . 'kotlinskidev_contact_submissions');
    expect(kotlinskidev_contact_submissions_db_version())->toBe('1.1');
});

it('builds a nonce protected delete link', function () {
    $url = kotlinskidev_render_contact_submission_delete_link(7);

    expect($url)->toContain('admin-post.php?action=kotlinskidev_delete_contact_submission&amp;id=7');
    expect($url)->toContain('_wpnonce=' . wp_create_nonce('kotlinskidev_delete_contact_submission_7'));
});

it('registers the admin menu page with an unread badge', function () {
    global $menu;
    $menu = [];
    kotlinskidev_test_insert_submission();
    kotlinskidev_test_insert_submission();
    wp_set_current_user(self::factory()->user->create(['role' => 'administrator']));

    kotlinskidev_register_contact_submissions_page();

    $entry = array_values(array_filter($menu, static fn (array $item): bool => 'kotlinskidev-contact-submissions' === $item[2]))[0];
    expect($entry[1])->toBe('manage_options');
    expect($entry[0])->toBe('Submissions <span class="awaiting-mod count-2"><span class="pending-count">2</span></span>');
    expect($entry[6])->toBe('dashicons-email-alt');
});

it('denies the submissions page to users without manage_options', function () {
    wp_set_current_user(self::factory()->user->create(['role' => 'editor']));

    expect(fn () => kotlinskidev_render_contact_submissions_page())->toThrow(RuntimeException::class);
});

it('routes the page to the detail view for action=view with an id', function () {
    wp_set_current_user(self::factory()->user->create(['role' => 'administrator']));
    $id = kotlinskidev_test_insert_submission();
    $_GET = ['action' => 'view', 'id' => (string) $id];

    ob_start();
    kotlinskidev_render_contact_submissions_page();
    $output = ob_get_clean();

    expect($output)->toContain('Submission Details');
});

it('routes the page to the list view otherwise', function () {
    wp_set_current_user(self::factory()->user->create(['role' => 'administrator']));
    $_GET = ['action' => 'view'];

    ob_start();
    kotlinskidev_render_contact_submissions_page();
    $output = ob_get_clean();

    expect($output)->toContain('Contact Form Submissions');
});

it('renders the detail view with escaped values, attachments and source post', function () {
    wp_set_current_user(self::factory()->user->create(['role' => 'administrator']));
    $post_id = self::factory()->post->create(['post_title' => 'Source <i>Page</i>', 'post_name' => 'source-page']);
    $id      = kotlinskidev_test_insert_submission([
        'post_id'     => $post_id,
        'attachments' => wp_json_encode([['name' => 'cv.pdf', 'size' => 2048, 'sha256' => 'abc123']]),
    ]);

    ob_start();
    kotlinskidev_render_contact_submission_detail($id);
    $output = ob_get_clean();

    $output = preg_replace(['/\?p=\d+/', '/&#038;id=\d+/'], ['?p=POSTID', '&#038;id=SUBID'], $output);
    $output = preg_replace('/_wpnonce=[a-f0-9]+/', '_wpnonce=NONCE', $output);
    $output = preg_replace('#http://[^/"]+#', 'http://HOST', $output);
    kotlinskidev_test_assert_golden('contact-submission-detail-full', $output);
});

it('renders the detail view for a failed, disagreeing submission without attachments', function () {
    wp_set_current_user(self::factory()->user->create(['role' => 'administrator']));
    $id = kotlinskidev_test_insert_submission(['agree' => 0, 'email_sent' => 0]);

    ob_start();
    kotlinskidev_render_contact_submission_detail($id);
    $output = ob_get_clean();

    $output = preg_replace('/&#038;id=\d+/', '&#038;id=SUBID', $output);
    $output = preg_replace('/_wpnonce=[a-f0-9]+/', '_wpnonce=NONCE', $output);
    $output = preg_replace('#http://[^/"]+#', 'http://HOST', $output);
    kotlinskidev_test_assert_golden('contact-submission-detail-minimal', $output);
});

it('renders the list view with filter links and the table', function () {
    wp_set_current_user(self::factory()->user->create(['role' => 'administrator']));
    kotlinskidev_test_insert_submission();
    $_GET = ['status' => 'unread'];

    ob_start();
    kotlinskidev_render_contact_submissions_list();
    $output = ob_get_clean();

    $output = preg_replace('/_wpnonce" value="[a-f0-9]+"/', '_wpnonce" value="NONCE"', $output);
    $output = preg_replace('/cb-select-all-\d+/', 'cb-select-all-N', $output);
    $output = preg_replace('/id=\d+/', 'id=N', $output);
    $output = preg_replace('/value="\d+" \/>/', 'value="N" />', $output);
    $output = preg_replace('/_wpnonce=[a-f0-9]+/', '_wpnonce=NONCE', $output);
    $output = preg_replace('#http://[^/"\']+#', 'http://HOST', $output);
    kotlinskidev_test_assert_golden('contact-submission-list-unread', $output);
});

it('describes the list table columns, sortable columns and bulk actions', function () {
    $table = new Kotlinskidev_Contact_Submissions_List_Table();

    expect(array_keys($table->get_columns()))->toBe(['cb', 'status', 'name', 'email', 'topic', 'message', 'submitted_at']);

    $reflection = new ReflectionClass($table);
    $sortable   = $reflection->getMethod('get_sortable_columns');
    $bulk       = $reflection->getMethod('get_bulk_actions');
    $sortable->setAccessible(true);
    $bulk->setAccessible(true);

    expect($sortable->invoke($table))->toBe(['submitted_at' => ['submitted_at', true], 'name' => ['name', false]]);
    expect($bulk->invoke($table))->toBe(['bulk-delete' => 'Delete']);
});

function kotlinskidev_test_invoke_column(Kotlinskidev_Contact_Submissions_List_Table $table, string $method, array $arguments): string
{
    $reflection = new ReflectionMethod($table, $method);
    $reflection->setAccessible(true);

    return $reflection->invokeArgs($table, $arguments);
}

it('renders list table cells', function () {
    $table = new Kotlinskidev_Contact_Submissions_List_Table();
    $unread = (object) [
        'id' => 5, 'read_at' => null, 'email_sent' => 0, 'name' => 'A <b>', 'email' => 'a@x.io', 'topic' => 'T&T',
        'message' => str_repeat('é', 81), 'submitted_at' => '2026-01-02 03:04:05',
    ];
    $read = (object) array_merge((array) $unread, ['read_at' => '2026-01-03 00:00:00', 'email_sent' => 1, 'message' => 'short']);

    expect(kotlinskidev_test_invoke_column($table, 'column_cb', [$unread]))->toBe('<input type="checkbox" name="submission[]" value="5" />');
    expect(kotlinskidev_test_invoke_column($table, 'column_status', [$unread]))->toBe(
        '<span class="dashicons dashicons-marker" style="color:#2271b1;" title="Unread"></span> <span title="Email delivery failed">⚠️</span>'
    );
    expect(kotlinskidev_test_invoke_column($table, 'column_status', [$read]))->toBe('<span title="Emailed successfully">✅</span>');
    expect(kotlinskidev_test_invoke_column($table, 'column_default', [$unread, 'email']))->toBe('a@x.io');
    expect(kotlinskidev_test_invoke_column($table, 'column_default', [$unread, 'topic']))->toBe('T&amp;T');
    expect(kotlinskidev_test_invoke_column($table, 'column_default', [$unread, 'message']))->toBe(str_repeat('é', 80) . '…');
    expect(kotlinskidev_test_invoke_column($table, 'column_default', [$read, 'message']))->toBe('short');
    expect(kotlinskidev_test_invoke_column($table, 'column_default', [$unread, 'submitted_at']))->toBe('2026-01-02 03:04');
    expect(kotlinskidev_test_invoke_column($table, 'column_default', [$unread, 'unknown']))->toBe('');

    $name_unread = kotlinskidev_test_invoke_column($table, 'column_name', [$unread]);
    $name_read   = kotlinskidev_test_invoke_column($table, 'column_name', [$read]);
    expect($name_unread)->toContain('<strong>A &lt;b&gt;</strong>');
    expect($name_read)->not->toContain('<strong>');
    expect($name_unread)->toContain('action=view');
    expect($name_unread)->toContain('kotlinskidev_delete_contact_submission');
    expect($name_unread)->toContain('Delete this submission permanently?');
});

it('filters, sorts and paginates items in prepare_items', function () {
    $sent_old   = kotlinskidev_test_insert_submission(['name' => 'Bravo', 'email_sent' => 1, 'submitted_at' => '2026-01-01 00:00:00', 'read_at' => '2026-01-02 00:00:00']);
    $failed_new = kotlinskidev_test_insert_submission(['name' => 'Alpha', 'email_sent' => 0, 'submitted_at' => '2026-02-01 00:00:00']);

    $collect = static function (array $query): array {
        $_GET  = $query;
        $table = new Kotlinskidev_Contact_Submissions_List_Table();
        $table->prepare_items();

        return [array_map(static fn ($row): int => (int) $row->id, $table->items), $table->get_pagination_arg('total_items'), $table->get_pagination_arg('total_pages')];
    };

    expect($collect([]))->toBe([[$failed_new, $sent_old], 2, 1]);
    expect($collect(['status' => 'sent']))->toBe([[$sent_old], 1, 1]);
    expect($collect(['status' => 'failed']))->toBe([[$failed_new], 1, 1]);
    expect($collect(['status' => 'unread']))->toBe([[$failed_new], 1, 1]);
    expect($collect(['orderby' => 'name', 'order' => 'asc']))->toBe([[$failed_new, $sent_old], 2, 1]);
    expect($collect(['orderby' => 'name', 'order' => 'desc']))->toBe([[$sent_old, $failed_new], 2, 1]);
    expect($collect(['orderby' => 'submitted_at', 'order' => 'ASC']))->toBe([[$sent_old, $failed_new], 2, 1]);
    expect($collect(['orderby' => 'id; DROP TABLE x']))->toBe([[$failed_new, $sent_old], 2, 1]);
});

it('bulk deletes only when the action, nonce and capability are present', function () {
    $first  = kotlinskidev_test_insert_submission();
    $second = kotlinskidev_test_insert_submission();
    $third  = kotlinskidev_test_insert_submission();
    $count  = static function (): int {
        global $wpdb;

        return (int) $wpdb->get_var('SELECT COUNT(*) FROM ' . kotlinskidev_contact_submissions_table_name());
    };

    $table = new Kotlinskidev_Contact_Submissions_List_Table();
    $table->process_bulk_action();
    expect($count())->toBe(3);

    $_REQUEST['action'] = 'bulk-delete';
    $_POST['submission'] = [(string) $first];
    expect(fn () => $table->process_bulk_action())->toThrow(RuntimeException::class);
    expect($count())->toBe(3);

    wp_set_current_user(self::factory()->user->create(['role' => 'editor']));
    $_REQUEST['_wpnonce'] = wp_create_nonce('bulk-submissions');
    $table->process_bulk_action();
    expect($count())->toBe(3);

    wp_set_current_user(self::factory()->user->create(['role' => 'administrator']));
    $_REQUEST['_wpnonce'] = wp_create_nonce('bulk-submissions');
    $_POST['submission'] = [];
    $table->process_bulk_action();
    expect($count())->toBe(3);

    $_POST['submission'] = [(string) $first, (string) $second];
    $table->process_bulk_action();
    expect($count())->toBe(1);
    unset($_REQUEST['_wpnonce'], $third);
});

it('refuses to delete a submission without the capability or a valid nonce', function () {
    $id = kotlinskidev_test_insert_submission();
    $_GET = ['id' => (string) $id];

    wp_set_current_user(self::factory()->user->create(['role' => 'editor']));
    expect(fn () => kotlinskidev_handle_delete_contact_submission())->toThrow(RuntimeException::class);

    wp_set_current_user(self::factory()->user->create(['role' => 'administrator']));
    expect(fn () => kotlinskidev_handle_delete_contact_submission())->toThrow(RuntimeException::class);

    global $wpdb;
    expect((int) $wpdb->get_var('SELECT COUNT(*) FROM ' . kotlinskidev_contact_submissions_table_name()))->toBe(1);
});
