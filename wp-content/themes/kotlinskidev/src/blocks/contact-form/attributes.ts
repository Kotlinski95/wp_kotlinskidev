export interface ContactFormAttributes {
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
  submitButtonStyle?: string;
  successMessage: string;
  errorMessage: string;
  enableAttachments?: boolean;
  enableCaptcha: boolean;
  captchaProvider: "recaptcha" | "turnstile";
  recaptchaSiteKey: string;
  recaptchaSecretKey: string;
  turnstileSiteKey: string;
  turnstileSecretKey: string;
  redirectType: "query_param" | "thank_you_page";
  thankYouPageUrl: string;
}

export interface ContactFormPanelProps {
  attributes: ContactFormAttributes;
  setAttributes: (attrs: Partial<ContactFormAttributes>) => void;
}
