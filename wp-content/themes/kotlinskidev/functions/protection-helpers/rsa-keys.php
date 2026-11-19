<?php

if (!function_exists('kotlinskidev_generate_rsa_keys')) {
    function kotlinskidev_generate_rsa_keys()
    {
        $config = array(
            "digest_alg" => "sha512",
            "private_key_bits" => 2048,
            "private_key_type" => OPENSSL_KEYTYPE_RSA,
        );

        $resource = openssl_pkey_new($config);
        if (!$resource) {
            return false;
        }

        openssl_pkey_export($resource, $private_key);

        $key_details = openssl_pkey_get_details($resource);
        $public_key = $key_details["key"];

        return array(
            'private_key' => $private_key,
            'public_key' => $public_key
        );
    }
}

if (!function_exists('kotlinskidev_get_or_create_keys')) {
    function kotlinskidev_get_or_create_keys()
    {
        if (defined('KOTLINSKIDEV_PRIVATE_KEY') && defined('KOTLINSKIDEV_PUBLIC_KEY')) {
            return array(
                'private_key' => KOTLINSKIDEV_PRIVATE_KEY,
                'public_key' => KOTLINSKIDEV_PUBLIC_KEY
            );
        }

        $private_key = get_option('kotlinskidev_private_key');
        $public_key = get_option('kotlinskidev_public_key');

        if (empty($private_key) || empty($public_key)) {
            $keys = kotlinskidev_generate_rsa_keys();
            if ($keys) {
                $storage_method = get_option('kotlinskidev_key_storage_method', 'database');

                if ($storage_method === 'database') {
                    update_option('kotlinskidev_private_key', $keys['private_key']);
                    update_option('kotlinskidev_public_key', $keys['public_key']);
                }

                return $keys;
            }
            return false;
        }

        return array(
            'private_key' => $private_key,
            'public_key' => $public_key
        );
    }
}
