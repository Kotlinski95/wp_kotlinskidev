import React, { useState } from "react";
import { useBlockProps, InnerBlocks, InspectorControls } from "@wordpress/block-editor";
import { ActiveTabStylePanel } from "./active-tab-style-panel";
import { buildActiveTabClasses, buildActiveTabStyle } from "./active-tab-block-props";
import { AnimationsPanel } from "./animations-panel";
import type { ContentTabsEditProps } from "./content-tabs-attributes";
import { PositionPanel } from "./position-panel";
import { ContentTabsPortalContext } from "./portal-context";
import { ALLOWED_BLOCKS, TABS_TEMPLATE } from "./tabs-template";
import { useActiveTab } from "./use-active-tab";

export type { ContentTabsAttributes, NavGap } from "./content-tabs-attributes";

export default function Edit({ attributes, setAttributes, clientId }: ContentTabsEditProps) {
  const { navPosition, navPositionMobile } = attributes;
  const [navEl, setNavEl] = useState<HTMLElement | null>(null);
  const [panelsEl, setPanelsEl] = useState<HTMLElement | null>(null);
  const orientation = navPosition === "left" || navPosition === "right" ? "vertical" : "horizontal";
  const { activeTab, activeItemClientId } = useActiveTab(clientId);

  const blockProps = useBlockProps({
    className:
      `kt-content-tabs-editor kt-content-tabs kt-content-tabs--${navPosition} kt-content-tabs--mobile-${navPositionMobile} ${buildActiveTabClasses(attributes)}`.trim(),
    style: buildActiveTabStyle(attributes),
  });

  return (
    <>
      <InspectorControls>
        <PositionPanel attributes={attributes} setAttributes={setAttributes} />
        <ActiveTabStylePanel attributes={attributes} setAttributes={setAttributes} />
        <AnimationsPanel attributes={attributes} setAttributes={setAttributes} />
      </InspectorControls>
      <div {...blockProps} data-active-tab={activeTab}>
        <div
          className="kt-content-tabs__nav"
          role="tablist"
          aria-orientation={orientation}
          ref={setNavEl}
        />
        <div className="kt-content-tabs__panels" ref={setPanelsEl} />
        <ContentTabsPortalContext.Provider
          value={{ navSlotEl: navEl, panelsSlotEl: panelsEl, activeItemClientId }}
        >
          <InnerBlocks
            allowedBlocks={ALLOWED_BLOCKS}
            template={TABS_TEMPLATE}
            templateLock={false}
          />
        </ContentTabsPortalContext.Provider>
      </div>
    </>
  );
}
