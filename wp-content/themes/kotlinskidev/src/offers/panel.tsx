import React from "react";
import { registerPlugin } from "@wordpress/plugins";
import { PluginDocumentSettingPanel } from "@wordpress/editor";
import {
  Button,
  SelectControl,
  TextControl,
  ToggleControl,
  __experimentalNumberControl as NumberControl,
} from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { useEntityProp } from "@wordpress/core-data";
import { __ } from "@wordpress/i18n";

export const OFFER_POST_TYPE = "kt_offer" as const;

export const OFFER_KEYS = [
  "website",
  "ecommerce",
  "web-app",
  "performance-audit",
  "website-optimization",
  "local-seo",
  "maintenance",
] as const;

export interface OfferVariant {
  key: string;
  label: string;
  price_from: number | null;
  price_to: number | null;
  price_period: "once" | "month";
  price_note: string;
  duration_min: number | null;
  duration_max: number | null;
  duration_unit: "hours" | "days" | "weeks";
  included: string;
}

export interface OfferMeta {
  offer_key?: string;
  currency?: string;
  is_placeholder?: boolean;
  variants?: OfferVariant[];
}

export function createEmptyVariant(index: number): OfferVariant {
  return {
    key: `variant-${index + 1}`,
    label: "",
    price_from: null,
    price_to: null,
    price_period: "once",
    price_note: "",
    duration_min: null,
    duration_max: null,
    duration_unit: "days",
    included: "",
  };
}

