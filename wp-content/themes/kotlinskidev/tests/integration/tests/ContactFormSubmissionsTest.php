<?php

uses(Tests\Integration\TestCase::class);

beforeEach(function () {
    kotlinskidev_contact_submissions_maybe_create_table();

    global $wpdb;
    $wpdb->query('DELETE FROM ' . kotlinskidev_contact_submissions_table_name());
});

it('creates the contact submissions table', function () {
    global $wpdb;
    $table = kotlinskidev_contact_submissions_table_name();

    expect($wpdb->get_var("SHOW TABLES LIKE '{$table}'"))->toBe($table);
});

it('saves a submission with every field persisted correctly', function () {
    $submission_id = kotlinskidev_save_contact_submission([
        'post_id' => 42,
        'name'    => 'Jane Doe',
        'email'   => 'jane@example.com',
        'topic'   => 'Pricing',
        'message' => "Line one.\nLine two.",
        'agree'   => true,
    ]);

    global $wpdb;
    $row = $wpdb->get_row(
        $wpdb->prepare(
            'SELECT * FROM ' . kotlinskidev_contact_submissions_table_name() . ' WHERE id = %d',
            $submission_id
        )
    );

    expect((int) $row->post_id)->toBe(42);
    expect($row->name)->toBe('Jane Doe');
    expect($row->email)->toBe('jane@example.com');
    expect($row->topic)->toBe('Pricing');
    expect($row->message)->toBe("Line one.\nLine two.");
    expect((int) $row->agree)->toBe(1);
    expect((int) $row->email_sent)->toBe(0);
    expect($row->read_at)->toBeNull();
});

it('stores a null post_id when none is provided', function () {
    $submission_id = kotlinskidev_save_contact_submission([
        'name'    => 'No Referer',
        'email'   => 'noreferer@example.com',
        'message' => 'No post id available.',
        'agree'   => false,
    ]);

    global $wpdb;
    $row = $wpdb->get_row(
        $wpdb->prepare(
            'SELECT * FROM ' . kotlinskidev_contact_submissions_table_name() . ' WHERE id = %d',
            $submission_id
        )
    );

    expect($row->post_id)->toBeNull();
    expect((int) $row->agree)->toBe(0);
});

it('marks a submission as email_sent', function () {
    $submission_id = kotlinskidev_save_contact_submission([
        'name'    => 'Sent Test',
        'email'   => 'sent@example.com',
        'message' => 'Should be marked sent.',
        'agree'   => true,
    ]);

    kotlinskidev_mark_contact_submission_email_status($submission_id, true);

    global $wpdb;
    $row = $wpdb->get_row(
        $wpdb->prepare(
            'SELECT email_sent FROM ' . kotlinskidev_contact_submissions_table_name() . ' WHERE id = %d',
            $submission_id
        )
    );

    expect((int) $row->email_sent)->toBe(1);
});

it('marks a submission as email delivery failed', function () {
    $submission_id = kotlinskidev_save_contact_submission([
        'name'    => 'Failed Test',
        'email'   => 'failed@example.com',
        'message' => 'Should be marked failed.',
        'agree'   => true,
    ]);

    kotlinskidev_mark_contact_submission_email_status($submission_id, false);

    global $wpdb;
    $row = $wpdb->get_row(
        $wpdb->prepare(
            'SELECT email_sent FROM ' . kotlinskidev_contact_submissions_table_name() . ' WHERE id = %d',
            $submission_id
        )
    );

    expect((int) $row->email_sent)->toBe(0);
});

it('counts unread submissions', function () {
    kotlinskidev_save_contact_submission([
        'name'    => 'Unread One',
        'email'   => 'one@example.com',
        'message' => 'Unread.',
        'agree'   => true,
    ]);
    kotlinskidev_save_contact_submission([
        'name'    => 'Unread Two',
        'email'   => 'two@example.com',
        'message' => 'Unread.',
        'agree'   => true,
    ]);

    expect(kotlinskidev_contact_submissions_unread_count())->toBe(2);
});

it('excludes read submissions from the unread count', function () {
    $submission_id = kotlinskidev_save_contact_submission([
        'name'    => 'Read Test',
        'email'   => 'read@example.com',
        'message' => 'Will be marked read.',
        'agree'   => true,
    ]);

    global $wpdb;
    $wpdb->update(
        kotlinskidev_contact_submissions_table_name(),
        ['read_at' => current_time('mysql')],
        ['id' => $submission_id],
        ['%s'],
        ['%d']
    );

    expect(kotlinskidev_contact_submissions_unread_count())->toBe(0);
});

it('marks a submission as read the first time its detail view renders', function () {
    $submission_id = kotlinskidev_save_contact_submission([
        'name'    => 'View Me',
        'email'   => 'viewme@example.com',
        'message' => 'Detail view test.',
        'agree'   => true,
    ]);

    expect(kotlinskidev_contact_submissions_unread_count())->toBe(1);

    ob_start();
    kotlinskidev_render_contact_submission_detail($submission_id);
    ob_get_clean();

    expect(kotlinskidev_contact_submissions_unread_count())->toBe(0);
});

it('does not reset the read timestamp on a second detail view render', function () {
    $submission_id = kotlinskidev_save_contact_submission([
        'name'    => 'View Twice',
        'email'   => 'viewtwice@example.com',
        'message' => 'Detail view test.',
        'agree'   => true,
    ]);

    ob_start();
    kotlinskidev_render_contact_submission_detail($submission_id);
    ob_get_clean();

    global $wpdb;
    $first_read_at = $wpdb->get_var(
        $wpdb->prepare(
            'SELECT read_at FROM ' . kotlinskidev_contact_submissions_table_name() . ' WHERE id = %d',
            $submission_id
        )
    );

    sleep(1);

    ob_start();
    kotlinskidev_render_contact_submission_detail($submission_id);
    ob_get_clean();

    $second_read_at = $wpdb->get_var(
        $wpdb->prepare(
            'SELECT read_at FROM ' . kotlinskidev_contact_submissions_table_name() . ' WHERE id = %d',
            $submission_id
        )
    );

    expect($second_read_at)->toBe($first_read_at);
});

it('renders a not-found message for a nonexistent submission id', function () {
    ob_start();
    kotlinskidev_render_contact_submission_detail(999999);
    $output = ob_get_clean();

    expect($output)->toContain('Submission not found.');
});
