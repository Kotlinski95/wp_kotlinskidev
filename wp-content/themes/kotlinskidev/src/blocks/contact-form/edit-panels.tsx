import React from "react";
import { __ } from "@wordpress/i18n";
import {
  PanelBody,
  TextControl,
  TextareaControl,
  ToggleControl,
  SelectControl,
} from "@wordpress/components";
import { BUTTON_STYLE_OPTIONS, resolveButtonStyle } from "@utils/button-style-variants";
import type { ContactFormAttributes, ContactFormPanelProps } from "./attributes";

const RecaptchaKeyFields = ({ attributes, setAttributes }: ContactFormPanelProps): JSX.Element => (
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
      help={__("Keep this secret! Used for server-side verification.", "kotlinskidev")}
      placeholder="6Lc..."
      type="password"
    />
  </>
);

const TurnstileKeyFields = ({ attributes, setAttributes }: ContactFormPanelProps): JSX.Element => (
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
      help={__("Keep this secret! Used for server-side verification.", "kotlinskidev")}
      placeholder="0x4AAA..."
      type="password"
    />
  </>
);

const NameAndEmailControls = ({
  attributes,
  setAttributes,
}: ContactFormPanelProps): JSX.Element => (
  <>
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
  </>
);

const TopicAndMessageControls = ({
  attributes,
  setAttributes,
}: ContactFormPanelProps): JSX.Element => (
  <>
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
  </>
);

export const FormSettingsPanel = ({
  attributes,
  setAttributes,
}: ContactFormPanelProps): JSX.Element => (
  <PanelBody title={__("Form Settings", "kotlinskidev")}>
    <NameAndEmailControls attributes={attributes} setAttributes={setAttributes} />
    <TopicAndMessageControls attributes={attributes} setAttributes={setAttributes} />
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
    <SelectControl
      label={__("Button style", "kotlinskidev")}
      value={resolveButtonStyle(attributes.submitButtonStyle)}
      options={[...BUTTON_STYLE_OPTIONS]}
      onChange={(value) => setAttributes({ submitButtonStyle: value })}
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
);

export const AttachmentsPanel = ({
  attributes,
  setAttributes,
}: ContactFormPanelProps): JSX.Element => (
  <PanelBody title={__("Attachments", "kotlinskidev")} initialOpen={false}>
    <ToggleControl
      label={__("Allow file attachments", "kotlinskidev")}
      checked={Boolean(attributes.enableAttachments)}
      onChange={(value) => setAttributes({ enableAttachments: value })}
      help={__(
        "Visitors can attach up to 3 files (10 MB total). Files are emailed to you and are not stored on the website.",
        "kotlinskidev"
      )}
    />
  </PanelBody>
);

export const CaptchaPanel = ({ attributes, setAttributes }: ContactFormPanelProps): JSX.Element => (
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
          <RecaptchaKeyFields {...{ attributes, setAttributes }} />
        )}

        {attributes.captchaProvider === "turnstile" && (
          <TurnstileKeyFields {...{ attributes, setAttributes }} />
        )}
      </>
    )}
  </PanelBody>
);

export const RedirectPanel = ({
  attributes,
  setAttributes,
}: ContactFormPanelProps): JSX.Element => (
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
);
