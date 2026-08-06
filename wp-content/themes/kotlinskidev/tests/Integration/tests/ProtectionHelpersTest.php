<?php

uses(Tests\Integration\TestCase::class);

it('generates a real RSA key pair with PEM headers', function () {
    $keys = kotlinskidev_generate_rsa_keys();

    expect($keys)->toBeArray();
    expect($keys['private_key'])->toContain('PRIVATE KEY');
    expect($keys['public_key'])->toContain('PUBLIC KEY');
});

it('round-trips real content through encryption and decryption', function () {
    delete_option('kotlinskidev_private_key');
    delete_option('kotlinskidev_public_key');

    $encrypted = kotlinskidev_encrypt_content('secret@example.com');
    $decrypted = kotlinskidev_decrypt_content($encrypted);

    expect($decrypted)->toBe('secret@example.com');
});

it('adds the kotlinskidev block category once and does not duplicate it', function () {
    kotlinskidev_register_protected_content_block();

    $categories = apply_filters('block_categories_all', [['slug' => 'text', 'title' => 'Text']]);
    $slugs = array_column($categories, 'slug');

    expect($slugs)->toContain('kotlinskidev');
    expect(array_count_values($slugs)['kotlinskidev'])->toBe(1);

    $categories_again = apply_filters('block_categories_all', $categories);
    $slugs_again = array_column($categories_again, 'slug');
    expect(array_count_values($slugs_again)['kotlinskidev'])->toBe(1);
});

it('protects inline content via the [protect] shortcode', function () {
    $html = do_shortcode('[protect type="email"]secret@example.com[/protect]');

    expect($html)->toContain('<span class="protected-content protected-content--email"');
    expect($html)->toContain('data-protected="true"');
    expect($html)->toContain('data-protection-type="email"');
});

it('renders nothing for an empty shortcode body', function () {
    expect(do_shortcode('[protect type="email"][/protect]'))->toBe('');
});

it('uses the configured tag for the shortcode wrapper', function () {
    $html = do_shortcode('[protect type="text" tag="div"]hidden[/protect]');

    expect($html)->toStartWith('<div class="protected-content protected-content--text"');
    expect($html)->toEndWith('</div>');
});

it('replaces a plain-text email in content with a protected span when auto-protect is enabled', function () {
    update_option('kotlinskidev_auto_protect_emails', true);
    update_option('kotlinskidev_auto_protect_phones', false);

    $html = kotlinskidev_add_protection_to_content('<p>Contact us at hello@example.com for details.</p>');

    expect($html)->toContain('protected-content--email');
    expect($html)->not->toContain('hello@example.com');

    delete_option('kotlinskidev_auto_protect_emails');
});

it('replaces a mailto link with a protected span when auto-protect is enabled', function () {
    update_option('kotlinskidev_auto_protect_emails', true);

    $html = kotlinskidev_add_protection_to_content('<p><a href="mailto:hello@example.com">Email us</a></p>');

    expect($html)->toContain('protected-content--email');
    expect($html)->not->toContain('mailto:');

    delete_option('kotlinskidev_auto_protect_emails');
});

it('leaves content unchanged when no auto-protection option is enabled', function () {
    delete_option('kotlinskidev_auto_protect_emails');
    delete_option('kotlinskidev_auto_protect_phones');

    $original = '<p>Contact us at hello@example.com.</p>';

    expect(kotlinskidev_add_protection_to_content($original))->toBe($original);
});

it('registers content-protection filters only when auto-protection is enabled', function () {
    remove_all_filters('the_content');
    update_option('kotlinskidev_auto_protect_emails', true);

    kotlinskidev_maybe_add_auto_protection();

    expect(has_filter('the_content', 'kotlinskidev_add_protection_to_content'))->not->toBeFalse();

    delete_option('kotlinskidev_auto_protect_emails');
    remove_filter('the_content', 'kotlinskidev_add_protection_to_content');
});

it('does not register content-protection filters when auto-protection is disabled', function () {
    remove_all_filters('the_content');
    delete_option('kotlinskidev_auto_protect_emails');
    delete_option('kotlinskidev_auto_protect_phones');

    kotlinskidev_maybe_add_auto_protection();

    expect(has_filter('the_content', 'kotlinskidev_add_protection_to_content'))->toBeFalse();
});

it('registers the content protection settings page for a user who can manage options', function () {
    $admin_id = self::factory()->user->create(['role' => 'administrator']);
    wp_set_current_user($admin_id);

    kotlinskidev_admin_protection_settings();

    global $submenu;
    $found = false;
    foreach ($submenu['options-general.php'] ?? [] as $item) {
        if ($item[2] === 'kotlinskidev-protection') {
            $found = true;
        }
    }
    expect($found)->toBeTrue();

    wp_set_current_user(0);
});

it('renders the protection settings page with the current status for an admin', function () {
    $admin_id = self::factory()->user->create(['role' => 'administrator']);
    wp_set_current_user($admin_id);

    ob_start();
    kotlinskidev_protection_settings_page();
    $html = ob_get_clean();

    expect($html)->toContain('Content Protection Settings');
    expect($html)->toContain('name="auto_protect_emails"');

    wp_set_current_user(0);
});

it('saves protection settings on POST with a valid nonce and admin capability', function () {
    $admin_id = self::factory()->user->create(['role' => 'administrator']);
    wp_set_current_user($admin_id);

    $nonce = wp_create_nonce('kotlinskidev_protection_settings_action');
    $_POST['submit'] = '1';
    $_POST['kotlinskidev_protection_settings_nonce'] = $nonce;
    $_POST['auto_protect_emails'] = '1';

    ob_start();
    kotlinskidev_protection_settings_page();
    $html = ob_get_clean();

    expect($html)->toContain('Settings saved!');
    expect((bool) get_option('kotlinskidev_auto_protect_emails'))->toBeTrue();
    expect((bool) get_option('kotlinskidev_auto_protect_phones'))->toBeFalse();

    unset($_POST['submit'], $_POST['kotlinskidev_protection_settings_nonce'], $_POST['auto_protect_emails']);
    delete_option('kotlinskidev_auto_protect_emails');
    wp_set_current_user(0);
});
