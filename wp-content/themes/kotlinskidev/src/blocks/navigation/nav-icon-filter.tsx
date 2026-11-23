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

interface NavIconAttributes {
  navIconId?: number;
  navIconUrl?: string;
}

interface NavIconBlockSettings {
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

interface NavIconBlockEditProps {
  name: string;
  attributes: NavIconAttributes;
  setAttributes: (attrs: NavIconAttributes) => void;
}

const NAV_ICON_BLOCKS = ["core/navigation-link", "core/navigation-submenu"];

const addNavIconAttributes = (
  settings: NavIconBlockSettings,
  name: string
): NavIconBlockSettings => {
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
};

interface NavIconPickerProps {
  navIconId: number;
  navIconUrl: string;
  setAttributes: NavIconBlockEditProps["setAttributes"];
}

const NavIconPreview = ({ navIconUrl }: { navIconUrl: string }): JSX.Element | null =>
  navIconUrl ? (
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
  ) : null;

interface NavIconButtonsProps extends NavIconPickerProps {
  open: () => void;
}

const NavIconButtons = ({ navIconId, setAttributes, open }: NavIconButtonsProps) => (
  <>
    <Button
      variant={navIconId ? "secondary" : "primary"}
      onClick={open}
      style={{
        width: "100%",
        justifyContent: "center",
        marginBottom: navIconId ? "0.25rem" : 0,
      }}
    >
      {navIconId ? __("Replace icon", "kotlinskidev") : __("Select SVG icon", "kotlinskidev")}
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
);

const NavIconPicker = ({ navIconId, navIconUrl, setAttributes }: NavIconPickerProps) => (
  <MediaUploadCheck>
    <MediaUpload
      onSelect={(media: NavIconMedia) =>
        setAttributes({ navIconId: media.id, navIconUrl: media.url })
      }
      allowedTypes={["image/svg+xml"]}
      value={navIconId}
      render={({ open }: { open: () => void }) => (
        <>
          <NavIconPreview navIconUrl={navIconUrl} />
          <NavIconButtons
            navIconId={navIconId}
            navIconUrl={navIconUrl}
            setAttributes={setAttributes}
            open={open}
          />
        </>
      )}
    />
  </MediaUploadCheck>
);

const withNavIconControl = createHigherOrderComponent(
  (BlockEdit: React.ComponentType<NavIconBlockEditProps>) => (props: NavIconBlockEditProps) => {
    if (!NAV_ICON_BLOCKS.includes(props.name)) {
      return <BlockEdit {...props} />;
    }
    return (
      <>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Nav Icon", "kotlinskidev")}>
            <NavIconPicker
              navIconId={props.attributes.navIconId ?? 0}
              navIconUrl={props.attributes.navIconUrl ?? ""}
              setAttributes={props.setAttributes}
            />
          </PanelBody>
        </InspectorControls>
      </>
    );
  },
  "withNavIconControl"
);

addFilter("blocks.registerBlockType", "kotlinskidev/nav-icon-attr", addNavIconAttributes);

addFilter("editor.BlockEdit", "kotlinskidev/nav-icon-control", withNavIconControl);
