import React from "react";
import { registerBlockType, TemplateArray, type BlockEditProps } from "@wordpress/blocks";
import {
  InspectorControls,
  useBlockProps,
  InnerBlocks,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";
import {
  PanelBody,
  TextControl,
  ToggleControl,
  Button,
  __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";

interface ResponsiveValue {
  desktop?: string;
  tablet?: string;
  mobile?: string;
}

type ResponsiveDevice = keyof ResponsiveValue;

const RESPONSIVE_DEVICES: ResponsiveDevice[] = ["desktop", "tablet", "mobile"];

const ICON_SIZE_UNITS = [
  { value: "px", label: "px" },
  { value: "rem", label: "rem" },
  { value: "%", label: "%" },
];

interface SocialSectionAttributes {
  attachToBottom: boolean;
  iconWidth: ResponsiveValue;
  iconHeight: ResponsiveValue;
  itemGap: ResponsiveValue;
}

interface SocialItemAttributes {
  label: string;
  url: string;
  iconClass: string;
  navIconId: number;
  navIconUrl: string;
}

interface NavIconMedia {
  id: number;
  url: string;
}

const ITEM_TEMPLATE: TemplateArray = [["kotlinskidev/social-item", {}]];

const SocialSectionEdit = ({
  attributes,
  setAttributes,
}: BlockEditProps<SocialSectionAttributes>) => {
  const blockProps = useBlockProps({ className: "kt-social-section-editor" });

  const updateResponsive = (
    key: "iconWidth" | "iconHeight" | "itemGap",
    device: ResponsiveDevice,
    value: string
  ) => {
    setAttributes({
      [key]: { ...attributes[key], [device]: value || undefined },
    } as Partial<SocialSectionAttributes>);
  };

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Social Section", "kotlinskidev")} initialOpen={true}>
          <ToggleControl
            label={__("Attach to bottom", "kotlinskidev")}
            help={__("Pins the section to the bottom of the menu overlay.", "kotlinskidev")}
            checked={attributes.attachToBottom}
            onChange={(attachToBottom) => setAttributes({ attachToBottom })}
          />
        </PanelBody>
        <PanelBody title={__("Icon Size & Spacing", "kotlinskidev")} initialOpen={false}>
          {RESPONSIVE_DEVICES.map((device) => (
            <div
              key={device}
              style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                border: "0.0625rem solid #ddd",
                borderRadius: "0.25rem",
              }}
            >
              <h4
                style={{
                  margin: "0 0 0.75rem 0",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {device}
              </h4>
              <UnitControl
                label={__("Icon Width", "kotlinskidev")}
                value={attributes.iconWidth?.[device] || ""}
                units={ICON_SIZE_UNITS}
                onChange={(value: string | undefined) =>
                  updateResponsive("iconWidth", device, value || "")
                }
              />
              <UnitControl
                label={__("Icon Height", "kotlinskidev")}
                value={attributes.iconHeight?.[device] || ""}
                units={ICON_SIZE_UNITS}
                onChange={(value: string | undefined) =>
                  updateResponsive("iconHeight", device, value || "")
                }
              />
              <UnitControl
                label={__("Gap Between Icons", "kotlinskidev")}
                value={attributes.itemGap?.[device] || ""}
                units={ICON_SIZE_UNITS}
                onChange={(value: string | undefined) =>
                  updateResponsive("itemGap", device, value || "")
                }
              />
            </div>
          ))}
        </PanelBody>
      </InspectorControls>
      <InnerBlocks
        allowedBlocks={["kotlinskidev/social-item"]}
        template={ITEM_TEMPLATE}
        orientation="horizontal"
      />
    </div>
  );
};

const SocialSectionSave = () => <InnerBlocks.Content />;

const SocialItemEdit = ({ attributes, setAttributes }: BlockEditProps<SocialItemAttributes>) => {
  const blockProps = useBlockProps({ className: "kt-social-item-editor" });

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Social Link", "kotlinskidev")} initialOpen={true}>
          <TextControl
            label={__("Label", "kotlinskidev")}
            value={attributes.label}
            onChange={(label) => setAttributes({ label })}
          />
          <TextControl
            label={__("URL", "kotlinskidev")}
            type="url"
            value={attributes.url}
            onChange={(url) => setAttributes({ url })}
          />
          <TextControl
            label={__("Icon class", "kotlinskidev")}
            help={__("Optional CSS class on the list item.", "kotlinskidev")}
            value={attributes.iconClass}
            onChange={(iconClass) => setAttributes({ iconClass })}
          />
          <MediaUploadCheck>
            <MediaUpload
              onSelect={(media: NavIconMedia) =>
                setAttributes({ navIconId: media.id, navIconUrl: media.url })
              }
              allowedTypes={["image/svg+xml"]}
              value={attributes.navIconId}
              render={({ open }: { open: () => void }) => (
                <>
                  <Button
                    variant={attributes.navIconId ? "secondary" : "primary"}
                    onClick={open}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {attributes.navIconId
                      ? __("Replace SVG icon", "kotlinskidev")
                      : __("Select SVG icon", "kotlinskidev")}
                  </Button>
                  {attributes.navIconId ? (
                    <Button
                      variant="link"
                      isDestructive
                      onClick={() => setAttributes({ navIconId: 0, navIconUrl: "" })}
                    >
                      {__("Remove icon", "kotlinskidev")}
                    </Button>
                  ) : null}
                </>
              )}
            />
          </MediaUploadCheck>
        </PanelBody>
      </InspectorControls>
      {attributes.navIconUrl ? (
        <img
          src={attributes.navIconUrl}
          alt={attributes.label}
          style={{ width: 24, height: 24, display: "block" }}
        />
      ) : (
        <span>{attributes.label || __("Social link", "kotlinskidev")}</span>
      )}
    </div>
  );
};

registerBlockType<SocialSectionAttributes>("kotlinskidev/social-section", {
  title: "Social Section",
  category: "kotlinskidev-navigation",
  attributes: {
    attachToBottom: { type: "boolean", default: true },
    iconWidth: { type: "object", default: {} },
    iconHeight: { type: "object", default: {} },
    itemGap: { type: "object", default: {} },
  },
  supports: {
    spacing: {
      margin: true,
      padding: true,
    },
  },
  edit: SocialSectionEdit,
  save: SocialSectionSave,
});

registerBlockType<SocialItemAttributes>("kotlinskidev/social-item", {
  title: "Social Link",
  category: "kotlinskidev-navigation",
  attributes: {
    label: { type: "string", default: "" },
    url: { type: "string", default: "" },
    iconClass: { type: "string", default: "" },
    navIconId: { type: "integer", default: 0 },
    navIconUrl: { type: "string", default: "" },
  },
  supports: {
    spacing: {
      margin: true,
      padding: true,
    },
  },
  edit: SocialItemEdit,
  save: () => null,
});
