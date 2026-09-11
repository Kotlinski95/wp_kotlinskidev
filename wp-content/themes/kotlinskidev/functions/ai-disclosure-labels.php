<?php
function kotlinskidev_ai_disclosure_label($block)
{
    if ($block['blockName'] === 'core/cover' && ($block['attrs']['backgroundType'] ?? '') === 'video') {
        return esc_html__('AI-generated video', 'kotlinskidev');
    }

    return esc_html__('AI-generated image', 'kotlinskidev');
}

function kotlinskidev_inject_ai_disclosure_label($block_content, $block)
{
    if (!in_array($block['blockName'], ['core/image', 'core/cover'], true)) {
        return $block_content;
    }

    $attachment_id = absint($block['attrs']['id'] ?? 0);
    if (!$attachment_id || !get_post_meta($attachment_id, '_kotlinskidev_ai_generated', true)) {
        return $block_content;
    }

    $badge = '<span class="kt-ai-disclosure-badge">' . kotlinskidev_ai_disclosure_label($block) . '</span>';

    return preg_replace('/(<\/(?:figure|div)>)\s*$/', $badge . '$1', $block_content, 1);
}
add_filter('render_block', 'kotlinskidev_inject_ai_disclosure_label', 10, 2);

function kotlinskidev_ai_generated_attachment_field($form_fields, $post)
{
    $checked = get_post_meta($post->ID, '_kotlinskidev_ai_generated', true);

    $form_fields['kotlinskidev_ai_generated'] = [
        'label' => __('AI-generated', 'kotlinskidev'),
        'input' => 'html',
        'html' => '<input type="checkbox" name="attachments[' . $post->ID . '][kotlinskidev_ai_generated]" id="attachments-' . $post->ID . '-kotlinskidev_ai_generated" value="1"' . checked($checked, '1', false) . ' /> <label for="attachments-' . $post->ID . '-kotlinskidev_ai_generated">' . esc_html__('Show a visible disclosure label wherever this media is used', 'kotlinskidev') . '</label>',
        'helps' => __('Required by EU AI Act Art. 50(4) for AI-generated/manipulated media. Applies automatically to every Image or Cover block using this file.', 'kotlinskidev'),
    ];

    return $form_fields;
}
add_filter('attachment_fields_to_edit', 'kotlinskidev_ai_generated_attachment_field', 10, 2);

function kotlinskidev_save_ai_generated_attachment_field($post, $attachment)
{
    if (!empty($attachment['kotlinskidev_ai_generated'])) {
        update_post_meta($post['ID'], '_kotlinskidev_ai_generated', '1');
    } else {
        delete_post_meta($post['ID'], '_kotlinskidev_ai_generated');
    }

    return $post;
}
add_filter('attachment_fields_to_save', 'kotlinskidev_save_ai_generated_attachment_field', 10, 2);
