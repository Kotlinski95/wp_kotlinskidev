import React, { useEffect, useState, type ComponentType } from "react";
import apiFetch from "@wordpress/api-fetch";
import * as blockEditor from "@wordpress/block-editor";
import { ComboboxControl, Notice, TextControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { SpeedDialItemAttributes } from "../types";
import { isValidEmail, isValidPhone, isValidTriggerAction, isValidUrl } from "../validation";

interface LinkControlValue {
  url?: string;
  opensInNewTab?: boolean;
}

interface LinkControlProps {
  value: LinkControlValue;
  settings: unknown[];
  showSuggestions: boolean;
  onChange: (value: LinkControlValue) => void;
}

const { __experimentalLinkControl: LinkControl } = blockEditor as unknown as {
  __experimentalLinkControl: ComponentType<LinkControlProps>;
};

type SetAttributes = (attrs: Partial<SpeedDialItemAttributes>) => void;

interface FieldProps {
  attributes: SpeedDialItemAttributes;
  setAttributes: SetAttributes;
}

interface ComboOption {
  label: string;
  value: string;
}

type TriggerEntry = string | { key?: string; value?: string; label?: string };

interface TriggerOptionsResponse {
  features?: TriggerEntry[];
  profiles?: TriggerEntry[];
}

const TRIGGER_OPTIONS_PATH = "/kotlinskidev-a11y/v1/trigger-options";
const STATIC_TRIGGER_ACTIONS = ["open", "close", "toggle", "reset"];

const entryKey = (entry: TriggerEntry): string =>
  typeof entry === "string" ? entry : (entry.key ?? entry.value ?? "");

const entryLabel = (entry: TriggerEntry, fallback: string): string =>
  typeof entry === "string" ? fallback : (entry.label ?? fallback);

const toOptions = (prefix: string, entries: TriggerEntry[] = []): ComboOption[] =>
  entries
    .filter((entry) => entryKey(entry) !== "")
    .map((entry) => {
      const value = `${prefix}:${entryKey(entry)}`;
      return { value, label: entryLabel(entry, value) };
    });

export const buildTriggerOptions = (response: TriggerOptionsResponse): ComboOption[] => [
  ...STATIC_TRIGGER_ACTIONS.map((value) => ({ value, label: value })),
  ...toOptions("feature", response.features),
  ...toOptions("profile", response.profiles),
];

function useTriggerOptions() {
  const [options, setOptions] = useState<ComboOption[]>([]);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<TriggerOptionsResponse>({ path: TRIGGER_OPTIONS_PATH })
      .then((response) => {
        if (active) {
          setOptions(buildTriggerOptions(response));
        }
      })
      .catch(() => {
        if (active) {
          setOptions(buildTriggerOptions({}));
          setUnavailable(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { options, unavailable };
}

function ContactFields({ attributes, setAttributes }: Readonly<FieldProps>) {
  const isPhone = "phone" === attributes.action;
  const isValid = isPhone ? isValidPhone : isValidEmail;
  const hasInvalidValue = "" !== attributes.value && !isValid(attributes.value);
  const invalidHint = isPhone
    ? __("Use digits, spaces, dashes and an optional leading +.", "kotlinskidev")
    : __("Enter an address like name@example.com.", "kotlinskidev");

  return (
    <>
      <ToggleControl
        __nextHasNoMarginBottom
        label={__("Use the site contact details", "kotlinskidev")}
        checked={attributes.useSiteContact}
        onChange={(useSiteContact: boolean) => setAttributes({ useSiteContact })}
      />
      {!attributes.useSiteContact && (
        <TextControl
          __nextHasNoMarginBottom
          label={isPhone ? __("Phone number", "kotlinskidev") : __("Email address", "kotlinskidev")}
          type={isPhone ? "tel" : "email"}
          value={attributes.value}
          onChange={(value: string) => setAttributes({ value })}
          help={hasInvalidValue ? invalidHint : undefined}
        />
      )}
    </>
  );
}

function LinkFields({ attributes, setAttributes }: Readonly<FieldProps>) {
  const hasInvalidValue = "" !== attributes.value && !isValidUrl(attributes.value);

  return (
    <>
      <LinkControl
        value={{ url: attributes.value, opensInNewTab: attributes.opensInNewTab }}
        settings={[]}
        onChange={(next) => setAttributes({ value: next.url ?? "" })}
        showSuggestions
      />
      {hasInvalidValue && (
        <Notice status="warning" isDismissible={false}>
          {__("Use a link starting with https://, http://, / or #.", "kotlinskidev")}
        </Notice>
      )}
      <ToggleControl
        __nextHasNoMarginBottom
        label={__("Open in a new tab", "kotlinskidev")}
        checked={attributes.opensInNewTab}
        onChange={(opensInNewTab: boolean) => setAttributes({ opensInNewTab })}
      />
    </>
  );
}

function TriggerFields({ attributes, setAttributes }: Readonly<FieldProps>) {
  const { options, unavailable } = useTriggerOptions();
  const [typed, setTyped] = useState("");
  const current = attributes.triggerAction;
  const extra = [typed, current].filter(
    (value) =>
      value !== "" && isValidTriggerAction(value) && !options.some((o) => o.value === value)
  );
  const allOptions = [...options, ...extra.map((value) => ({ value, label: value }))];
  const hasInvalidValue =
    ("" !== typed && !isValidTriggerAction(typed)) ||
    ("" !== current && !isValidTriggerAction(current));

  return (
    <>
      {unavailable && (
        <Notice status="warning" isDismissible={false}>
          {__(
            "The accessibility plugin did not answer, so only the basic actions are listed. The item is hidden on the front end while the plugin is inactive.",
            "kotlinskidev"
          )}
        </Notice>
      )}
      <ComboboxControl
        __nextHasNoMarginBottom
        label={__("Accessibility action", "kotlinskidev")}
        value={current}
        options={allOptions}
        onChange={(triggerAction: string | null | undefined) =>
          setAttributes({ triggerAction: triggerAction ?? "" })
        }
        onFilterValueChange={setTyped}
        help={
          hasInvalidValue
            ? __(
                "Use a name like open, profile:adhdFriendly or feature:biggerText:2.",
                "kotlinskidev"
              )
            : undefined
        }
      />
    </>
  );
}

export function ActionFields({ attributes, setAttributes }: Readonly<FieldProps>) {
  switch (attributes.action) {
    case "phone":
    case "email":
      return <ContactFields attributes={attributes} setAttributes={setAttributes} />;
    case "url":
      return <LinkFields attributes={attributes} setAttributes={setAttributes} />;
    case "trigger":
      return <TriggerFields attributes={attributes} setAttributes={setAttributes} />;
    default:
      return null;
  }
}
