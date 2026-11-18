<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/feature-card-canvas.php';

beforeEach(function () {
    Functions\stubs([
        'sanitize_key' => fn($value) => strtolower(preg_replace('/[^a-zA-Z0-9_\-]/', '', (string) $value)),
        'sanitize_text_field' => fn($value) => trim(strip_tags((string) $value)),
    ]);
    Functions\stubTranslationFunctions();
});

it('lists every variant', function () {
    expect(kotlinskidev_feature_canvas_variants())->toBe(['browser-stream', 'node-tree', 'dot-image-stack', 'chart-growth', 'storefront', 'layout-builder', 'speed-gauge', 'nav-about', 'nav-projects', 'nav-services', 'nav-contact', 'site-scroll', 'checkout-flow', 'app-dashboard', 'load-waterfall', 'local-search', 'support-shield', 'benefit-marketing', 'benefit-saas', 'benefit-design-system', 'benefit-api', 'commerce-conversion', 'commerce-scale', 'commerce-secure', 'commerce-platforms', 'illus-storefront', 'illus-audit', 'illus-mobile-first', 'illus-vitals', 'illus-mobile-checkout', 'illus-seo-growth', 'illus-handover', 'illus-app-services', 'vs-frameworks', 'pwa-install', 'ssr-smartedit', 'nextjs-architecture', 'perf-by-design', 'smart-shopping-list', 'wp-custom-theme', 'wp-stack-ownership', 'wp-flex-control']);
});

it('falls back to browser-stream for an invalid variant', function () {
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'nope'])['variant'])->toBe('browser-stream');
    expect(kotlinskidev_feature_canvas_render_data([])['variant'])->toBe('browser-stream');
});

it('keeps a valid variant', function () {
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'chart-growth'])['variant'])->toBe('chart-growth');
});

it('falls back to 16/10 for a bad aspect ratio', function () {
    expect(kotlinskidev_feature_canvas_render_data(['aspectRatio' => '16:10'])['aspect_ratio'])->toBe('16/10');
    expect(kotlinskidev_feature_canvas_render_data(['aspectRatio' => '1/2;color:red'])['aspect_ratio'])->toBe('16/10');
    expect(kotlinskidev_feature_canvas_render_data(['aspectRatio' => '100/1'])['aspect_ratio'])->toBe('16/10');
});

it('keeps a valid aspect ratio', function () {
    expect(kotlinskidev_feature_canvas_render_data(['aspectRatio' => '4/3'])['aspect_ratio'])->toBe('4/3');
});

it('uses translated defaults for empty dot-image-stack labels', function () {
    $data = kotlinskidev_feature_canvas_render_data(['variant' => 'dot-image-stack']);

    expect($data['labels'])->toBe(['Original', '1440px', '375px']);
});

it('keeps custom labels and fills the rest with defaults', function () {
    $data = kotlinskidev_feature_canvas_render_data([
        'variant' => 'dot-image-stack',
        'labelOne' => ' <b>Source</b> ',
        'labelThree' => 'Phone',
    ]);

    expect($data['labels'])->toBe(['Source', '1440px', 'Phone']);
});

it('defaults the accent to primary and sanitises slugs', function () {
    expect(kotlinskidev_feature_canvas_render_data([])['accent'])->toBe('primary');
    expect(kotlinskidev_feature_canvas_render_data(['accentColor' => ''])['accent'])->toBe('primary');
    expect(kotlinskidev_feature_canvas_render_data(['accentColor' => 'Brand Teal'])['accent'])->toBe('primary');
    expect(kotlinskidev_feature_canvas_render_data(['accentColor' => '#fff'])['accent'])->toBe('primary');
    expect(kotlinskidev_feature_canvas_render_data(['accentColor' => str_repeat('a', 65)])['accent'])->toBe('primary');
    expect(kotlinskidev_feature_canvas_render_data(['accentColor' => 'brand-teal'])['accent'])->toBe('brand-teal');
});

it('defaults touch autoplay to true and honours false', function () {
    expect(kotlinskidev_feature_canvas_render_data([])['touch_autoplay'])->toBeTrue();
    expect(kotlinskidev_feature_canvas_render_data(['touchAutoplay' => true])['touch_autoplay'])->toBeTrue();
    expect(kotlinskidev_feature_canvas_render_data(['touchAutoplay' => false])['touch_autoplay'])->toBeFalse();
    expect(kotlinskidev_feature_canvas_render_data(['touchAutoplay' => 'false'])['touch_autoplay'])->toBeFalse();
    expect(kotlinskidev_feature_canvas_render_data([])['trigger'])->toBe('hover');
    expect(kotlinskidev_feature_canvas_render_data(['trigger' => 'in-view'])['trigger'])->toBe('in-view');
    expect(kotlinskidev_feature_canvas_render_data(['trigger' => 'x'])['trigger'])->toBe('hover');
});

