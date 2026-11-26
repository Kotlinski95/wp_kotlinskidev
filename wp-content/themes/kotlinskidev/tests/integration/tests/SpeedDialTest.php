<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_speed_dial_test_dial( string $items, array $attributes = [] ): string {
    $attributes_json = [] === $attributes ? '' : ' ' . wp_json_encode( $attributes );

    return '<!-- wp:kotlinskidev/speed-dial' . $attributes_json . ' -->' . $items . '<!-- /wp:kotlinskidev/speed-dial -->';
}

function kotlinskidev_speed_dial_test_item( array $attributes ): string {
    return '<!-- wp:kotlinskidev/speed-dial-item ' . wp_json_encode( $attributes ) . ' /-->';
}

function kotlinskidev_speed_dial_test_render( string $markup ): string {
    $html = '';
    foreach ( parse_blocks( $markup ) as $block ) {
        $html .= render_block( $block );
    }

    return $html;
}

beforeEach(function () {
    update_option( 'kotlinskidev_contact_phone', '+48 500 100 200' );
    update_option( 'kotlinskidev_contact_email', 'hello@example.com' );
    add_filter( 'kotlinskidev_speed_dial_a11y_available', '__return_true' );
});

afterEach(function () {
    remove_filter( 'kotlinskidev_speed_dial_a11y_available', '__return_true' );
    remove_all_shortcodes();
});

it('registers both speed dial blocks', function () {
    $registry = WP_Block_Type_Registry::get_instance();

    expect($registry->is_registered('kotlinskidev/speed-dial'))->toBeTrue();
    expect($registry->is_registered('kotlinskidev/speed-dial-item'))->toBeTrue();
    expect($registry->get_registered('kotlinskidev/speed-dial-item')->parent)->toBe(['kotlinskidev/speed-dial']);
});

it('renders a collapsed toggle wired to a hidden list with three items', function () {
    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        kotlinskidev_speed_dial_test_item(['action' => 'phone'])
        . kotlinskidev_speed_dial_test_item(['action' => 'email'])
        . kotlinskidev_speed_dial_test_item(['action' => 'accessibility'])
    ));

    expect(substr_count($html, 'class="kt-speed-dial__toggle"'))->toBe(1);
    expect($html)->toContain('aria-expanded="false"');
    expect($html)->toContain('data-kt-speed-dial');
    expect($html)->toContain('href="tel:+48500100200"');
    expect($html)->toContain('href="mailto:hello@example.com"');
    expect($html)->toContain('data-ka11y="open"');
    expect(substr_count($html, '<li '))->toBe(3);

    preg_match('/aria-controls="([^"]+)"/', $html, $controls);
    expect($html)->toMatch('/<ul id="' . preg_quote($controls[1], '/') . '"[^>]* hidden>/');
});

it('drops the phone item when the site phone is empty and site contact is on', function () {
    update_option( 'kotlinskidev_contact_phone', '' );

    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        kotlinskidev_speed_dial_test_item(['action' => 'phone'])
        . kotlinskidev_speed_dial_test_item(['action' => 'email'])
    ));

    expect($html)->not->toContain('tel:');
    expect(substr_count($html, '<li '))->toBe(1);
});

it('uses the typed value when site contact is off', function () {
    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        kotlinskidev_speed_dial_test_item(['action' => 'phone', 'useSiteContact' => false, 'value' => '12 34'])
    ));

    expect($html)->toContain('href="tel:1234"');
});

it('outputs nothing when every item is empty', function () {
    update_option( 'kotlinskidev_contact_phone', '' );
    update_option( 'kotlinskidev_contact_email', '' );

    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        kotlinskidev_speed_dial_test_item(['action' => 'phone'])
        . kotlinskidev_speed_dial_test_item(['action' => 'email'])
        . kotlinskidev_speed_dial_test_item(['action' => 'url'])
    ));

    expect($html)->toBe('');
});

it('omits data-ka11y output when the accessibility plugin is unavailable', function () {
    remove_filter( 'kotlinskidev_speed_dial_a11y_available', '__return_true' );
    add_filter( 'kotlinskidev_speed_dial_a11y_available', '__return_false' );

    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        kotlinskidev_speed_dial_test_item(['action' => 'phone'])
        . kotlinskidev_speed_dial_test_item(['action' => 'accessibility'])
        . kotlinskidev_speed_dial_test_item(['action' => 'trigger', 'triggerAction' => 'open'])
    ));

    remove_filter( 'kotlinskidev_speed_dial_a11y_available', '__return_false' );

    expect($html)->not->toContain('data-ka11y');
    expect(substr_count($html, '<li '))->toBe(1);
});

it('renders a valid trigger action and drops an invalid one', function () {
    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        kotlinskidev_speed_dial_test_item(['action' => 'trigger', 'triggerAction' => 'profile:adhdFriendly'])
        . kotlinskidev_speed_dial_test_item(['action' => 'trigger', 'triggerAction' => 'Bad Action"><x'])
    ));

    expect($html)->toContain('data-ka11y="profile:adhdFriendly"');
    expect($html)->toContain('data-kt-speed-dial-a11y="profile:adhdFriendly"');
    expect(substr_count($html, '<li '))->toBe(1);
});

