import React from "react";
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorAdvancedControls } from "@wordpress/block-editor";
import { SelectControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { Fragment } from "@wordpress/element";

const TARGET_BLOCK_NAME = "core/group";
const CHILD_BLOCK_NAME = "core/details";

type FaqLayoutType = "default" | "independent";
type FaqLayoutColumns = 2 | 3 | 4;

interface FaqLayout {
  layout?: FaqLayoutType;
  columns?: FaqLayoutColumns;
}

interface BlockAttributes {
  faqLayout?: FaqLayout;
}

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const addFaqLayoutAttribute = (settings: BlockSettings): BlockSettings => {
  if (settings.name !== TARGET_BLOCK_NAME) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      faqLayout: {
        type: "object",
        default: {},
      },
    },
  };
};

export const faqLayoutClassName = (faqLayout: FaqLayout | undefined): string => {
  if (faqLayout?.layout !== "independent") {
    return "";
  }

  const columns =
    faqLayout.columns && [2, 3, 4].includes(faqLayout.columns) ? faqLayout.columns : 2;

  return `kt-faq-independent-columns-${columns}`;
};

interface BlockEditorSelectors {
  getBlock: (id: string) => { innerBlocks: Array<{ name: string }> } | undefined;
}

const useHasDetailsChildren = (clientId: string): boolean =>
  useSelect(
    (select) => {
      const store = select("core/block-editor") as unknown as BlockEditorSelectors;
      return (store.getBlock(clientId)?.innerBlocks ?? []).some(
        (block) => block.name === CHILD_BLOCK_NAME
      );
    },
    [clientId]
  );

interface BlockEditProps {
  name?: string;
  clientId: string;
  attributes: BlockAttributes;
  setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

const layoutOptions = [
  { label: __("Default grid", "kotlinskidev"), value: "default" },
  { label: __("Independent columns", "kotlinskidev"), value: "independent" },
];

const columnsOptions = [
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
];

const withFaqLayoutControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    const hasDetailsChildren = useHasDetailsChildren(props.clientId);

    if (props.name !== TARGET_BLOCK_NAME || !hasDetailsChildren) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const faqLayout = attributes.faqLayout || {};

    const update = (value: Partial<FaqLayout>) => {
      setAttributes({ faqLayout: { ...faqLayout, ...value } });
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorAdvancedControls>
          <SelectControl
            label={__("FAQ columns behavior", "kotlinskidev")}
            help={__(
              "Default: closed items align into uniform rows, but opening one stretches its row partner. Independent columns: each column grows on its own, no stretching, but closed items no longer line up edge-to-edge.",
              "kotlinskidev"
            )}
            value={faqLayout.layout || "default"}
            options={layoutOptions}
            onChange={(value: string) => update({ layout: value as FaqLayoutType })}
          />
          {faqLayout.layout === "independent" && (
            <SelectControl
              label={__("Independent columns count", "kotlinskidev")}
              value={String(faqLayout.columns || 2)}
              options={columnsOptions}
              onChange={(value: string) => update({ columns: Number(value) as FaqLayoutColumns })}
            />
          )}
        </InspectorAdvancedControls>
      </Fragment>
    );
  };
}, "withFaqLayoutControls");

interface BlockListBlockProps {
  attributes?: BlockAttributes;
  className?: string;
  [key: string]: unknown;
}

const withFaqLayoutPreview = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    const className = faqLayoutClassName(props.attributes?.faqLayout);

    if (!className) {
      return <BlockListBlock {...props} />;
    }

    return <BlockListBlock {...props} className={`${props.className || ""} ${className}`.trim()} />;
  };
}, "withFaqLayoutPreview");

addFilter("blocks.registerBlockType", "kotlinskidev/faq-layout-attributes", addFaqLayoutAttribute);
addFilter("editor.BlockEdit", "kotlinskidev/faq-layout-controls", withFaqLayoutControls);
addFilter("editor.BlockListBlock", "kotlinskidev/faq-layout-preview", withFaqLayoutPreview);
