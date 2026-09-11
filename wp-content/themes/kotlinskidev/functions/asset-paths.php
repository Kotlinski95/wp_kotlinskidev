<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function kotlinskidev_build_path( string $type, string $filename ): string {
    return get_template_directory() . '/build/' . $type . '/' . $filename;
}

function kotlinskidev_build_url( string $type, string $filename ): string {
    return get_template_directory_uri() . '/build/' . $type . '/' . $filename;
}
