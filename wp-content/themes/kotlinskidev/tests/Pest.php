<?php

use Tests\TestCase;

if (!function_exists('add_filter')) {
    function add_filter(...$args)
    {
        return true;
    }
}

if (!function_exists('add_action')) {
    function add_action(...$args)
    {
        return true;
    }
}

if (!function_exists('kotlinskidev_render_block_file')) {
    function kotlinskidev_render_block_file(string $file, array $attributes, string $content = '', mixed $block = []): string
    {
        $render = function () use ($file, $attributes, $content, $block) {
            ob_start();
            include $file;
            return ob_get_clean();
        };

        return $render();
    }
}

pest()->extend(TestCase::class)->in('unit');
