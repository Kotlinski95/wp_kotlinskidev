import React, { useState, useRef, useEffect } from "react";
import {
  registerFormatType,
  applyFormat,
  insert,
  getActiveFormat,
  useAnchor,
} from "@wordpress/rich-text";
import type { RichTextValue } from "@wordpress/rich-text";
import { RichTextToolbarButton } from "@wordpress/block-editor";
import { Popover, SelectControl, Button, Notice } from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";
import { __ } from "@wordpress/i18n";

export const OFFER_FORMAT = "kotlinskidev/offer-value" as const;

export const OFFER_FIELDS = [
  "price",
  "price_from",
  "price_to",
  "duration",
  "label",
  "included",
] as const;

export type OfferField = (typeof OFFER_FIELDS)[number];

export interface OfferVariantSummary {
  key: string;
  label: string;
}

export interface OfferSummary {
  key: string;
  name: string;
  currency: string;
  is_placeholder: boolean;
  variants: OfferVariantSummary[];
}

export interface OfferValueResponse {
  value: string;
  placeholder: boolean;
}

export interface OfferSelection {
  offer: string;
  variant: string;
  field: string;
}

type FormatObject = { type: string; attributes?: Record<string, string> };
type UseAnchorSettings = NonNullable<Parameters<typeof useAnchor>[0]["settings"]>;
type ActiveFormat = NonNullable<ReturnType<typeof getActiveFormat>> & {
  attributes?: Record<string, string>;
};

const ANCHOR_SETTINGS = {
  tagName: "span",
  className: "kt-offer",
} as unknown as UseAnchorSettings;

export function isSelectionComplete(selection: OfferSelection): boolean {
  return Boolean(selection.offer && selection.variant && selection.field);
}

export function findFormatRun(value: RichTextValue): { start: number; end: number } | null {
  const formats = value.formats as (FormatObject[] | undefined)[];
  const caret = value.start ?? 0;
  const hasFormat = (index: number): boolean =>
    Boolean(formats[index]?.some((format) => format.type === OFFER_FORMAT));
  let anchorIndex = -1;
  if (hasFormat(caret)) {
    anchorIndex = caret;
  } else if (caret > 0 && hasFormat(caret - 1)) {
    anchorIndex = caret - 1;
  }
  if (anchorIndex === -1) {
    return null;
  }
  let start = anchorIndex;
  let end = anchorIndex + 1;
  while (start > 0 && hasFormat(start - 1)) {
    start -= 1;
  }
  while (end < formats.length && hasFormat(end)) {
    end += 1;
  }
  return { start, end };
}

export function insertOfferValue(
  value: RichTextValue,
  selection: OfferSelection,
  resolved: OfferValueResponse | null,
  run: { start: number; end: number } | null = null
): RichTextValue | null {
  if (!resolved || !resolved.value || !isSelectionComplete(selection)) {
    return null;
  }
  const start = run ? run.start : (value.start ?? 0);
  const end = run ? run.end : (value.end ?? start);
  const inserted = insert(value, resolved.value, start, end);
  return applyFormat(
    inserted,
    {
      type: OFFER_FORMAT,
      attributes: {
        offer: selection.offer,
        variant: selection.variant,
        field: selection.field,
      },
    } as unknown as Parameters<typeof applyFormat>[1],
    start,
    start + resolved.value.length
  );
}

export function fetchOffers(): Promise<OfferSummary[]> {
  return apiFetch<OfferSummary[]>({ path: "/kotlinskidev/v1/offers" });
}

export function fetchOfferValue(selection: OfferSelection): Promise<OfferValueResponse> {
  return apiFetch<OfferValueResponse>({
    path: addQueryArgs("/kotlinskidev/v1/offer-value", {
      offer: selection.offer,
      variant: selection.variant,
      field: selection.field,
    }),
  });
}

function fieldLabel(field: OfferField): string {
  switch (field) {
    case "price":
      return __("Price", "kotlinskidev");
    case "price_from":
      return __("Price from", "kotlinskidev");
    case "price_to":
      return __("Price to", "kotlinskidev");
    case "duration":
      return __("Duration", "kotlinskidev");
    case "label":
      return __("Label", "kotlinskidev");
    default:
      return __("Included", "kotlinskidev");
  }
}

function OfferIcon(): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 12.2V4h8.2l9.8 9.8-8.2 8.2L3 12.2Zm5-5.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface FormatEditProps {
  isActive: boolean;
  value: RichTextValue;
  onChange: (value: RichTextValue) => void;
  contentRef: React.MutableRefObject<HTMLElement>;
}

