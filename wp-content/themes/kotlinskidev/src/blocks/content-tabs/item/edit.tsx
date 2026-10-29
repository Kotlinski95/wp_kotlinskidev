import React, { useContext } from "react";
import { createPortal } from "react-dom";
import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { ContentTabsPortalContext } from "../portal-context";

export interface ContentTabsItemAttributes {
  tabId: string;
  panelId: string;
  isActive: boolean;
}

interface EditProps {
  clientId: string;
}

const ITEM_TEMPLATE: [string, Record<string, unknown>][] = [
  ["kotlinskidev/content-tabs-nav-link", {}],
  ["core/paragraph", { placeholder: __("Panel content…", "kotlinskidev") }],
];

export default function Edit({ clientId }: EditProps) {
  const blockProps = useBlockProps({ className: "kt-content-tabs-item-editor" });
  const portal = useContext(ContentTabsPortalContext);
  const isActive = !!portal && clientId === portal.activeItemClientId;

  const content = (
    <div {...blockProps}>
      <InnerBlocks template={ITEM_TEMPLATE as [string, object][]} templateLock={false} />
    </div>
  );

  if (!portal) {
    return content;
  }

  if (!isActive) {
    return <div style={{ display: "none" }}>{content}</div>;
  }

  if (!portal.panelsSlotEl) {
    return content;
  }

  return createPortal(content, portal.panelsSlotEl);
}
