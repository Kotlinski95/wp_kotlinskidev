<?php

it('renders nothing when polylang is not active', function () {
    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/language-panel/render.php',
        ['label' => '']
    );

    expect($html)->toBe('');
});

function kotlinskidev_run_language_panel_subprocess(array $attributes): string
{
    $renderFile = __DIR__ . '/../../../src/blocks/language-panel/render.php';
    $blocksFile = __DIR__ . '/../../../functions/blocks.php';
    $svgFile = __DIR__ . '/../../../functions/svg-support.php';
    $attrsExport = var_export($attributes, true);

    $script = <<<PHP
<?php
function add_filter(...\$args) { return true; }
function add_action(...\$args) { return true; }
function get_block_wrapper_attributes(\$extra = []) { return 'class="' . (\$extra['class'] ?? '') . '"'; }
function esc_attr(\$t) { return \$t; }
function esc_html(\$t) { return \$t; }
function esc_url(\$t) { return \$t; }
function esc_attr__(\$t, \$d = null) { return \$t; }
function __(\$t, \$d = null) { return \$t; }
function sanitize_html_class(\$t) { return \$t; }
function wp_unique_id(\$prefix = '') { return \$prefix . '7'; }
function pll_the_languages(\$args = []) {
    return [['slug' => 'pl', 'name' => 'Polski', 'flag' => 'https://example.test/pl.png', 'current_lang' => true]];
}
require '{$svgFile}';
require '{$blocksFile}';
\$attributes = {$attrsExport};
\$content = '<li>Item</li>';
ob_start();
include '{$renderFile}';
echo json_encode(ob_get_clean());
PHP;

    $tmpFile = tempnam(sys_get_temp_dir(), 'kt_langpanel_');
    file_put_contents($tmpFile, $script);
    $output = shell_exec('php ' . escapeshellarg($tmpFile));
    unlink($tmpFile);

    return json_decode($output, true) ?? '[decode failed: ' . $output . ']';
}

it('renders the short uppercase language code by default', function () {
    $html = kotlinskidev_run_language_panel_subprocess(['label' => '']);

    expect($html)->toContain('<span class="kt-lang-panel__label">PL</span>');
});

it('renders the full language name when labelStyle is full', function () {
    $html = kotlinskidev_run_language_panel_subprocess(['label' => '', 'labelStyle' => 'full']);

    expect($html)->toContain('<span class="kt-lang-panel__label">Polski</span>');
});

it('renders the language flag image when showFlag is enabled', function () {
    $html = kotlinskidev_run_language_panel_subprocess(['label' => '', 'showFlag' => true]);

    expect($html)->toContain('src="https://example.test/pl.png"');
});

it('hides the language flag image when showFlag is disabled', function () {
    $html = kotlinskidev_run_language_panel_subprocess(['label' => '', 'showFlag' => false]);

    expect($html)->not->toContain('kt-lang-panel__flag');
});

it('uses a custom label when configured, overriding the auto-generated one', function () {
    $html = kotlinskidev_run_language_panel_subprocess(['label' => 'Choose Language']);

    expect($html)->toContain('<span class="kt-lang-panel__label">Choose Language</span>');
});

it('hides the indicator when showIndicator is false', function () {
    $html = kotlinskidev_run_language_panel_subprocess(['label' => '', 'showIndicator' => false]);

    expect($html)->not->toContain('kt-lang-panel__indicator');
});

it('renders the inner list content inside the modal', function () {
    $html = kotlinskidev_run_language_panel_subprocess(['label' => '']);

    expect($html)->toContain('<li>Item</li>');
});