export function OfferValueButton({
  isActive,
  value,
  onChange,
  contentRef,
}: FormatEditProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [offers, setOffers] = useState<OfferSummary[]>([]);
  const [selection, setSelection] = useState<OfferSelection>({
    offer: "",
    variant: "",
    field: "price",
  });
  const [isUnresolved, setIsUnresolved] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const activeFormat = getActiveFormat(value, OFFER_FORMAT) as ActiveFormat | undefined;
  const isEitherActive = isActive || Boolean(activeFormat);

  const liveAnchor = useAnchor({
    editableContentElement: contentRef.current,
    settings: ANCHOR_SETTINGS,
  });
  const frozenAnchorRef = useRef<typeof liveAnchor>(null);
  if (!isOpen && liveAnchor) {
    frozenAnchorRef.current = liveAnchor;
  }
  const popoverAnchor = isOpen ? (frozenAnchorRef.current ?? liveAnchor) : liveAnchor;

  const capturedValueRef = useRef<RichTextValue>(value);
  useEffect(() => {
    if (!isOpen) {
      capturedValueRef.current = value;
    }
  }, [value, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    let cancelled = false;
    fetchOffers()
      .then((list) => {
        if (!cancelled) {
          setOffers(list);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOffers([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      const attrs = activeFormat?.attributes;
      setSelection({
        offer: attrs?.["data-kt-offer"] ?? attrs?.offer ?? "",
        variant: attrs?.["data-kt-variant"] ?? attrs?.variant ?? "",
        field: attrs?.["data-kt-field"] ?? attrs?.field ?? "price",
      });
      setIsUnresolved(false);
    }
    setIsOpen((prev) => !prev);
  };

  const selectedOffer = offers.find((offer) => offer.key === selection.offer);
  const variants = selectedOffer?.variants ?? [];

  const apply = async () => {
    setIsBusy(true);
    let resolved: OfferValueResponse | null = null;
    try {
      resolved = await fetchOfferValue(selection);
    } catch {
      resolved = null;
    }
    setIsBusy(false);
    const target = capturedValueRef.current;
    const next = insertOfferValue(target, selection, resolved, findFormatRun(target));
    if (!next) {
      setIsUnresolved(true);
      return;
    }
    setIsUnresolved(false);
    setIsOpen(false);
    onChange(next);
    contentRef.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <RichTextToolbarButton
        icon={<OfferIcon />}
        title={__("Offer value", "kotlinskidev")}
        onClick={handleToggle}
        isActive={isEitherActive}
      />
      {isOpen && (
        <Popover
          anchor={popoverAnchor}
          onClose={() => setIsOpen(false)}
          placement="bottom"
          shift
          focusOnMount="firstElement"
          className="kt-offer-popover"
        >
          <div className="kt-offer-popover__panel">
            <SelectControl
              label={__("Offer", "kotlinskidev")}
              value={selection.offer}
              options={[
                { value: "", label: __("Select an offer", "kotlinskidev") },
                ...offers.map((offer) => ({ value: offer.key, label: offer.name })),
              ]}
              onChange={(offer) => setSelection({ offer, variant: "", field: selection.field })}
              __nextHasNoMarginBottom
            />
            <SelectControl
              label={__("Variant", "kotlinskidev")}
              value={selection.variant}
              options={[
                { value: "", label: __("Select a variant", "kotlinskidev") },
                ...variants.map((variant) => ({
                  value: variant.key,
                  label: variant.label || variant.key,
                })),
              ]}
              onChange={(variant) => setSelection({ ...selection, variant })}
              __nextHasNoMarginBottom
            />
            <SelectControl
              label={__("Field", "kotlinskidev")}
              value={selection.field}
              options={OFFER_FIELDS.map((field) => ({ value: field, label: fieldLabel(field) }))}
              onChange={(field) => setSelection({ ...selection, field })}
              __nextHasNoMarginBottom
            />
            {isUnresolved && (
              <Notice status="warning" isDismissible={false}>
                {__("This offer value could not be resolved.", "kotlinskidev")}
              </Notice>
            )}
            <Button
              variant="primary"
              onClick={apply}
              disabled={!isSelectionComplete(selection) || isBusy}
              isBusy={isBusy}
            >
              {__("Apply", "kotlinskidev")}
            </Button>
          </div>
        </Popover>
      )}
    </>
  );
}

registerFormatType(OFFER_FORMAT, {
  title: __("Offer value", "kotlinskidev"),
  tagName: "span",
  className: "kt-offer",
  attributes: {
    offer: "data-kt-offer",
    variant: "data-kt-variant",
    field: "data-kt-field",
  },
  edit: OfferValueButton,
} as unknown as Parameters<typeof registerFormatType>[1]);
