<?php

use Brain\Monkey\Filters;
use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/speed-dial.php';

if (!class_exists('WP_Block_Type_Registry')) {
    class WP_Block_Type_Registry
    {
        public static array $registered = [];

        public static function get_instance(): self
        {
            return new self();
        }

        public function is_registered(string $name): bool
        {
            return in_array($name, self::$registered, true);
        }
    }
}

it('builds a tel href keeping only digits and a leading plus', function () {
    expect(kotlinskidev_speed_dial_tel_href('+48 500-100-200'))->toBe('tel:+48500100200');
    expect(kotlinskidev_speed_dial_tel_href('500 100 200'))->toBe('tel:500100200');
});

it('strips an inner plus, letters and returns empty for no digits', function () {
    expect(kotlinskidev_speed_dial_tel_href('48+500abc100'))->toBe('tel:48500100');
    expect(kotlinskidev_speed_dial_tel_href('call me'))->toBe('');
    expect(kotlinskidev_speed_dial_tel_href(''))->toBe('');
    expect(kotlinskidev_speed_dial_tel_href('+'))->toBe('');
});

it('clamps the z-index and falls back for non-integers', function () {
    expect(kotlinskidev_speed_dial_z_index(0))->toBe(1);
    expect(kotlinskidev_speed_dial_z_index(-5))->toBe(1);
    expect(kotlinskidev_speed_dial_z_index(2147483000))->toBe(2147482999);
    expect(kotlinskidev_speed_dial_z_index(1500))->toBe(1500);
    expect(kotlinskidev_speed_dial_z_index('1500'))->toBe(999);
    expect(kotlinskidev_speed_dial_z_index(null))->toBe(999);
});

it('clamps offsets to 0..10 and stays unit safe', function () {
    expect(kotlinskidev_speed_dial_offset(-3))->toBe(0.0);
    expect(kotlinskidev_speed_dial_offset(25))->toBe(10.0);
    expect(kotlinskidev_speed_dial_offset(2.5))->toBe(2.5);
    expect(kotlinskidev_speed_dial_offset('3'))->toBe(3.0);
    expect(kotlinskidev_speed_dial_offset('3rem; color:red'))->toBe(1.0);
    expect(kotlinskidev_speed_dial_offset(null))->toBe(1.0);
    expect(kotlinskidev_speed_dial_offset_css(1))->toBe('1rem');
    expect(kotlinskidev_speed_dial_offset_css(2.5))->toBe('2.5rem');
    expect(kotlinskidev_speed_dial_offset_css(0))->toBe('0rem');
});

it('resolves auto direction per corner and keeps explicit directions', function () {
    $position = ['desktop' => 'bottom-left', 'tablet' => 'top-right', 'mobile' => 'top-left'];

    expect(kotlinskidev_speed_dial_layout_classes($position, 'auto'))->toBe([
        'kt-speed-dial--desktop-bottom-left',
        'kt-speed-dial--desktop-up',
        'kt-speed-dial--tablet-top-right',
        'kt-speed-dial--tablet-down',
        'kt-speed-dial--mobile-top-left',
        'kt-speed-dial--mobile-down',
    ]);

    expect(kotlinskidev_speed_dial_layout_classes($position, 'left'))->toContain('kt-speed-dial--tablet-left');
    expect(kotlinskidev_speed_dial_layout_classes($position, 'right'))->toContain('kt-speed-dial--mobile-right');
});

it('falls back to bottom-right and up for unknown values', function () {
    expect(kotlinskidev_speed_dial_layout_classes(['desktop' => 'center', 'tablet' => 5], 'sideways'))->toBe([
        'kt-speed-dial--desktop-bottom-right',
        'kt-speed-dial--desktop-up',
        'kt-speed-dial--tablet-bottom-right',
        'kt-speed-dial--tablet-up',
        'kt-speed-dial--mobile-bottom-right',
        'kt-speed-dial--mobile-up',
    ]);
});