it('always returns exactly three string labels', function () {
    foreach (kotlinskidev_feature_canvas_variants() as $variant) {
        $labels = kotlinskidev_feature_canvas_render_data(['variant' => $variant])['labels'];

        expect($labels)->toHaveCount(3);
        foreach ($labels as $label) {
            expect($label)->toBeString();
        }
    }
});

it('uses translated defaults for empty speed-gauge labels', function () {
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'speed-gauge'])['labels'])->toBe(['LCP', 'INP', 'CLS']);
});

it('keeps new variants and leaves their labels empty when not speed-gauge', function () {
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'storefront'])['variant'])->toBe('storefront');
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'layout-builder'])['labels'])->toBe(['', '', '']);
});

it('keeps nav variants and defaults nav-about labels', function () {
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'nav-about'])['labels'])->toBe(['Frontend', 'Next.js', 'WordPress']);
    foreach (['nav-projects', 'nav-services', 'nav-contact'] as $variant) {
        expect(kotlinskidev_feature_canvas_render_data(['variant' => $variant])['variant'])->toBe($variant);
        expect(kotlinskidev_feature_canvas_render_data(['variant' => $variant])['labels'])->toBe(['', '', '']);
    }
});

it('keeps city variants and defaults their labels', function () {
    foreach (['site-scroll', 'app-dashboard', 'load-waterfall'] as $variant) {
        expect(kotlinskidev_feature_canvas_render_data(['variant' => $variant])['variant'])->toBe($variant);
        expect(kotlinskidev_feature_canvas_render_data(['variant' => $variant])['labels'])->toBe(['', '', '']);
    }
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'checkout-flow'])['labels'])->toBe(['Cart', 'Payment', 'Done']);
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'local-search'])['labels'])->toBe(['website near me', '', '']);
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'support-shield'])['labels'])->toBe(['Uptime', 'Backups', '']);
    foreach (['benefit-marketing', 'benefit-saas', 'benefit-design-system'] as $variant) {
        expect(kotlinskidev_feature_canvas_render_data(['variant' => $variant])['variant'])->toBe($variant);
        expect(kotlinskidev_feature_canvas_render_data(['variant' => $variant])['labels'])->toBe(['', '', '']);
    }
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'benefit-api'])['labels'])->toBe(['CMS', 'GraphQL', 'API']);
});

it('keeps commerce variants and defaults commerce-platforms labels', function () {
    foreach (['commerce-conversion', 'commerce-scale', 'commerce-secure'] as $variant) {
        expect(kotlinskidev_feature_canvas_render_data(['variant' => $variant])['variant'])->toBe($variant);
        expect(kotlinskidev_feature_canvas_render_data(['variant' => $variant])['labels'])->toBe(['', '', '']);
    }
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'commerce-platforms'])['labels'])->toBe(['Shopify', 'WooCommerce', 'SAP Hybris']);
});

it('keeps illustration variants and defaults their labels', function () {
    foreach (['illus-storefront', 'illus-audit', 'illus-mobile-first', 'illus-mobile-checkout', 'illus-seo-growth', 'illus-handover', 'illus-app-services', 'pwa-install'] as $variant) {
        expect(kotlinskidev_feature_canvas_render_data(['variant' => $variant])['variant'])->toBe($variant);
        expect(kotlinskidev_feature_canvas_render_data(['variant' => $variant])['labels'])->toBe(['', '', '']);
    }
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'illus-vitals'])['labels'])->toBe(['LCP', 'INP', 'CLS']);
    expect(kotlinskidev_feature_canvas_render_data(['variant' => 'vs-frameworks'])['labels'])->toBe(['Next.js', 'Angular', 'VS']);
});

it('keeps 14/10 and 2/1 aspect ratios', function () {
    expect(kotlinskidev_feature_canvas_render_data(['aspectRatio' => '14/10'])['aspect_ratio'])->toBe('14/10');
    expect(kotlinskidev_feature_canvas_render_data(['aspectRatio' => '2/1'])['aspect_ratio'])->toBe('2/1');
});

it('leaves the description empty by default and sanitises custom text', function () {
    expect(kotlinskidev_feature_canvas_render_data([])['description'])->toBe('');
    expect(kotlinskidev_feature_canvas_render_data(['description' => ' <b>Score 98</b> up from 42 '])['description'])->toBe('Score 98 up from 42');
});
