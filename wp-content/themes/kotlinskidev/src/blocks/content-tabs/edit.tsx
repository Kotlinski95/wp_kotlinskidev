import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  useBlockProps,
  InnerBlocks,
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import { PanelBody, SelectControl, RangeControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { ContentTabsPortalContext } from "./portal-context";

export interface NavGap {
  desktop?: number;
  tablet?: number;
  mobile?: number;
}

export interface ContentTabsAttributes {
  navPosition: "top" | "bottom" | "left" | "right";
  navPositionMobile: "top" | "bottom";
  navGap: NavGap;
  activeTabUnderline: boolean;
  activeTabTextColorEnabled: boolean;
  activeTabColor: string;
  activeTabBackgroundEnabled: boolean;
  activeTabBackgroundColor: string;
  panelTransition: string;
  cardAnimation: string;
}

const DEFAULT_NAV_GAP = 8;
type NavGapDevice = keyof NavGap;
const NAV_GAP_DEVICES: NavGapDevice[] = ["desktop", "tablet", "mobile"];

interface EditProps {
  attributes: ContentTabsAttributes;
  setAttributes: (attrs: Partial<ContentTabsAttributes>) => void;
  clientId: string;
}

interface TabItemBlock {
  clientId: string;
}

interface BlockEditorSelectors {
  getBlock: (id: string) => { innerBlocks: TabItemBlock[] } | undefined;
  getSelectedBlockClientId: () => string | null;
  getBlockParents: (id: string) => string[];
}

const ALLOWED_BLOCKS = ["kotlinskidev/content-tabs-item"];
const EMPTY_BLOCKS: TabItemBlock[] = [];
const EMPTY_CLIENT_IDS: string[] = [];

const NAV_POSITION_OPTIONS = [
  { label: __("Top", "kotlinskidev"), value: "top" },
  { label: __("Bottom", "kotlinskidev"), value: "bottom" },
  { label: __("Left", "kotlinskidev"), value: "left" },
  { label: __("Right", "kotlinskidev"), value: "right" },
];

const NAV_POSITION_MOBILE_OPTIONS = [
  { label: __("Top", "kotlinskidev"), value: "top" },
  { label: __("Bottom", "kotlinskidev"), value: "bottom" },
];

const NAV_GAP_DEVICE_LABELS: Record<NavGapDevice, string> = {
  desktop: __("Desktop", "kotlinskidev"),
  tablet: __("Tablet", "kotlinskidev"),
  mobile: __("Mobile", "kotlinskidev"),
};

const PANEL_TRANSITION_OPTIONS = [
  { label: __("None", "kotlinskidev"), value: "" },
  { label: __("Fade", "kotlinskidev"), value: "fade" },
];

const CARD_ANIMATION_OPTIONS = [
  { label: __("None", "kotlinskidev"), value: "" },
  { label: __("Fade Up", "kotlinskidev"), value: "fade-up" },
];

const TABS_TEMPLATE: [string, Record<string, unknown>, unknown[]][] = [
  [
    "kotlinskidev/content-tabs-item",
    {},
    [
      ["kotlinskidev/content-tabs-nav-link", { label: __("Creating Websites", "kotlinskidev") }],
      [
        "core/paragraph",
        {
          content: __(
            "Custom-built, fast-loading sites tailored to your business, from first sketch to launch.",
            "kotlinskidev"
          ),
          placeholder: __("Describe this service…", "kotlinskidev"),
        },
      ],
    ],
  ],
  [
    "kotlinskidev/content-tabs-item",
    {},
    [
      ["kotlinskidev/content-tabs-nav-link", { label: __("Performance Analysis", "kotlinskidev") }],
      [
        "core/paragraph",
        {
          content: __(
            "In-depth audits of load speed, Core Web Vitals, and rendering bottlenecks, with a clear fix list.",
            "kotlinskidev"
          ),
          placeholder: __("Describe this service…", "kotlinskidev"),
        },
      ],
    ],
  ],
  [
    "kotlinskidev/content-tabs-item",
    {},
    [
      ["kotlinskidev/content-tabs-nav-link", { label: __("Website Optimization", "kotlinskidev") }],
      [
        "core/paragraph",
        {
          content: __(
            "Ongoing tuning of caching, assets, and queries to keep the site fast as it grows.",
            "kotlinskidev"
          ),
          placeholder: __("Describe this service…", "kotlinskidev"),
        },
      ],
    ],
  ],
];

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
  const {
    navPosition,
    navPositionMobile,
    navGap,
    activeTabUnderline,
    activeTabTextColorEnabled,
    activeTabColor,
    activeTabBackgroundEnabled,
    activeTabBackgroundColor,
    panelTransition,
    cardAnimation,
  } = attributes;
  const [activeTab, setActiveTab] = useState(0);
  const [navEl, setNavEl] = useState<HTMLElement | null>(null);
  const [panelsEl, setPanelsEl] = useState<HTMLElement | null>(null);
  const resolvedNavGap: NavGap = navGap || {};
  const orientation = navPosition === "left" || navPosition === "right" ? "vertical" : "horizontal";

  const pendingActiveTextRef = useRef<string | null>(null);
  const handleActiveTextColorChange = (value: string | undefined) => {
    if (value !== undefined) {
      pendingActiveTextRef.current = value;
      setAttributes({ activeTabColor: value });
    } else if (pendingActiveTextRef.current !== null) {
      pendingActiveTextRef.current = null;
    } else {
      setAttributes({ activeTabColor: "" });
    }
  };
  const isActiveTextGradient = (activeTabColor || "").includes("gradient");

  const pendingActiveBgRef = useRef<string | null>(null);
  const handleActiveBackgroundChange = (value: string | undefined) => {
    if (value !== undefined) {
      pendingActiveBgRef.current = value;
      setAttributes({ activeTabBackgroundColor: value });
    } else if (pendingActiveBgRef.current !== null) {
      pendingActiveBgRef.current = null;
    } else {
      setAttributes({ activeTabBackgroundColor: "" });
    }
  };
  const isActiveBgGradient = (activeTabBackgroundColor || "").includes("gradient");

  const { innerBlocks, blockParents, selectedBlockClientId } = useSelect(
    (select) => {
      const store = select("core/block-editor") as unknown as BlockEditorSelectors;
      const selectedCid = store.getSelectedBlockClientId();
      return {
        innerBlocks: store.getBlock(clientId)?.innerBlocks ?? EMPTY_BLOCKS,
        blockParents: selectedCid ? store.getBlockParents(selectedCid) : EMPTY_CLIENT_IDS,
        selectedBlockClientId: selectedCid,
      };
    },
    [clientId]
  );

  const selectedBlockParents = useMemo(
    () => (selectedBlockClientId ? [...blockParents, selectedBlockClientId] : EMPTY_CLIENT_IDS),
    [blockParents, selectedBlockClientId]
  );

  useEffect(() => {
    const idx = innerBlocks.findIndex((block) => selectedBlockParents.includes(block.clientId));
    if (idx >= 0) {
      setActiveTab(idx);
    }
  }, [selectedBlockParents, innerBlocks]);

  useEffect(() => {
    if (innerBlocks.length > 0 && activeTab >= innerBlocks.length) {
      setActiveTab(innerBlocks.length - 1);
    }
  }, [innerBlocks.length, activeTab]);

  const activeItemClientId = innerBlocks[activeTab]?.clientId ?? null;

  const activeTabClasses = [
    activeTabUnderline && "kt-content-tabs--active-underline",
    activeTabTextColorEnabled &&
      activeTabColor &&
      (isActiveTextGradient
        ? "kt-content-tabs--active-text-gradient"
        : "kt-content-tabs--active-text-color"),
    activeTabBackgroundEnabled && activeTabBackgroundColor && "kt-content-tabs--active-background",
    activeTabBackgroundEnabled &&
      activeTabBackgroundColor &&
      isActiveBgGradient &&
      "kt-content-tabs--active-background-gradient",
  ]
    .filter(Boolean)
    .join(" ");

  const blockProps = useBlockProps({
    className:
      `kt-content-tabs-editor kt-content-tabs kt-content-tabs--${navPosition} kt-content-tabs--mobile-${navPositionMobile} ${activeTabClasses}`.trim(),
    style: {
      "--kt-content-tabs-nav-gap-desktop": `${resolvedNavGap.desktop ?? DEFAULT_NAV_GAP}px`,
      ...(activeTabTextColorEnabled && activeTabColor
        ? { "--kt-content-tabs-active-color": activeTabColor }
        : {}),
      ...(activeTabBackgroundEnabled && activeTabBackgroundColor
        ? { "--kt-content-tabs-active-bg": activeTabBackgroundColor }
        : {}),
    } as React.CSSProperties,
  });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Content Tabs Settings", "kotlinskidev")}>
          <SelectControl
            label={__("Desktop position", "kotlinskidev")}
            value={navPosition}
            options={NAV_POSITION_OPTIONS}
            onChange={(value) =>
              setAttributes({ navPosition: value as ContentTabsAttributes["navPosition"] })
            }
          />
          <SelectControl
            label={__("Mobile position", "kotlinskidev")}
            value={navPositionMobile}
            options={NAV_POSITION_MOBILE_OPTIONS}
            help={__(
              "Below the mobile breakpoint, the nav switches to this position and scrolls horizontally on one line instead of wrapping.",
              "kotlinskidev"
            )}
            onChange={(value) =>
              setAttributes({
                navPositionMobile: value as ContentTabsAttributes["navPositionMobile"],
              })
            }
          />
          <p className="components-base-control__help">
            {__("Gap between nav links", "kotlinskidev")}
          </p>
          {NAV_GAP_DEVICES.map((device) => (
            <RangeControl
              key={device}
              label={NAV_GAP_DEVICE_LABELS[device]}
              value={resolvedNavGap[device] ?? (device === "desktop" ? DEFAULT_NAV_GAP : 0)}
              min={0}
              max={48}
              allowReset={device !== "desktop"}
              onChange={(value) =>
                setAttributes({
                  navGap: {
                    ...resolvedNavGap,
                    [device]: value ?? (device === "desktop" ? DEFAULT_NAV_GAP : undefined),
                  },
                })
              }
            />
          ))}
        </PanelBody>
        <PanelBody title={__("Active Tab Style", "kotlinskidev")} initialOpen={false}>
          <p className="components-base-control__help">
            {__("Combine any of these to style the active tab.", "kotlinskidev")}
          </p>
          <ToggleControl
            label={__("Underline", "kotlinskidev")}
            checked={!!activeTabUnderline}
            onChange={(value) => setAttributes({ activeTabUnderline: value })}
          />
          <ToggleControl
            label={__("Text color", "kotlinskidev")}
            checked={!!activeTabTextColorEnabled}
            onChange={(value) => setAttributes({ activeTabTextColorEnabled: value })}
          />
          {activeTabTextColorEnabled && (
            <ColorGradientControl
              label={__("Active tab text color", "kotlinskidev")}
              colorValue={activeTabColor && !isActiveTextGradient ? activeTabColor : undefined}
              gradientValue={isActiveTextGradient ? activeTabColor : undefined}
              onColorChange={handleActiveTextColorChange}
              onGradientChange={handleActiveTextColorChange}
              enableAlpha={true}
              clearable={true}
              __experimentalIsRenderedInSidebar={true}
              __nextHasNoMarginBottom
            />
          )}
          <ToggleControl
            label={__("Background", "kotlinskidev")}
            checked={!!activeTabBackgroundEnabled}
            onChange={(value) => setAttributes({ activeTabBackgroundEnabled: value })}
          />
          {activeTabBackgroundEnabled && (
            <ColorGradientControl
              label={__("Active tab background color", "kotlinskidev")}
              colorValue={
                activeTabBackgroundColor && !isActiveBgGradient
                  ? activeTabBackgroundColor
                  : undefined
              }
              gradientValue={isActiveBgGradient ? activeTabBackgroundColor : undefined}
              onColorChange={handleActiveBackgroundChange}
              onGradientChange={handleActiveBackgroundChange}
              enableAlpha={true}
              clearable={true}
              __experimentalIsRenderedInSidebar={true}
              __nextHasNoMarginBottom
            />
          )}
        </PanelBody>
        <PanelBody title={__("Animations", "kotlinskidev")} initialOpen={false}>
          <SelectControl
            label={__("Tab switch animation", "kotlinskidev")}
            value={panelTransition}
            options={PANEL_TRANSITION_OPTIONS}
            help={__(
              "How the old panel disappears and the new one appears when switching tabs.",
              "kotlinskidev"
            )}
            onChange={(value) => setAttributes({ panelTransition: value })}
          />
          <SelectControl
            label={__("Card entrance animation", "kotlinskidev")}
            value={cardAnimation}
            options={CARD_ANIMATION_OPTIONS}
            help={__(
              "Animates project/article cards inside the newly shown tab, one after another.",
              "kotlinskidev"
            )}
            onChange={(value) => setAttributes({ cardAnimation: value })}
          />
        </PanelBody>
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
            template={TABS_TEMPLATE as [string, object][]}
            templateLock={false}
          />
        </ContentTabsPortalContext.Provider>
      </div>
    </>
  );
}
