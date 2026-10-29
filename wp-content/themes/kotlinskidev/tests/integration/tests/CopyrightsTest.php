<?php

uses(Tests\Integration\TestCase::class);

it('renders the current year in the copyrights shortcode output', function () {
    $html = do_shortcode('[copyrights]');

    expect($html)->toContain((string) date('Y'));
    expect($html)->toContain('class="copyrights-container"');
});

it('renders the powered-by line', function () {
    $html = do_shortcode('[copyrights]');

    expect($html)->toContain('has-text-align-center');
});
