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

if (!class_exists('WP_HTML_Tag_Processor')) {
    class WP_HTML_Tag_Processor
    {
        private string $html;
        private array $attrs = [];
        private string $tagName = '';
        private int $matchStart = 0;
        private int $matchLength = 0;
        private bool $found = false;

        public function __construct(string $html)
        {
            $this->html = $html;
        }

        public function next_tag(): bool
        {
            if ($this->found || !preg_match('/<([a-zA-Z0-9-]+)((?:\s+[a-zA-Z-]+(?:="[^"]*")?)*)\s*>/', $this->html, $matches, PREG_OFFSET_CAPTURE)) {
                return false;
            }

            $this->tagName = $matches[1][0];
            preg_match_all('/([a-zA-Z-]+)="([^"]*)"/', $matches[2][0], $attrMatches, PREG_SET_ORDER);
            foreach ($attrMatches as $attrMatch) {
                $this->attrs[$attrMatch[1]] = $attrMatch[2];
            }
            $this->matchStart = $matches[0][1];
            $this->matchLength = strlen($matches[0][0]);
            $this->found = true;

            return true;
        }

        public function get_attribute(string $name): ?string
        {
            return $this->attrs[$name] ?? null;
        }

        public function set_attribute(string $name, string $value): void
        {
            $this->attrs[$name] = $value;
        }

        public function get_updated_html(): string
        {
            $attrString = '';
            foreach ($this->attrs as $name => $value) {
                $attrString .= ' ' . $name . '="' . htmlspecialchars($value, ENT_QUOTES) . '"';
            }

            return substr_replace($this->html, '<' . $this->tagName . $attrString . '>', $this->matchStart, $this->matchLength);
        }
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
