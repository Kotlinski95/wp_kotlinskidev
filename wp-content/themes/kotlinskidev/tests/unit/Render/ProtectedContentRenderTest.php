<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/protection-helpers.php';

function kotlinskidev_protected_content_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/protected-content/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ($extra['class'] ?? '') . '"'
    );
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('wp_kses_post')->alias(fn ($t) => $t);
    Functions\when('sanitize_html_class')->alias(fn ($t) => $t);
    Functions\when('wp_strip_all_tags')->alias(fn ($t) => strip_tags($t));
    Functions\when('get_option')->justReturn(false);
});

it('renders nothing for empty content', function () {
    expect(kotlinskidev_protected_content_render(['content' => '']))->toBe('');
});

it('renders unprotected content directly, escaped through wp_kses_post', function () {
    $html = kotlinskidev_protected_content_render(['content' => '<b>Hello</b>', 'tagName' => 'span']);

    expect($html)->toBe('<span class="protected-content"><b>Hello</b></span>');
});

it('falls back to the p tag for an unrecognized tagName', function () {
    $html = kotlinskidev_protected_content_render(['content' => 'Hello', 'tagName' => 'script']);

    expect($html)->toBe('<p class="protected-content">Hello</p>');
});

it('renders protected content with encrypted data and the protection-type class', function () {
    $html = kotlinskidev_protected_content_render([
        'content' => 'secret@example.test',
        'useProtection' => true,
        'protectionType' => 'email',
        'tagName' => 'span',
    ]);

    expect($html)->toContain('class="protected-content protected-content--email"');
    expect($html)->toContain('data-protected="true"');
    expect($html)->toContain('data-protection-type="email"');
    expect($html)->toMatch('/data-original-content="[^"]+"/');
    expect($html)->not->toContain('secret@example.test');
});

it('strips html tags before encrypting email/phone content', function () {
    $keys = kotlinskidev_generate_rsa_keys();
    Functions\when('get_option')->alias(fn ($name, $default = false) => match ($name) {
        'kotlinskidev_private_key' => $keys['private_key'],
        'kotlinskidev_public_key' => $keys['public_key'],
        default => $default,
    });
    Functions\when('wp_strip_all_tags')->alias(fn ($t) => strip_tags($t));

    $html = kotlinskidev_protected_content_render([
        'content' => '<b>555-1234</b>',
        'useProtection' => true,
        'protectionType' => 'phone',
    ]);

    preg_match('/data-original-content="([^"]+)"/', $html, $matches);

    expect(kotlinskidev_decrypt_content($matches[1]))->toBe('555-1234');
});
