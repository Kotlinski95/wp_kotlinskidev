<?php

use Brain\Monkey\Functions;

function kotlinskidev_article_toc_render(array $attributes = []): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/article-toc/render.php',
        $attributes,
        '',
        (object) []
    );
}

function kotlinskidev_article_toc_provide(array $headings): void
{
    static $postId = 7000;
    $postId++;

    $blocks = array_map(
        fn (array $h) => [
            'blockName' => 'core/heading',
            'attrs'     => isset($h['anchor']) ? [ 'anchor' => $h['anchor'] ] : [],
            'innerHTML' => '<h2 class="wp-block-heading">' . $h['label'] . '</h2>',
        ],
        $headings
    );

    Functions\when('get_queried_object_id')->justReturn($postId);
    Functions\when('get_the_ID')->justReturn($postId);
    Functions\when('get_post')->justReturn((object) [ 'post_content' => 'content' ]);
    Functions\when('parse_blocks')->justReturn($blocks);
    Functions\when('serialize_block')->alias(fn ($b) => $b['innerHTML']);
    Functions\when('wp_strip_all_tags')->alias(fn ($t) => strip_tags($t));
    Functions\when('sanitize_title')->alias(fn ($t) => trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower($t)), '-'));
}

function kotlinskidev_article_toc_numbered(int $count): array
{
    $headings = [];
    for ($i = 1; $i <= $count; $i++) {
        $headings[] = [ 'label' => 'Heading ' . $i, 'anchor' => 'section-' . $i ];
    }
    return $headings;
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="wp-block-kotlinskidev-article-toc ' . ( $extra['class'] ?? '' ) . '"'
            . ( isset($extra['style']) ? ' style="' . htmlspecialchars($extra['style'], ENT_QUOTES) . '"' : '' )
    );
    Functions\when('esc_attr')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));
    Functions\when('esc_html')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));
    Functions\when('esc_html__')->alias(fn ($t) => $t);
    Functions\when('esc_attr__')->alias(fn ($t) => $t);
});

it('renders nothing when the items provider is missing', function () {
    if (function_exists('kotlinskidev_article_toc_items_for_post')) {
        $this->markTestSkipped('provider already defined in this process');
    }

    expect(kotlinskidev_article_toc_render())->toBe('');
});

it('renders nothing below three items', function () {
    kotlinskidev_article_toc_provide(kotlinskidev_article_toc_numbered(2));

    expect(kotlinskidev_article_toc_render())->toBe('');
});

it('renders the nav, toggle and dialog for three items', function () {
    kotlinskidev_article_toc_provide(kotlinskidev_article_toc_numbered(3));

    $html = kotlinskidev_article_toc_render();

    expect($html)->toContain('kt-article-toc-block');
    expect($html)->toContain('aria-labelledby="kt-article-toc-title"');
    expect($html)->toContain('class="kt-article-toc-toggle"');
    expect($html)->toContain('aria-controls="kt-article-toc-dialog"');
    expect($html)->toContain('<dialog class="kt-article-toc-dialog" id="kt-article-toc-dialog"');
    expect($html)->toContain('aria-labelledby="kt-article-toc-dialog-title"');
    expect($html)->toContain('aria-label="Close table of contents"');
    expect($html)->toContain('aria-label="Open table of contents"');
});

it('renders each item twice with zero-padded hidden numbers and data-kt-toc-link', function () {
    kotlinskidev_article_toc_provide(kotlinskidev_article_toc_numbered(3));

    $html = kotlinskidev_article_toc_render();

    expect(substr_count($html, 'data-kt-toc-link href="#section-2"'))->toBe(2);
    expect(substr_count($html, '<span class="kt-article-toc__number" aria-hidden="true">03</span>'))->toBe(2);
    expect($html)->toContain('<span class="kt-article-toc__label">Heading 1</span>');
});

it('escapes labels and ids', function () {
    kotlinskidev_article_toc_provide([
        [ 'label' => 'A & "B"', 'anchor' => 'a"b' ],
        [ 'label' => 'Two', 'anchor' => 'two' ],
        [ 'label' => 'Three', 'anchor' => 'three' ],
    ]);

    $html = kotlinskidev_article_toc_render();

    expect($html)->toContain('A &amp; &quot;B&quot;');
    expect($html)->not->toContain('A & "B"');
    expect($html)->toContain('href="#a&quot;b"');
});

it('keeps the card as the wrapper-attributes element inside a plain outer cell', function () {
    kotlinskidev_article_toc_provide(kotlinskidev_article_toc_numbered(3));

    $html = kotlinskidev_article_toc_render();

    expect($html)->toStartWith('<div class="kt-article-toc-block"><nav class="wp-block-kotlinskidev-article-toc kt-article-toc"');
    expect($html)->not->toContain('style=');
});

it('emits accent and active background vars on the card and the dialog', function () {
    kotlinskidev_article_toc_provide(kotlinskidev_article_toc_numbered(3));

    $html = kotlinskidev_article_toc_render([
        'accentColor'                 => 'primary',
        'customActiveBackgroundColor' => '#ff0066',
    ]);

    $vars = '--kt-article-toc-accent:var(--wp--preset--color--primary);--kt-article-toc-bar:var(--wp--preset--color--primary);--kt-article-toc-active-bg:#ff0066';
    expect($html)->toContain('class="wp-block-kotlinskidev-article-toc kt-article-toc" style="' . $vars . '"');
    expect($html)->toContain('aria-labelledby="kt-article-toc-dialog-title" style="' . $vars . '"');
});

it('mirrors text, background and border colour supports onto the dialog', function () {
    kotlinskidev_article_toc_provide(kotlinskidev_article_toc_numbered(3));

    $html = kotlinskidev_article_toc_render([
        'textColor' => 'contrast',
        'style'     => [
            'color'  => [ 'background' => '#101010' ],
            'border' => [ 'color' => 'var:preset|color|accent-2' ],
        ],
    ]);

    expect($html)->toContain('style="color:var(--wp--preset--color--contrast);background-color:#101010;border-color:var(--wp--preset--color--accent-2)"');
});

it('drops unsafe colour values', function () {
    kotlinskidev_article_toc_provide(kotlinskidev_article_toc_numbered(3));

    $html = kotlinskidev_article_toc_render([
        'accentColor'                 => 'x;background:url(evil)',
        'customAccentColor'           => 'red;} body{display:none',
        'customActiveBackgroundColor' => 'url(javascript:alert(1))',
        'textColor'                   => '"><script>',
    ]);

    expect($html)->not->toContain('evil');
    expect($html)->not->toContain('script');
    expect($html)->not->toContain('display:none');
    expect($html)->not->toContain('style=');
});

it('accepts rgb and hsl custom colours', function () {
    expect(kotlinskidev_article_toc_color_value('', 'rgba(10, 20, 30, 0.5)'))->toBe('rgba(10, 20, 30, 0.5)');
    expect(kotlinskidev_article_toc_color_value('', 'hsl(200 50% 40%)'))->toBe('hsl(200 50% 40%)');
    expect(kotlinskidev_article_toc_color_value('', '#abc'))->toBe('#abc');
    expect(kotlinskidev_article_toc_color_value('', 'rgb(1,2,3);color:red'))->toBe('');
});
