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
        private int $cursor = 0;
        private ?array $current = null;
        private array $edits = [];

        public function __construct(string $html)
        {
            $this->html = $html;
        }

        private function commitCurrent(): void
        {
            if ($this->current !== null) {
                $this->edits[] = $this->current;
                $this->current = null;
            }
        }

        public function next_tag(): bool
        {
            $this->commitCurrent();

            if (!preg_match('/<([a-zA-Z0-9-]+)((?:\s+[a-zA-Z-]+(?:="[^"]*")?)*)\s*\/?>/', $this->html, $matches, PREG_OFFSET_CAPTURE, $this->cursor)) {
                return false;
            }

            $attrs = [];
            preg_match_all('/([a-zA-Z-]+)="([^"]*)"/', $matches[2][0], $attrMatches, PREG_SET_ORDER);
            foreach ($attrMatches as $attrMatch) {
                $attrs[$attrMatch[1]] = $attrMatch[2];
            }

            $start = $matches[0][1];
            $length = strlen($matches[0][0]);
            $this->cursor = $start + $length;

            $this->current = [
                'tagName' => $matches[1][0],
                'attrs' => $attrs,
                'start' => $start,
                'length' => $length,
            ];

            return true;
        }

        public function get_attribute(string $name): ?string
        {
            return $this->current['attrs'][$name] ?? null;
        }

        public function set_attribute(string $name, string $value): void
        {
            if ($this->current !== null) {
                $this->current['attrs'][$name] = $value;
            }
        }

        public function get_updated_html(): string
        {
            $this->commitCurrent();

            $result = $this->html;
            $offsetShift = 0;
            foreach ($this->edits as $edit) {
                $attrString = '';
                foreach ($edit['attrs'] as $name => $value) {
                    $attrString .= ' ' . $name . '="' . htmlspecialchars($value, ENT_QUOTES) . '"';
                }
                $replacement = '<' . $edit['tagName'] . $attrString . '>';
                $start = $edit['start'] + $offsetShift;
                $result = substr_replace($result, $replacement, $start, $edit['length']);
                $offsetShift += strlen($replacement) - $edit['length'];
            }

            return $result;
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
