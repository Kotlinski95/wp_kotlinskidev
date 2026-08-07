<?php

require_once __DIR__ . '/bootstrap.php';

use Tests\Integration\TestCase;

pest()->extend(TestCase::class)->in('tests');
