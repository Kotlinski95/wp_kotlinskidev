const PHONE_PATTERN = /^\+?[0-9()\s.-]{3,}$/;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const URL_PATTERN = /^(https?:\/\/\S+|\/\S*|#\S*)$/i;
const TRIGGER_ACTION_PATTERN = /^[a-z][a-zA-Z0-9]*(?::[a-zA-Z0-9_-]+){0,2}$/;

export const isValidPhone = (value: string): boolean => PHONE_PATTERN.test(value.trim());
export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim());
export const isValidUrl = (value: string): boolean => URL_PATTERN.test(value.trim());
export const isValidTriggerAction = (value: string): boolean => TRIGGER_ACTION_PATTERN.test(value);

export const labelContainsVisibleText = (ariaLabel: string, label: string): boolean =>
  ariaLabel.toLowerCase().includes(label.toLowerCase());
