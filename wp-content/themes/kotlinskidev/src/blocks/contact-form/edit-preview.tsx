import React from "react";
import { __ } from "@wordpress/i18n";
import { Button } from "@wordpress/components";
import type { ContactFormAttributes } from "./attributes";

const PreviewTextFields = ({ attributes }: { attributes: ContactFormAttributes }): JSX.Element => (
  <>
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
  </>
);

export const FormPreviewFields = ({
  attributes,
}: {
  attributes: ContactFormAttributes;
}): JSX.Element => (
  <>
    <PreviewTextFields attributes={attributes} />
    <label htmlFor="contact-form-preview-agree">
      <input id="contact-form-preview-agree" type="checkbox" disabled /> {attributes.agreeLabel}
    </label>

    {attributes.enableAttachments && (
      <label htmlFor="contact-form-preview-attachments">
        {__("Attachments (optional)", "kotlinskidev")}
        <input id="contact-form-preview-attachments" type="file" multiple disabled />
      </label>
    )}
  </>
);

const hasCaptchaSiteKey = (attributes: ContactFormAttributes): boolean =>
  Boolean(
    (attributes.captchaProvider === "recaptcha" && attributes.recaptchaSiteKey) ||
    (attributes.captchaProvider === "turnstile" && attributes.turnstileSiteKey)
  );

const CaptchaPreview = ({ attributes }: { attributes: ContactFormAttributes }): JSX.Element => (
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
);

export const FormPreview = ({
  attributes,
  blockProps,
}: {
  attributes: ContactFormAttributes;
  blockProps: Record<string, unknown>;
}): JSX.Element => (
  <form {...blockProps}>
    <FormPreviewFields attributes={attributes} />
    {attributes.enableCaptcha && hasCaptchaSiteKey(attributes) && (
      <CaptchaPreview attributes={attributes} />
    )}
    <Button disabled>{attributes.submitLabel}</Button>
  </form>
);
