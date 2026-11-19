<?php

if (!function_exists('kotlinskidev_encrypt_content')) {
    function kotlinskidev_encrypt_content($content)
    {
        $keys = kotlinskidev_get_or_create_keys();
        if (!$keys) {
            return base64_encode($content);
        }

        $encrypted = '';
        $success = openssl_public_encrypt($content, $encrypted, $keys['public_key'], OPENSSL_PKCS1_OAEP_PADDING);

        if ($success) {
            return base64_encode($encrypted);
        }

        return base64_encode($content);
    }
}

if (!function_exists('kotlinskidev_decrypt_content')) {
    function kotlinskidev_decrypt_content($encrypted_content)
    {
        $keys = kotlinskidev_get_or_create_keys();
        if (!$keys) {
            $decoded = base64_decode($encrypted_content, true);
            return $decoded !== false ? $decoded : $encrypted_content;
        }

        $encrypted_data = base64_decode($encrypted_content, true);
        if ($encrypted_data === false) {
            return $encrypted_content;
        }

        $decrypted = '';
        $success = openssl_private_decrypt($encrypted_data, $decrypted, $keys['private_key'], OPENSSL_PKCS1_OAEP_PADDING);
        if (!$success) {
            $success = openssl_private_decrypt($encrypted_data, $decrypted, $keys['private_key'], OPENSSL_PKCS1_PADDING);
        }

        if ($success) {
            return $decrypted;
        }

        $base64_decoded = base64_decode($encrypted_content, true);
        if ($base64_decoded !== false && mb_check_encoding($base64_decoded, 'UTF-8')) {
            return $base64_decoded;
        }

        return $encrypted_content;
    }
}
