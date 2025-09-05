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
    enableCaptcha: { type: "boolean", default: false },
    captchaProvider: { type: "string", default: "recaptcha" },
    recaptchaSiteKey: { type: "string", default: "" },
    recaptchaSecretKey: { type: "string", default: "" },
    turnstileSiteKey: { type: "string", default: "" },
    turnstileSecretKey: { type: "string", default: "" },
    redirectType: { type: "string", default: "query_param" },
    thankYouPageUrl: { type: "string", default: "" },
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
      enableCaptcha: boolean;
      captchaProvider: string;
      recaptchaSiteKey: string;
      recaptchaSecretKey: string;
      turnstileSiteKey: string;
      turnstileSecretKey: string;
      redirectType: string;
      thankYouPageUrl: string;
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
        enableCaptcha: boolean;
        captchaProvider: string;
        recaptchaSiteKey: string;
        recaptchaSecretKey: string;
        turnstileSiteKey: string;
        turnstileSecretKey: string;
        redirectType: string;
        thankYouPageUrl: string;
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
          
          <PanelBody title={__("CAPTCHA Settings", "contact-form-ts")} initialOpen={false}>
            <ToggleControl
              label={__("Enable CAPTCHA Protection", "contact-form-ts")}
              checked={attributes.enableCaptcha}
              onChange={(value) => setAttributes({ enableCaptcha: value })}
              help={__("Enable CAPTCHA to prevent spam submissions.", "contact-form-ts")}
            />
            
            {attributes.enableCaptcha && (
              <>
                <SelectControl
                  label={__("CAPTCHA Provider", "contact-form-ts")}
                  value={attributes.captchaProvider}
                  options={[
                    { label: __("Google reCAPTCHA v2", "contact-form-ts"), value: "recaptcha" },
                    { label: __("Cloudflare Turnstile", "contact-form-ts"), value: "turnstile" },
                  ]}
                  onChange={(value) => setAttributes({ captchaProvider: value })}
                  help={__("Choose your preferred CAPTCHA provider.", "contact-form-ts")}
                />
                
                {attributes.captchaProvider === "recaptcha" && (
                  <>
                    <TextControl
                      label={__("reCAPTCHA Site Key", "contact-form-ts")}
                      value={attributes.recaptchaSiteKey}
                      onChange={(value) => setAttributes({ recaptchaSiteKey: value })}
                      help={__("Get your site key from Google reCAPTCHA console.", "contact-form-ts")}
                      placeholder="6Lc..."
                    />
                    <TextControl
                      label={__("reCAPTCHA Secret Key", "contact-form-ts")}
                      value={attributes.recaptchaSecretKey}
                      onChange={(value) => setAttributes({ recaptchaSecretKey: value })}
                      help={__("Keep this secret! Used for server-side verification.", "contact-form-ts")}
                      placeholder="6Lc..."
                      type="password"
                    />
                  </>
                )}
                
                {attributes.captchaProvider === "turnstile" && (
                  <>
                    <TextControl
                      label={__("Turnstile Site Key", "contact-form-ts")}
                      value={attributes.turnstileSiteKey}
                      onChange={(value) => setAttributes({ turnstileSiteKey: value })}
                      help={__("Get your site key from Cloudflare dashboard.", "contact-form-ts")}
                      placeholder="0x4AAA..."
                    />
                    <TextControl
                      label={__("Turnstile Secret Key", "contact-form-ts")}
                      value={attributes.turnstileSecretKey}
                      onChange={(value) => setAttributes({ turnstileSecretKey: value })}
                      help={__("Keep this secret! Used for server-side verification.", "contact-form-ts")}
                      placeholder="0x4AAA..."
                      type="password"
                    />
                  </>
                )}
              </>
            )}
          </PanelBody>

          <PanelBody title={__("Redirect Settings", "contact-form-ts")} initialOpen={false}>
            <SelectControl
              label={__("After Form Submission", "contact-form-ts")}
              value={attributes.redirectType}
              options={[
                { label: __("Show success message on same page", "contact-form-ts"), value: "query_param" },
                { label: __("Redirect to thank you page", "contact-form-ts"), value: "thank_you_page" },
              ]}
              onChange={(value) => setAttributes({ redirectType: value })}
              help={__("Choose what happens after a successful form submission.", "contact-form-ts")}
            />
            
            {attributes.redirectType === "thank_you_page" && (
              <TextControl
                label={__("Thank You Page URL", "contact-form-ts")}
                value={attributes.thankYouPageUrl}
                onChange={(value) => setAttributes({ thankYouPageUrl: value })}
                help={__("Enter the full URL of your thank you page. Leave empty to use WordPress default.", "contact-form-ts")}
                placeholder="https://yoursite.com/thank-you/"
                type="url"
              />
            )}
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
          
          {attributes.enableCaptcha && (
            (attributes.captchaProvider === "recaptcha" && attributes.recaptchaSiteKey) ||
            (attributes.captchaProvider === "turnstile" && attributes.turnstileSiteKey)
          ) && (
            <div className="recaptcha-preview" style={{
              border: '2px dashed #ccc',
              padding: '20px',
              textAlign: 'center',
              margin: '10px 0',
              backgroundColor: '#f9f9f9'
            }}>
              <p style={{ margin: 0, color: '#666' }}>
                {attributes.captchaProvider === "recaptcha" 
                  ? __("reCAPTCHA will appear here", "contact-form-ts")
                  : __("Cloudflare Turnstile will appear here", "contact-form-ts")
                }
              </p>
            </div>
          )}
          
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
