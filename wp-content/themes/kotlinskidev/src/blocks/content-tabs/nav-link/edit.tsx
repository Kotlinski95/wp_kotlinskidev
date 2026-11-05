import React, { useContext } from "react";
import { createPortal } from "react-dom";
import { useBlockProps, RichText } from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import { ContentTabsPortalContext } from "../portal-context";

export interface ContentTabsNavLinkAttributes {
  label: string;
}

interface EditProps {
  attributes: ContentTabsNavLinkAttributes;
  setAttributes: (attrs: Partial<ContentTabsNavLinkAttributes>) => void;
  clientId: string;
}

interface BlockEditorSelectors {
  getBlockRootClientId: (clientId: string) => string | null;
}

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
  const { label } = attributes;
  const portal = useContext(ContentTabsPortalContext);

  const parentClientId = useSelect(
    (select) => {
      if (!portal) {
        return null;
      }
      const store = select("core/block-editor") as unknown as BlockEditorSelectors;
      return store.getBlockRootClientId(clientId);
    },
    [clientId, portal]
  );
  const isActive = !!portal && parentClientId === portal.activeItemClientId;

  const blockProps = useBlockProps({
    className: `kt-content-tabs-nav-link-editor${
      isActive ? " kt-content-tabs-nav-link-editor--active" : ""
    }`,
  });

  const richText = (
    <RichText
      {...blockProps}
      tagName="span"
      value={label}
      onChange={(value) => setAttributes({ label: value })}
      placeholder={__("Tab label…", "kotlinskidev")}
      allowedFormats={["core/bold", "core/italic"]}
    />
  );

  if (portal?.navSlotEl) {
    return createPortal(richText, portal.navSlotEl);
  }

  return richText;
}
