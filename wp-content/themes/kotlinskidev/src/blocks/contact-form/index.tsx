import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  TextControl,
  TextareaControl,
  Button,
  ToggleControl,
  SelectControl,
} from "@wordpress/components";
import metadata from "./block.json";
import "./style.scss";

interface ContactFormAttributes {
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
  enableCaptcha: boolean;
  captchaProvider: "recaptcha" | "turnstile";
  recaptchaSiteKey: string;
  recaptchaSecretKey: string;
  turnstileSiteKey: string;
  turnstileSecretKey: string;
  redirectType: "query_param" | "thank_you_page";
  thankYouPageUrl: string;
}

interface EditProps {
  attributes: ContactFormAttributes;
  setAttributes: (attrs: Partial<ContactFormAttributes>) => void;
}

function Edit({ attributes, setAttributes }: EditProps) {
  const blockProps = useBlockProps({ className: "contact-form-block" });

  return (
    <div>
      <InspectorControls>
        <PanelBody title={__("Form Settings", "kotlinskidev")}>
          <TextControl
            label={__("Name Label", "kotlinskidev")}
            value={attributes.nameLabel}
            onChange={(value) => setAttributes({ nameLabel: value })}
          />
          <TextControl
            label={__("Name Placeholder", "kotlinskidev")}
            value={attributes.namePlaceholder}
            onChange={(value) => setAttributes({ namePlaceholder: value })}
          />
          <TextControl
            label={__("Email Label", "kotlinskidev")}
            value={attributes.emailLabel}
            onChange={(value) => setAttributes({ emailLabel: value })}
          />
          <TextControl
            label={__("Email Placeholder", "kotlinskidev")}
            value={attributes.emailPlaceholder}
            onChange={(value) => setAttributes({ emailPlaceholder: value })}
          />
          <TextControl
            label={__("Topic Label", "kotlinskidev")}
            value={attributes.topicLabel}
            onChange={(value) => setAttributes({ topicLabel: value })}
          />
          <TextControl
            label={__("Topic Placeholder", "kotlinskidev")}
            value={attributes.topicPlaceholder}
            onChange={(value) => setAttributes({ topicPlaceholder: value })}
          />
          <TextControl
            label={__("Message Label", "kotlinskidev")}
            value={attributes.messageLabel}
            onChange={(value) => setAttributes({ messageLabel: value })}
          />
          <TextareaControl
            label={__("Message Placeholder", "kotlinskidev")}
            value={attributes.messagePlaceholder}
            onChange={(value) => setAttributes({ messagePlaceholder: value })}
          />
          <TextControl
            label={__("Agree Checkbox Label", "kotlinskidev")}
            value={attributes.agreeLabel}
            onChange={(value) => setAttributes({ agreeLabel: value })}
          />
          <TextControl
            label={__("Submit Button Label", "kotlinskidev")}
            value={attributes.submitLabel}
            onChange={(value) => setAttributes({ submitLabel: value })}
          />
          <TextControl
            label={__("Success Message", "kotlinskidev")}
            value={attributes.successMessage}
            onChange={(value) => setAttributes({ successMessage: value })}
          />
          <TextControl
            label={__("Error Message", "kotlinskidev")}
            value={attributes.errorMessage}
            onChange={(value) => setAttributes({ errorMessage: value })}
          />
        </PanelBody>

        <PanelBody title={__("CAPTCHA Settings", "kotlinskidev")} initialOpen={false}>
          <ToggleControl
            label={__("Enable CAPTCHA Protection", "kotlinskidev")}
            checked={attributes.enableCaptcha}
            onChange={(value) => setAttributes({ enableCaptcha: value })}
            help={__("Enable CAPTCHA to prevent spam submissions.", "kotlinskidev")}
          />

          {attributes.enableCaptcha && (
            <>
              <SelectControl
                label={__("CAPTCHA Provider", "kotlinskidev")}
                value={attributes.captchaProvider}
                options={[
                  { label: __("Google reCAPTCHA v2", "kotlinskidev"), value: "recaptcha" },
                  { label: __("Cloudflare Turnstile", "kotlinskidev"), value: "turnstile" },
                ]}
                onChange={(value) =>
                  setAttributes({
                    captchaProvider: value as ContactFormAttributes["captchaProvider"],
                  })
                }
                help={__("Choose your preferred CAPTCHA provider.", "kotlinskidev")}
              />

              {attributes.captchaProvider === "recaptcha" && (
                <>
                  <TextControl
                    label={__("reCAPTCHA Site Key", "kotlinskidev")}
                    value={attributes.recaptchaSiteKey}
                    onChange={(value) => setAttributes({ recaptchaSiteKey: value })}
                    help={__("Get your site key from Google reCAPTCHA console.", "kotlinskidev")}
                    placeholder="6Lc..."
                  />
                  <TextControl
                    label={__("reCAPTCHA Secret Key", "kotlinskidev")}
                    value={attributes.recaptchaSecretKey}
                    onChange={(value) => setAttributes({ recaptchaSecretKey: value })}
                    help={__(
                      "Keep this secret! Used for server-side verification.",
                      "kotlinskidev"
                    )}
                    placeholder="6Lc..."
                    type="password"
                  />
                </>
              )}

              {attributes.captchaProvider === "turnstile" && (
                <>
                  <TextControl
                    label={__("Turnstile Site Key", "kotlinskidev")}
                    value={attributes.turnstileSiteKey}
                    onChange={(value) => setAttributes({ turnstileSiteKey: value })}
                    help={__("Get your site key from Cloudflare dashboard.", "kotlinskidev")}
                    placeholder="0x4AAA..."
                  />
                  <TextControl
                    label={__("Turnstile Secret Key", "kotlinskidev")}
                    value={attributes.turnstileSecretKey}
                    onChange={(value) => setAttributes({ turnstileSecretKey: value })}
                    help={__(
                      "Keep this secret! Used for server-side verification.",
                      "kotlinskidev"
                    )}
                    placeholder="0x4AAA..."
                    type="password"
                  />
                </>
              )}
            </>
          )}
        </PanelBody>

        <PanelBody title={__("Redirect Settings", "kotlinskidev")} initialOpen={false}>
          <SelectControl
            label={__("After Form Submission", "kotlinskidev")}
            value={attributes.redirectType}
            options={[
              {
                label: __("Show success message on same page", "kotlinskidev"),
                value: "query_param",
              },
              {
                label: __("Redirect to thank you page", "kotlinskidev"),
                value: "thank_you_page",
              },
            ]}
            onChange={(value) =>
              setAttributes({ redirectType: value as ContactFormAttributes["redirectType"] })
            }
            help={__("Choose what happens after a successful form submission.", "kotlinskidev")}
          />

          {attributes.redirectType === "thank_you_page" && (
            <TextControl
              label={__("Thank You Page URL", "kotlinskidev")}
              value={attributes.thankYouPageUrl}
              onChange={(value) => setAttributes({ thankYouPageUrl: value })}
              help={__(
                "Enter the full URL of your thank you page. Leave empty to use WordPress default.",
                "kotlinskidev"
              )}
              placeholder="https://yoursite.com/thank-you/"
              type="url"
            />
          )}
        </PanelBody>
      </InspectorControls>
      <form {...blockProps}>
        <label htmlFor="contact-form-preview-name">
          {attributes.nameLabel}
          <input
            id="contact-form-preview-name"
            type="text"
            placeholder={attributes.namePlaceholder}
            disabled
          />
        </label>
        <label htmlFor="contact-form-preview-email">
          {attributes.emailLabel}
          <input
            id="contact-form-preview-email"
            type="email"
            placeholder={attributes.emailPlaceholder}
            disabled
          />
        </label>
        <label htmlFor="contact-form-preview-topic">
          {attributes.topicLabel}
          <input
            id="contact-form-preview-topic"
            type="text"
            placeholder={attributes.topicPlaceholder}
            disabled
          />
        </label>
        <label htmlFor="contact-form-preview-message">
          {attributes.messageLabel}
          <textarea
            id="contact-form-preview-message"
            placeholder={attributes.messagePlaceholder}
            disabled
          />
        </label>
        <label htmlFor="contact-form-preview-agree">
          <input id="contact-form-preview-agree" type="checkbox" disabled /> {attributes.agreeLabel}
        </label>

        {attributes.enableCaptcha &&
          ((attributes.captchaProvider === "recaptcha" && attributes.recaptchaSiteKey) ||
            (attributes.captchaProvider === "turnstile" && attributes.turnstileSiteKey)) && (
            <div
              className="recaptcha-preview"
              style={{
                border: "0.125rem dashed #ccc",
                padding: "1.25rem",
                textAlign: "center",
                margin: "0.625rem 0",
                backgroundColor: "#f9f9f9",
              }}
            >
              <p style={{ margin: 0, color: "#666" }}>
                {attributes.captchaProvider === "recaptcha"
                  ? __("reCAPTCHA will appear here", "kotlinskidev")
                  : __("Cloudflare Turnstile will appear here", "kotlinskidev")}
              </p>
            </div>
          )}

        <Button disabled>{attributes.submitLabel}</Button>
      </form>
    </div>
  );
}

registerBlockType<ContactFormAttributes>(metadata.name, {
  edit: Edit,
  save() {
    return null;
  },
});
