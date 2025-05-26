import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  TextControl,
  TextareaControl,
  Button,
} from "@wordpress/components";
import "./style.scss";

registerBlockType("contact-form-ts/form", {
  title: __("Contact Form", "contact-form-ts"),
  icon: "email",
  category: "common",
  attributes: {
    nameLabel: { type: "string", default: "Name" },
    namePlaceholder: { type: "string", default: "Your Name" },
    emailLabel: { type: "string", default: "Email" },
    emailPlaceholder: { type: "string", default: "Your Email" },
    topicLabel: { type: "string", default: "Topic" },
    topicPlaceholder: { type: "string", default: "Topic" },
    messageLabel: { type: "string", default: "Message" },
    messagePlaceholder: { type: "string", default: "Your Message" },
    agreeLabel: {
      type: "string",
      default: "I agree to be contacted via email.",
    },
    submitLabel: { type: "string", default: "Send" },
    successMessage: {
      type: "string",
      default: "Thank you! Your message has been sent.",
    },
    errorMessage: {
      type: "string",
      default: "Sorry, there was an error. Please try again.",
    },
  },
  edit({
    attributes,
    setAttributes,
  }: {
    attributes: {
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      topicLabel: string;
      topicPlaceholder: string;
      messageLabel: string;
      messagePlaceholder: string;
      agreeLabel: string;
      submitLabel: string;
      successMessage: string;
      errorMessage: string;
    };
    setAttributes: (
      attrs: Partial<{
        nameLabel: string;
        namePlaceholder: string;
        emailLabel: string;
        emailPlaceholder: string;
        topicLabel: string;
        topicPlaceholder: string;
        messageLabel: string;
        messagePlaceholder: string;
        agreeLabel: string;
        submitLabel: string;
        successMessage: string;
        errorMessage: string;
      }>
    ) => void;
  }) {
    const blockProps = useBlockProps({ className: "contact-form-block" });

    return (
      <div>
        <InspectorControls>
          <PanelBody title={__("Form Settings", "contact-form-ts")}>
            <TextControl
              label={__("Name Label", "contact-form-ts")}
              value={attributes.nameLabel}
              onChange={(value) => setAttributes({ nameLabel: value })}
            />
            <TextControl
              label={__("Name Placeholder", "contact-form-ts")}
              value={attributes.namePlaceholder}
              onChange={(value) => setAttributes({ namePlaceholder: value })}
            />
            <TextControl
              label={__("Email Label", "contact-form-ts")}
              value={attributes.emailLabel}
              onChange={(value) => setAttributes({ emailLabel: value })}
            />
            <TextControl
              label={__("Email Placeholder", "contact-form-ts")}
              value={attributes.emailPlaceholder}
              onChange={(value) => setAttributes({ emailPlaceholder: value })}
            />
            <TextControl
              label={__("Topic Label", "contact-form-ts")}
              value={attributes.topicLabel}
              onChange={(value) => setAttributes({ topicLabel: value })}
            />
            <TextControl
              label={__("Topic Placeholder", "contact-form-ts")}
              value={attributes.topicPlaceholder}
              onChange={(value) => setAttributes({ topicPlaceholder: value })}
            />
            <TextControl
              label={__("Message Label", "contact-form-ts")}
              value={attributes.messageLabel}
              onChange={(value) => setAttributes({ messageLabel: value })}
            />
            <TextareaControl
              label={__("Message Placeholder", "contact-form-ts")}
              value={attributes.messagePlaceholder}
              onChange={(value) => setAttributes({ messagePlaceholder: value })}
            />
            <TextControl
              label={__("Agree Checkbox Label", "contact-form-ts")}
              value={attributes.agreeLabel}
              onChange={(value) => setAttributes({ agreeLabel: value })}
            />
            <TextControl
              label={__("Submit Button Label", "contact-form-ts")}
              value={attributes.submitLabel}
              onChange={(value) => setAttributes({ submitLabel: value })}
            />
            <TextControl
              label={__("Success Message", "contact-form-ts")}
              value={attributes.successMessage}
              onChange={(value) => setAttributes({ successMessage: value })}
            />
            <TextControl
              label={__("Error Message", "contact-form-ts")}
              value={attributes.errorMessage}
              onChange={(value) => setAttributes({ errorMessage: value })}
            />
          </PanelBody>
        </InspectorControls>
        <form {...blockProps}>
          <label>
            {attributes.nameLabel}
            <input
              type="text"
              placeholder={attributes.namePlaceholder}
              disabled
            />
          </label>
          <label>
            {attributes.emailLabel}
            <input
              type="email"
              placeholder={attributes.emailPlaceholder}
              disabled
            />
          </label>
          <label>
            {attributes.topicLabel}
            <input
              type="text"
              placeholder={attributes.topicPlaceholder}
              disabled
            />
          </label>
          <label>
            {attributes.messageLabel}
            <textarea placeholder={attributes.messagePlaceholder} disabled />
          </label>
          <label>
            <input type="checkbox" disabled /> {attributes.agreeLabel}
          </label>
          <Button disabled>
            {attributes.submitLabel}
          </Button>
        </form>
      </div>
    );
  },
  save() {
    return null; // Rendered dynamically on the server.
  },
});