it('validates trigger actions against the plugin grammar', function () {
    foreach (['open', 'profile:adhdFriendly', 'feature:biggerText:2'] as $valid) {
        expect(kotlinskidev_speed_dial_is_valid_trigger_action($valid))->toBeTrue();
    }
    foreach (['Open', 'feature:', 'a:b:c:d', '<x>', '', 'open ', "open\n"] as $invalid) {
        expect(kotlinskidev_speed_dial_is_valid_trigger_action($invalid))->toBeFalse();
    }
});

it('renders a known icon slug as a stroke currentColor svg', function () {
    Functions\when('esc_attr')->returnArg();

    $svg = kotlinskidev_speed_dial_icon_svg('phone');

    expect($svg)->toContain('aria-hidden="true"');
    expect($svg)->toContain('stroke="currentColor"');
    expect($svg)->toContain('<path d="M5 4h4');
});

it('returns an empty string for an unknown icon slug', function () {
    expect(kotlinskidev_speed_dial_icon_svg('nope'))->toBe('');
});

it('ships the built-in icon set with only valid path data', function () {
    $icons = kotlinskidev_speed_dial_icons();

    expect(array_keys($icons))->toEqualCanonicalizing(['plus', 'close', 'phone', 'mail', 'accessibility', 'link']);
    foreach ($icons as $paths) {
        foreach ($paths as $path) {
            expect(preg_match(KOTLINSKIDEV_SPEED_DIAL_ICON_PATH_REGEX, $path))->toBe(1);
        }
    }
});

it('accepts only strict css colour values', function () {
    expect(kotlinskidev_speed_dial_safe_color('var(--wp--preset--color--primary)'))->toBe('var(--wp--preset--color--primary)');
    expect(kotlinskidev_speed_dial_safe_color('#0078c2'))->toBe('#0078c2');
    expect(kotlinskidev_speed_dial_safe_color('linear-gradient(135deg,#fff 0%,#000 100%)'))->toBe('linear-gradient(135deg,#fff 0%,#000 100%)');
    expect(kotlinskidev_speed_dial_safe_color('red;background:url(x)'))->toBe('');
    expect(kotlinskidev_speed_dial_safe_color('url(javascript:alert(1))'))->toBe('');
    expect(kotlinskidev_speed_dial_safe_color('#12'))->toBe('');
    expect(kotlinskidev_speed_dial_safe_color(['x']))->toBe('');
});

it('lets the filter override accessibility availability', function () {
    Filters\expectApplied('kotlinskidev_speed_dial_a11y_available')->once()->andReturn(true);

    expect(kotlinskidev_speed_dial_a11y_available())->toBeTrue();
});

it('defaults accessibility availability to the plugin function check', function () {
    expect(kotlinskidev_speed_dial_a11y_available())->toBe(function_exists('kotlinskidev_a11y_get_button'));
});

it('allows core html and shortcode custom blocks by default', function () {
    WP_Block_Type_Registry::$registered = [];

    expect(kotlinskidev_speed_dial_custom_allowed_blocks())->toBe(['core/html', 'core/shortcode']);
});

it('adds wpcode snippet only when registered and honours the filter', function () {
    WP_Block_Type_Registry::$registered = ['wpcode/snippet'];
    expect(kotlinskidev_speed_dial_custom_allowed_blocks())->toBe(['core/html', 'core/shortcode', 'wpcode/snippet']);

    WP_Block_Type_Registry::$registered = [];
    Filters\expectApplied('kotlinskidev_speed_dial_custom_allowed_blocks')->once()->andReturn(['core/html', 'acme/snippet']);
    expect(kotlinskidev_speed_dial_custom_allowed_blocks())->toBe(['core/html', 'acme/snippet']);
});

it('returns the raw text for an empty string', function () {
    expect(kotlinskidev_speed_dial_translate(''))->toBe('');
});

it('translates through pll__ when Polylang provides it', function () {
    Functions\when('pll__')->alias(fn (string $text) => 'PL:' . $text);

    expect(kotlinskidev_speed_dial_translate('Call'))->toBe('PL:Call');
});
