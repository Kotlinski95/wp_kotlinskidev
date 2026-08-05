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

pest()->extend(TestCase::class)->in('Unit');
