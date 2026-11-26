import React from "react";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, __experimentalNumberControl as NumberControl } from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import { getBreakpoints } from "@utils/responsive-breakpoints";
import type { ResponsiveDevice } from "@utils/responsive-breakpoints";
import type { ResponsiveOrderAttribute } from "./order-attribute";

const MIN_ORDER = -1;
const MAX_ORDER = 20;
const ORDER_STEP = 1;

interface OrderPanelProps {
  responsiveOrder: ResponsiveOrderAttribute;
  onChangeOrder: (device: ResponsiveDevice, value: number) => void;
}

const OrderField = ({
  label,
  help,
  value,
  onChange,
}: {
  label: string;
  help: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <NumberControl
    label={label}
    value={value || 0}
    onChange={onChange}
    help={help}
    min={MIN_ORDER}
    max={MAX_ORDER}
    step={ORDER_STEP}
  />
);

export const OrderPanel = ({ responsiveOrder, onChangeOrder }: OrderPanelProps) => {
  const breakpoints = getBreakpoints();

  return (
    <InspectorControls>
      <PanelBody title={__("Responsive Order", "kotlinskidev")} initialOpen={false}>
        <OrderField
          label={__("Desktop Order", "kotlinskidev")}
          value={responsiveOrder.desktop}
          onChange={(value) => onChangeOrder("desktop", value)}
          help={sprintf(
            // translators: %s: breakpoint value in px
            __(
              "Set the order for desktop screens (%spx+). Use negative values like -1 for higher priority.",
              "kotlinskidev"
            ),
            breakpoints.desktop_min
          )}
        />
        <OrderField
          label={__("Tablet Order", "kotlinskidev")}
          value={responsiveOrder.tablet}
          onChange={(value) => onChangeOrder("tablet", value)}
          help={sprintf(
            // translators: %1$s: minimum breakpoint in px, %2$s: maximum breakpoint in px
            __("Set the order for tablet screens (%1$spx - %2$spx).", "kotlinskidev"),
            breakpoints.tablet_min,
            breakpoints.tablet_max
          )}
        />
        <OrderField
          label={__("Mobile Order", "kotlinskidev")}
          value={responsiveOrder.mobile}
          onChange={(value) => onChangeOrder("mobile", value)}
          help={sprintf(
            // translators: %s: breakpoint value in px
            __("Set the order for mobile screens (below %spx).", "kotlinskidev"),
            breakpoints.mobile_max
          )}
        />
      </PanelBody>
    </InspectorControls>
  );
};
