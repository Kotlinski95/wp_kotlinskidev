<?php

uses(Tests\Integration\TestCase::class);

it('renders the scroll-to-top button with its trigger id and progress ring', function () {
    $html = do_shortcode('[scroll_to_top]');

    expect($html)->toContain('id="scroll-to-top"');
    expect($html)->toContain('class="progress-ring"');
    expect($html)->toContain('progress-ring__progress');
});

it('exposes an accessible label for the scroll-to-top control', function () {
    $html = do_shortcode('[scroll_to_top]');

    expect($html)->toContain('aria-label="Scroll to Top"');
});