it('drops javascript and data urls and keeps https urls', function () {
    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        kotlinskidev_speed_dial_test_item(['action' => 'url', 'value' => 'javascript:alert(1)'])
        . kotlinskidev_speed_dial_test_item(['action' => 'url', 'value' => 'data:text/html;base64,AAAA'])
        . kotlinskidev_speed_dial_test_item(['action' => 'url', 'value' => 'tel:123'])
        . kotlinskidev_speed_dial_test_item(['action' => 'url', 'value' => 'https://example.com/a'])
    ));

    expect($html)->not->toContain('javascript:');
    expect($html)->not->toContain('data:text');
    expect($html)->toContain('href="https://example.com/a"');
    expect(substr_count($html, '<li '))->toBe(1);
});

it('renders shortcode output inside the custom item', function () {
    add_shortcode('kt_speed_dial_test', fn () => '<span class="kt-sd-probe">probe</span>');

    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        '<!-- wp:kotlinskidev/speed-dial-item {"action":"custom"} --><!-- wp:shortcode -->[kt_speed_dial_test]<!-- /wp:shortcode --><!-- /wp:kotlinskidev/speed-dial-item -->'
    ));

    expect($html)->toMatch('/<li [^>]*kt-speed-dial__item--custom[^>]*>.*kt-sd-probe.*<\/li>/s');
});

it('strips scripts from custom item content and ignores disallowed inner blocks', function () {
    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        '<!-- wp:kotlinskidev/speed-dial-item {"action":"custom"} --><!-- wp:html --><b>ok</b><script>alert(1)</script><!-- /wp:html --><!-- wp:paragraph --><p>nope</p><!-- /wp:paragraph --><!-- /wp:kotlinskidev/speed-dial-item -->'
    ));

    expect($html)->toContain('<b>ok</b>');
    expect($html)->not->toContain('<script');
    expect($html)->not->toContain('nope');
});

it('drops a custom item with no renderable content', function () {
    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        '<!-- wp:kotlinskidev/speed-dial-item {"action":"custom"} /-->'
    ));

    expect($html)->toBe('');
});

it('adds target and rel plus hidden text when opening in a new tab', function () {
    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        kotlinskidev_speed_dial_test_item(['action' => 'url', 'value' => 'https://example.com', 'opensInNewTab' => true])
    ));

    expect($html)->toContain('target="_blank" rel="noopener noreferrer"');
    expect($html)->toContain('screen-reader-text');
});

it('keeps raw labels without Polylang and translates with a pll__ stub', function () {
    $item = kotlinskidev_speed_dial_test_item(['action' => 'url', 'value' => 'https://example.com', 'label' => 'Zadzwon', 'ariaLabel' => 'Zadzwon teraz']);

    if (!function_exists('pll__')) {
        $raw = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial($item, ['label' => 'Quick']));
        expect($raw)->toContain('>Zadzwon</span>');
        expect($raw)->toContain('aria-label="Zadzwon teraz"');
        expect($raw)->toContain('aria-label="Quick"');

        function pll__(string $text): string {
            return 'Zadzwon' === $text ? 'Call' : $text;
        }
    }

    $translated = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial($item));
    expect($translated)->toContain('>Call</span>');
});

it('clamps an oversized z-index below the plugin token', function () {
    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        kotlinskidev_speed_dial_test_item(['action' => 'phone']),
        ['zIndex' => 99999999999]
    ));

    expect($html)->toContain('--kt-speed-dial-z:2147482999');
});

it('writes layout classes, offsets and safe colours on the root', function () {
    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        kotlinskidev_speed_dial_test_item(['action' => 'phone']),
        [
            'position' => ['desktop' => 'top-left', 'tablet' => 'bottom-left', 'mobile' => 'bottom-right'],
            'offset' => ['desktop' => ['x' => 2, 'y' => 99], 'tablet' => ['x' => 1, 'y' => 1], 'mobile' => ['x' => 1, 'y' => 1]],
            'toggleBackgroundColor' => 'var(--wp--preset--color--primary)',
            'toggleTextColor' => 'red;background:url(x)',
        ]
    ));

    expect($html)->toContain('kt-speed-dial--desktop-top-left');
    expect($html)->toContain('kt-speed-dial--desktop-down');
    expect($html)->toContain('--kt-speed-dial-dx:2rem');
    expect($html)->toContain('--kt-speed-dial-dy:10rem');
    expect($html)->toContain('--kt-speed-dial-toggle-bg:var(--wp--preset--color--primary)');
    expect($html)->not->toContain('url(x)');
});

it('keeps the responsive display class on the root', function () {
    $html = kotlinskidev_speed_dial_test_render(kotlinskidev_speed_dial_test_dial(
        kotlinskidev_speed_dial_test_item(['action' => 'phone']),
        ['responsiveDisplay' => ['mobile' => ['display' => 'none']]]
    ));

    expect($html)->toContain('mobile:none');
});

it('registers speed dial labels through the translated-text collector', function () {
    $strings = [];

    kotlinskidev_translated_text_collect_strings(parse_blocks(kotlinskidev_speed_dial_test_dial(
        kotlinskidev_speed_dial_test_item(['action' => 'phone', 'label' => 'Call us now', 'ariaLabel' => 'Phone us'])
        . kotlinskidev_speed_dial_test_item(['action' => 'email']),
        ['label' => 'Quick actions here']
    )), $strings);

    expect($strings)->toEqual([
        'Call us now' => 'Call us now',
        'Phone us' => 'Phone us',
        'Quick actions here' => 'Quick actions here',
    ]);
    expect(kotlinskidev_translated_text_file_has_markers('<!-- wp:kotlinskidev/speed-dial /-->'))->toBeTrue();
});
