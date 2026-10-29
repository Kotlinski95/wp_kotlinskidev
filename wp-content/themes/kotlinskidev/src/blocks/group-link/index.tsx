import React, { type ComponentType } from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import * as blockEditor from "@wordpress/block-editor";
import { PanelBody } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const GROUP_LINK_BLOCKS = ["core/group"];

interface LinkControlValue {
  url?: string;
  opensInNewTab?: boolean;
}

interface LinkControlProps {
  value: LinkControlValue;
  settings: { id: string; title: string }[];
  onChange: (value: LinkControlValue) => void;
  onRemove: () => void;
}

const { __experimentalLinkControl: LinkControl } = blockEditor as unknown as {
  __experimentalLinkControl: ComponentType<LinkControlProps>;
};

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const supportsGroupLink = (name?: string): boolean =>
  Boolean(name && GROUP_LINK_BLOCKS.includes(name));

const addGroupLinkAttributes = (settings: BlockSettings): BlockSettings => {
  if (!supportsGroupLink(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      groupLinkUrl: { type: "string", default: "" },
      groupLinkOpensInNewTab: { type: "boolean", default: false },
    },
  };
};

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & {
    groupLinkUrl?: string;
    groupLinkOpensInNewTab?: boolean;
  };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withGroupLinkControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!supportsGroupLink(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const groupLinkUrl = attributes.groupLinkUrl ?? "";
    const groupLinkOpensInNewTab = Boolean(attributes.groupLinkOpensInNewTab);

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Link whole group", "kotlinskidev")} initialOpen={false}>
            <LinkControl
              value={{ url: groupLinkUrl, opensInNewTab: groupLinkOpensInNewTab }}
              settings={[{ id: "opensInNewTab", title: __("Open in new tab", "kotlinskidev") }]}
              onChange={(next) =>
                setAttributes({
                  groupLinkUrl: next.url ?? "",
                  groupLinkOpensInNewTab: Boolean(next.opensInNewTab),
                })
              }
              onRemove={() => setAttributes({ groupLinkUrl: "" })}
            />
            <p className="components-base-control__help">
              {__(
                "Makes the whole group a real link (URL preview on hover, right-click to open in a new tab). If the group contains another link, it's kept as a clickable region instead to avoid an invalid nested link. Clicks on a button or form field inside the group still work normally either way.",
                "kotlinskidev"
              )}
            </p>
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withGroupLinkControls");

addFilter("blocks.registerBlockType", "kotlinskidev/group-link-attributes", addGroupLinkAttributes);

addFilter("editor.BlockEdit", "kotlinskidev/group-link-controls", withGroupLinkControls);