export function moveVariant(
  variants: OfferVariant[],
  index: number,
  direction: -1 | 1
): OfferVariant[] {
  const target = index + direction;
  if (target < 0 || target >= variants.length) {
    return variants;
  }
  const next = [...variants];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function updateVariant(
  variants: OfferVariant[],
  index: number,
  patch: Partial<OfferVariant>
): OfferVariant[] {
  return variants.map((variant, i) => (i === index ? { ...variant, ...patch } : variant));
}

export function removeVariant(variants: OfferVariant[], index: number): OfferVariant[] {
  return variants.filter((_, i) => i !== index);
}

export function toNullableNumber(value: string | number | undefined): number | null {
  if (value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

interface VariantRowProps {
  variant: OfferVariant;
  index: number;
  total: number;
  onChange: (patch: Partial<OfferVariant>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

function VariantRow({
  variant,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: VariantRowProps): JSX.Element {
  return (
    <div className="kt-offer-panel__variant" data-testid="kt-offer-variant">
      <TextControl
        label={__("Variant key", "kotlinskidev")}
        value={variant.key}
        onChange={(key) => onChange({ key })}
        __nextHasNoMarginBottom
      />
      <TextControl
        label={__("Label", "kotlinskidev")}
        value={variant.label}
        onChange={(label) => onChange({ label })}
        __nextHasNoMarginBottom
      />
      <NumberControl
        label={__("Price from", "kotlinskidev")}
        value={variant.price_from ?? ""}
        min={0}
        onChange={(value: string | undefined) => onChange({ price_from: toNullableNumber(value) })}
      />
      <NumberControl
        label={__("Price to", "kotlinskidev")}
        value={variant.price_to ?? ""}
        min={0}
        onChange={(value: string | undefined) => onChange({ price_to: toNullableNumber(value) })}
      />
      <SelectControl
        label={__("Price period", "kotlinskidev")}
        value={variant.price_period}
        options={[
          { value: "once", label: __("One-time", "kotlinskidev") },
          { value: "month", label: __("Per month", "kotlinskidev") },
        ]}
        onChange={(next) => onChange({ price_period: next as "once" | "month" })}
        __nextHasNoMarginBottom
      />
      <TextControl
        label={__("Price note", "kotlinskidev")}
        value={variant.price_note}
        onChange={(next) => onChange({ price_note: next })}
        __nextHasNoMarginBottom
      />
      <NumberControl
        label={__("Duration min", "kotlinskidev")}
        value={variant.duration_min ?? ""}
        min={0}
        onChange={(value: string | undefined) =>
          onChange({ duration_min: toNullableNumber(value) })
        }
      />
      <NumberControl
        label={__("Duration max", "kotlinskidev")}
        value={variant.duration_max ?? ""}
        min={0}
        onChange={(value: string | undefined) =>
          onChange({ duration_max: toNullableNumber(value) })
        }
      />
      <SelectControl
        label={__("Duration unit", "kotlinskidev")}
        value={variant.duration_unit}
        options={[
          { value: "hours", label: __("Hours", "kotlinskidev") },
          { value: "days", label: __("Days", "kotlinskidev") },
          { value: "weeks", label: __("Weeks", "kotlinskidev") },
        ]}
        onChange={(next) => onChange({ duration_unit: next as "hours" | "days" | "weeks" })}
        __nextHasNoMarginBottom
      />
      <TextControl
        label={__("Included", "kotlinskidev")}
        value={variant.included}
        onChange={(included) => onChange({ included })}
        __nextHasNoMarginBottom
      />
      <div className="kt-offer-panel__variant-actions">
        <Button variant="secondary" size="small" disabled={index === 0} onClick={() => onMove(-1)}>
          {__("Move up", "kotlinskidev")}
        </Button>
        <Button
          variant="secondary"
          size="small"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
        >
          {__("Move down", "kotlinskidev")}
        </Button>
        <Button variant="secondary" size="small" isDestructive onClick={onRemove}>
          {__("Remove variant", "kotlinskidev")}
        </Button>
      </div>
    </div>
  );
}

export function OfferPanel(): JSX.Element | null {
  const postType = useSelect(
    (select) =>
      (select("core/editor") as { getCurrentPostType: () => string }).getCurrentPostType(),
    []
  );

  const [meta, setMeta] = useEntityProp<OfferMeta>("postType", postType, "meta") as unknown as [
    OfferMeta | undefined,
    (value: OfferMeta) => void,
  ];

  if (OFFER_POST_TYPE !== postType) {
    return null;
  }

  const current: OfferMeta = meta ?? {};
  const variants = current.variants ?? [];
  const setVariants = (next: OfferVariant[]) => setMeta({ ...current, variants: next });

  return (
    <PluginDocumentSettingPanel name="kotlinskidev-offer" title={__("Offer", "kotlinskidev")}>
      <SelectControl
        label={__("Offer", "kotlinskidev")}
        value={current.offer_key ?? ""}
        options={[
          { value: "", label: __("Select an offer", "kotlinskidev") },
          ...OFFER_KEYS.map((key) => ({ value: key, label: key })),
        ]}
        onChange={(next) => setMeta({ ...current, offer_key: next })}
      />
      <SelectControl
        label={__("Currency", "kotlinskidev")}
        value={current.currency ?? "EUR"}
        options={[
          { value: "EUR", label: "EUR" },
          { value: "PLN", label: "PLN" },
        ]}
        onChange={(currency) => setMeta({ ...current, currency })}
      />
      <ToggleControl
        label={__("Placeholder prices", "kotlinskidev")}
        help={__(
          "Visitors see a fallback text instead of the values while this is on.",
          "kotlinskidev"
        )}
        checked={Boolean(current.is_placeholder)}
        onChange={(next) => setMeta({ ...current, is_placeholder: next })}
      />
      {variants.map((variant, index) => (
        <VariantRow
          key={index}
          variant={variant}
          index={index}
          total={variants.length}
          onChange={(patch) => setVariants(updateVariant(variants, index, patch))}
          onMove={(direction) => setVariants(moveVariant(variants, index, direction))}
          onRemove={() => setVariants(removeVariant(variants, index))}
        />
      ))}
      <Button
        variant="primary"
        onClick={() => setVariants([...variants, createEmptyVariant(variants.length)])}
      >
        {__("Add variant", "kotlinskidev")}
      </Button>
    </PluginDocumentSettingPanel>
  );
}

registerPlugin("kotlinskidev-offer-panel", { render: OfferPanel });
