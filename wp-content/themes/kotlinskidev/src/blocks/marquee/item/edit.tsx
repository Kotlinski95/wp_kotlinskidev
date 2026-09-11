import React from "react";
import {
  useBlockProps,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";
import { PanelBody, TextControl, TextareaControl, Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface MarqueeItemAttributes {
  label: string;
  navIconId: number;
  navIconUrl: string;
  description: string;
  docUrl: string;
}

interface MarqueeItemEditProps {
  attributes: MarqueeItemAttributes;
  setAttributes: (attrs: Partial<MarqueeItemAttributes>) => void;
}

interface NavIconMedia {
  id: number;
  url: string;
}

export default function Edit({ attributes, setAttributes }: MarqueeItemEditProps) {
  const { label, navIconId, navIconUrl, description, docUrl } = attributes;
  const blockProps = useBlockProps({ className: "kt-marquee-item-editor" });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Technology", "kotlinskidev")} initialOpen>
          <TextControl
            label={__("Label", "kotlinskidev")}
            value={label}
            onChange={(value) => setAttributes({ label: value })}
          />
          <MediaUploadCheck>
            <MediaUpload
              onSelect={(media: NavIconMedia) =>
                setAttributes({ navIconId: media.id, navIconUrl: media.url })
              }
              allowedTypes={["image"]}
              value={navIconId}
              render={({ open }: { open: () => void }) => (
                <>
                  <Button
                    variant={navIconId ? "secondary" : "primary"}
                    onClick={open}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {navIconId
                      ? __("Replace icon", "kotlinskidev")
                      : __("Select icon", "kotlinskidev")}
                  </Button>
                  {navIconId ? (
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
          <TextareaControl
            label={__("Modal description", "kotlinskidev")}
            help={__(
              "Text shown in the popup when this item is clicked — how this skill helps your work and your clients.",
              "kotlinskidev"
            )}
            value={description}
            onChange={(value) => setAttributes({ description: value })}
          />
          <TextControl
            label={__("Documentation URL", "kotlinskidev")}
            help={__(
              "Optional — shown as a link in the popup. Leave empty to hide the link.",
              "kotlinskidev"
            )}
            type="url"
            value={docUrl}
            onChange={(value) => setAttributes({ docUrl: value })}
          />
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        {navIconUrl ? (
          <img
            src={navIconUrl}
            alt=""
            style={{ width: 40, height: 40, display: "block", objectFit: "contain" }}
          />
        ) : null}
        <span>{label || __("Technology", "kotlinskidev")}</span>
      </div>
    </>
  );
}
