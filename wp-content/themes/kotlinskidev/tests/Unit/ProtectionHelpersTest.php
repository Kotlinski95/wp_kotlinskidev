<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/protection-helpers.php';

beforeEach(function () {
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));
    Functions\when('wp_kses_post')->alias(fn ($t) => $t);
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
    Functions\when('__')->alias(fn ($t) => $t);
});

it('formats a decrypted email as a mailto link', function () {
    $result = kotlinskidev_format_decrypted_content('user@example.test', 'email');

    expect($result)->toBe('<a href="mailto:user@example.test">user@example.test</a>');
});

it('formats a decrypted phone as a tel link, stripping non-numeric characters', function () {
    $result = kotlinskidev_format_decrypted_content('+1 (555) 123-4567', 'phone');

    expect($result)->toBe('<a href="tel:+15551234567">+1 (555) 123-4567</a>');
});

it('passes text, address, and other types through wp_kses_post', function () {
    foreach (['text', 'address', 'other'] as $type) {
        expect(kotlinskidev_format_decrypted_content('<b>Hi</b>', $type))->toBe('<b>Hi</b>');
    }
});

it('escapes unknown protection types as plain html', function () {
    expect(kotlinskidev_format_decrypted_content('<script>x</script>', 'unknown'))
        ->toBe('&lt;script&gt;x&lt;/script&gt;');
});

it('returns the content unchanged when no auto-protection is enabled', function () {
    Functions\when('get_option')->justReturn(false);

    expect(kotlinskidev_protect_output('Hello <a href="mailto:a@b.com">a@b.com</a>'))
        ->toBe('Hello <a href="mailto:a@b.com">a@b.com</a>');
});

describe('RSA encrypt/decrypt round trip', function () {
    beforeEach(function () {
        $keys = kotlinskidev_generate_rsa_keys();
        $GLOBALS['kt_test_keys'] = $keys;

        Functions\when('get_option')->alias(function ($name, $default = false) {
            return match ($name) {
                'kotlinskidev_private_key' => $GLOBALS['kt_test_keys']['private_key'],
                'kotlinskidev_public_key' => $GLOBALS['kt_test_keys']['public_key'],
                default => $default,
            };
        });
    });

    it('decrypts content that was encrypted with the same key pair', function () {
        $encrypted = kotlinskidev_encrypt_content('secret@example.test');

        $decrypted = kotlinskidev_decrypt_content($encrypted);

        expect($decrypted)->toBe('secret@example.test');
    });

    it('returns non-base64, non-encrypted content unchanged', function () {
        expect(kotlinskidev_decrypt_content('not encrypted at all !!'))->toBe('not encrypted at all !!');
    });
});

it('generates and stores a fresh key pair when no keys are saved yet', function () {
    Functions\when('get_option')->alias(
        fn ($name, $default = false) => $name === 'kotlinskidev_key_storage_method' ? $default : false
    );
    Functions\expect('update_option')
        ->once()
        ->with('kotlinskidev_private_key', Mockery::type('string'));
    Functions\expect('update_option')
        ->once()
        ->with('kotlinskidev_public_key', Mockery::type('string'));

    $encrypted = kotlinskidev_encrypt_content('hello');

    expect($encrypted)->not->toBe(base64_encode('hello'));
});

class KotlinskidevTestAjaxHaltException extends Exception
{
    public array $payload;

    public function __construct(string $message, array $payload = [])
    {
        parent::__construct($message);
        $this->payload = $payload;
    }
}

describe('kotlinskidev_ajax_decrypt_content', function () {
    beforeEach(function () {
        Functions\when('wp_send_json_error')->alias(function ($data = null) {
            throw new KotlinskidevTestAjaxHaltException('error', is_array($data) ? $data : ['message' => $data]);
        });
        Functions\when('wp_send_json_success')->alias(function ($data = null) {
            throw new KotlinskidevTestAjaxHaltException('success', $data);
        });
    });

    it('halts with a nonce-expired error when the nonce is invalid', function () {
        $_POST = ['nonce' => 'bad'];
        Functions\when('wp_verify_nonce')->justReturn(false);

        try {
            kotlinskidev_ajax_decrypt_content();
            $this->fail('Expected halt exception was not thrown');
        } catch (KotlinskidevTestAjaxHaltException $e) {
            expect($e->getMessage())->toBe('error');
            expect($e->payload['error_code'])->toBe('nonce_expired');
        }
    });

    it('halts with an error when no items are provided', function () {
        $_POST = ['nonce' => 'ok', 'items' => ''];
        Functions\when('wp_verify_nonce')->justReturn(true);

        try {
            kotlinskidev_ajax_decrypt_content();
            $this->fail('Expected halt exception was not thrown');
        } catch (KotlinskidevTestAjaxHaltException $e) {
            expect($e->payload['message'])->toBe('No content provided');
        }
    });

    it('halts with an error when too many items are requested', function () {
        $items = array_fill(0, 51, ['content' => 'x', 'type' => 'text']);
        $_POST = ['nonce' => 'ok', 'items' => json_encode($items)];
        Functions\when('wp_verify_nonce')->justReturn(true);

        try {
            kotlinskidev_ajax_decrypt_content();
            $this->fail('Expected halt exception was not thrown');
        } catch (KotlinskidevTestAjaxHaltException $e) {
            expect($e->payload['message'])->toBe('Too many items requested');
        }
    });

    it('decrypts and formats each item, returning null for empty entries', function () {
        $keys = kotlinskidev_generate_rsa_keys();
        Functions\when('get_option')->alias(fn ($name, $default = false) => match ($name) {
            'kotlinskidev_private_key' => $keys['private_key'],
            'kotlinskidev_public_key' => $keys['public_key'],
            default => $default,
        });
        Functions\when('wp_verify_nonce')->justReturn(true);

        $items = [
            'a' => ['content' => '', 'type' => 'text'],
            'b' => ['content' => kotlinskidev_encrypt_content('Sensitive text'), 'type' => 'text'],
        ];
        $_POST = ['nonce' => 'ok', 'items' => json_encode($items)];

        try {
            kotlinskidev_ajax_decrypt_content();
            $this->fail('Expected halt exception was not thrown');
        } catch (KotlinskidevTestAjaxHaltException $e) {
            expect($e->getMessage())->toBe('success');
            expect($e->payload['results']['a'])->toBeNull();
            expect($e->payload['results']['b']['raw_content'])->toBe('Sensitive text');
        }
    });
});
