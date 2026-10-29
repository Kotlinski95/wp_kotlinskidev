import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, __experimentalNumberControl as NumberControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";

declare global {
  interface Window {
    kotlinskidevBreakpoints?: {
      mobile_max: number;
      tablet_min: number;
      tablet_max: number;
      desktop_min: number;
    };
  }
}

const getBreakpoints = () => {
  return (
    window.kotlinskidevBreakpoints || {
      mobile_max: 781,
      tablet_min: 782,
      tablet_max: 1023,
      desktop_min: 1024,
    }
  );
};

const addResponsiveOrderAttributes = (settings: any) => {
  if (DYNAMIC_PREVIEW_BLOCKS.includes(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      responsiveOrder: {
        type: "object",
        default: {
          desktop: 0,
          tablet: 0,
          mobile: 0,
        },
      },
    },
  };
};

const withResponsiveOrderControls = createHigherOrderComponent((BlockEdit) => {
  return (props: any) => {
    const { attributes, setAttributes } = props;
    const { responsiveOrder = { desktop: 0, tablet: 0, mobile: 0 } } = attributes;
    const breakpoints = getBreakpoints();

    const updateResponsiveOrder = (device: string, value: number) => {
      setAttributes({
        responsiveOrder: {
          ...responsiveOrder,
          [device]: value,
        },
      });
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Responsive Order", "kotlinskidev")} initialOpen={false}>
            <NumberControl
              label={__("Desktop Order", "kotlinskidev")}
              value={responsiveOrder.desktop || 0}
              onChange={(value: number) => updateResponsiveOrder("desktop", value)}
              help={sprintf(
                // translators: %s: breakpoint value in px
                __(
                  "Set the order for desktop screens (%spx+). Use negative values like -1 for higher priority.",
                  "kotlinskidev"
                ),
                breakpoints.desktop_min
              )}
              min={-1}
              max={20}
              step={1}
            />
            <NumberControl
              label={__("Tablet Order", "kotlinskidev")}
              value={responsiveOrder.tablet || 0}
              onChange={(value: number) => updateResponsiveOrder("tablet", value)}
              help={sprintf(
                // translators: %1$s: minimum breakpoint in px, %2$s: maximum breakpoint in px
                __("Set the order for tablet screens (%1$spx - %2$spx).", "kotlinskidev"),
                breakpoints.tablet_min,
                breakpoints.tablet_max
              )}
              min={-1}
              max={20}
              step={1}
            />
            <NumberControl
              label={__("Mobile Order", "kotlinskidev")}
              value={responsiveOrder.mobile || 0}
              onChange={(value: number) => updateResponsiveOrder("mobile", value)}
              help={sprintf(
                // translators: %s: breakpoint value in px
                __("Set the order for mobile screens (below %spx).", "kotlinskidev"),
                breakpoints.mobile_max
              )}
              min={-1}
              max={20}
              step={1}
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withResponsiveOrderControls");
const addResponsiveOrderClasses = createHigherOrderComponent((BlockListBlock) => {
  return (props: any) => {
    const { attributes } = props;
    const { responsiveOrder } = attributes;

    let additionalClasses = "";

    if (responsiveOrder) {
      const { desktop, tablet, mobile } = responsiveOrder;

      if (desktop !== 0) {
        additionalClasses += ` order-desktop-${desktop}`;
      }
      if (tablet !== 0) {
        additionalClasses += ` order-tablet-${tablet}`;
      }
      if (mobile !== 0) {
        additionalClasses += ` order-mobile-${mobile}`;
      }
    }

    return (
      <BlockListBlock
        {...props}
        className={`${props.className || ""} ${additionalClasses}`.trim()}
      />
    );
  };
}, "addResponsiveOrderClasses");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/responsive-order-attributes",
  addResponsiveOrderAttributes
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/responsive-order-controls",
  withResponsiveOrderControls
);

addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/responsive-order-classes",
  addResponsiveOrderClasses
);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/responsive-order-save-classes",
  (extraProps: any, blockType: any, attributes: any) => {
    const { responsiveOrder } = attributes;

    if (responsiveOrder) {
      const { desktop, tablet, mobile } = responsiveOrder;
      let additionalClasses = "";

      if (desktop !== 0) {
        additionalClasses += ` order-desktop-${desktop}`;
      }
      if (tablet !== 0) {
        additionalClasses += ` order-tablet-${tablet}`;
      }
      if (mobile !== 0) {
        additionalClasses += ` order-mobile-${mobile}`;
      }

      if (additionalClasses) {
        extraProps.className = extraProps.className
          ? `${extraProps.className} ${additionalClasses.trim()}`
          : additionalClasses.trim();
      }
    }

    return extraProps;
  }
);
