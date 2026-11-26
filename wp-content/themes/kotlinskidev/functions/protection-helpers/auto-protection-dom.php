<?php

if (!function_exists('kotlinskidev_load_protection_dom')) {
    function kotlinskidev_load_protection_dom($content)
    {
        $dom = new DOMDocument();
        $dom->encoding = 'UTF-8';

        libxml_use_internal_errors(true);

        $dom->loadHTML('<?xml encoding="UTF-8">' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        libxml_clear_errors();

        return $dom;
    }
}

if (!function_exists('kotlinskidev_serialize_protection_dom')) {
    function kotlinskidev_serialize_protection_dom($dom)
    {
        $modifiedContent = $dom->saveHTML();

        $modifiedContent = preg_replace('/^<!DOCTYPE.+?>/', '', $modifiedContent);
        $modifiedContent = preg_replace('/<\?xml[^>]+\?>/', '', $modifiedContent);
        $modifiedContent = str_replace(['<html><body>', '</body></html>'], '', $modifiedContent);

        return $modifiedContent;
    }
}

if (!function_exists('kotlinskidev_create_protected_span')) {
    function kotlinskidev_create_protected_span($dom, $type, $encrypted)
    {
        $protectedSpan = $dom->createElement('span');
        $protectedSpan->setAttribute('class', 'protected-content protected-content--' . $type);
        $protectedSpan->setAttribute('data-protected', 'true');
        $protectedSpan->setAttribute('data-protection-type', $type);
        $protectedSpan->setAttribute('data-original-content', $encrypted);

        return $protectedSpan;
    }
}

if (!function_exists('kotlinskidev_protected_span_markup')) {
    function kotlinskidev_protected_span_markup($type, $encrypted)
    {
        return sprintf(
            '<span class="protected-content protected-content--%1$s" data-protected="true" data-protection-type="%1$s" data-original-content="%2$s"></span>',
            $type,
            htmlspecialchars($encrypted, ENT_QUOTES)
        );
    }
}

if (!function_exists('kotlinskidev_protect_text_nodes_matching')) {
    function kotlinskidev_protect_text_nodes_matching($dom, $xpath, $pattern, $type)
    {
        $textNodes = $xpath->query('//text()[not(ancestor::a)]');
        foreach ($textNodes as $textNode) {
            $text = $textNode->nodeValue;
            if (!preg_match($pattern, $text)) {
                continue;
            }

            $newText = preg_replace_callback($pattern, function ($matches) use ($type) {
                return kotlinskidev_protected_span_markup($type, kotlinskidev_encrypt_content($matches[0]));
            }, $text);

            if ($newText !== $text) {
                $fragment = $dom->createDocumentFragment();
                $fragment->appendXML($newText);
                $textNode->parentNode->replaceChild($fragment, $textNode);
            }
        }
    }
}
