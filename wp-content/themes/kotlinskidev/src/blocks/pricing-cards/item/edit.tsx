import React from "react";
import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { BadgePanel, type PricingCardAttributes } from "./BadgePanel";
import { buildBadgeStyle } from "./badge-style";

const ITEM_TEMPLATE: [string, object][] = [
  ["core/paragraph", { placeholder: "TIER NAME", fontSize: "small" }],
  ["core/heading", { level: 3, fontSize: "x-large", placeholder: "Price" }],
  ["core/paragraph", { placeholder: "Short description of who this tier is for" }],
  ["core/list", { placeholder: "Feature" }],
  ["core/paragraph", { placeholder: "Timeframe (optional)", fontSize: "small" }],
  ["core/buttons", {}],
];

interface PricingCardEditProps {
  attributes: PricingCardAttributes;
  setAttributes: (attrs: Partial<PricingCardAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: PricingCardEditProps) {
  const { featured } = attributes;
  const blockProps = useBlockProps({
    className: `pricing-card${featured ? " pricing-card--featured" : ""}`,
  });

  return (
    <>
      <BadgePanel attributes={attributes} setAttributes={setAttributes} />

      <div {...blockProps}>
        {featured && (
          <span className="pricing-card__badge" style={buildBadgeStyle(attributes)}>
            {__("Most popular", "kotlinskidev")}
          </span>
        )}
        <div className="pricing-card__body">
          <InnerBlocks template={ITEM_TEMPLATE} />
        </div>
      </div>
    </>
  );
}
