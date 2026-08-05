import React from "react";
import { InspectorControls, MediaUpload, MediaUploadCheck } from "@wordpress/block-editor";
import { PanelBody, Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";

interface NavIconMedia {
  id: number;
  url: string;
}

const NAV_ICON_BLOCKS = ["core/navigation-link", "core/navigation-submenu"];

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/nav-icon-attr",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (settings: any, name: string) => {
    if (!NAV_ICON_BLOCKS.includes(name)) {
      return settings;
    }
    return {
      ...settings,
      attributes: {
        ...settings.attributes,
        navIconId: { type: "integer", default: 0 },
        navIconUrl: { type: "string", default: "" },
      },
    };
  }
);

const withNavIconControl = createHigherOrderComponent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (BlockEdit: React.ComponentType<any>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      if (!NAV_ICON_BLOCKS.includes(props.name)) {
        return <BlockEdit {...props} />;
      }
      const navIconId: number = props.attributes.navIconId ?? 0;
      const navIconUrl: string = props.attributes.navIconUrl ?? "";
      return (
        <>
          <BlockEdit {...props} />
          <InspectorControls>
            <PanelBody title={__("Nav Icon", "kotlinskidev")}>
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={(media: NavIconMedia) =>
                    props.setAttributes({ navIconId: media.id, navIconUrl: media.url })
                  }
                  allowedTypes={["image/svg+xml"]}
                  value={navIconId}
                  render={({ open }: { open: () => void }) => (
                    <>
                      {navIconUrl && (
                        <img
                          src={navIconUrl}
                          alt=""
                          style={{
                            width: 24,
                            height: 24,
                            display: "block",
                            marginBottom: "0.5rem",
                          }}
                        />
                      )}
                      <Button
                        variant={navIconId ? "secondary" : "primary"}
                        onClick={open}
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          marginBottom: navIconId ? "0.25rem" : 0,
                        }}
                      >
                        {navIconId
                          ? __("Replace icon", "kotlinskidev")
                          : __("Select SVG icon", "kotlinskidev")}
                      </Button>
                      {navIconId ? (
                        <Button
                          variant="link"
                          isDestructive
                          onClick={() => props.setAttributes({ navIconId: 0, navIconUrl: "" })}
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
        </>
      );
    },
  "withNavIconControl"
);

addFilter("editor.BlockEdit", "kotlinskidev/nav-icon-control", withNavIconControl);
