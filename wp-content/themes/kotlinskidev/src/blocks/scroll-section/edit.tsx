import React from "react";
import { useBlockProps, InnerBlocks, InspectorControls } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { BackgroundPanel, BehaviourPanel, ItemsPanel } from "./panels";
import { useBlockItems } from "../shared/use-block-items";
import "./style.scss";

const ALLOWED_BLOCKS = ["kotlinskidev/scroll-section-item"];
const ITEMS_TEMPLATE: [string, Record<string, unknown>][] = [
  ["kotlinskidev/scroll-section-item", {}],
  ["kotlinskidev/scroll-section-item", {}],
];

type TriggerValue = "top" | "center" | "bottom";
type SlideWidth = "auto" | "full";
type SlideGap = string;

export interface ScrollSectionAttributes {
  trigger: TriggerValue;
  backgroundColor: string;
  markers: boolean;
  slideWidth: SlideWidth;
  slideGap: SlideGap;
}

type ScrollSectionStyle = React.CSSProperties & { [customProperty: `--${string}`]: string };

function buildEditorStyle(attributes: ScrollSectionAttributes): ScrollSectionStyle {
  return {
    ...(attributes.backgroundColor ? { background: attributes.backgroundColor } : {}),
    "--scroll-section-gap": `var(--wp--preset--spacing--${attributes.slideGap})`,
  };
}

function EditorCanvas({
  attributes,
  onAddItem,
}: {
  attributes: ScrollSectionAttributes;
  onAddItem: () => void;
}) {
  const blockProps = useBlockProps({
    className: "scroll-section scroll-section--editor",
    style: buildEditorStyle(attributes),
    "data-slide-width": attributes.slideWidth,
    "data-slide-gap": attributes.slideGap,
  });

  return (
    <div {...blockProps}>
      <div className="scroll-section__track scroll-section__track--editor">
        <InnerBlocks
          allowedBlocks={ALLOWED_BLOCKS}
          template={ITEMS_TEMPLATE}
          renderAppender={() => null}
        />
      </div>
      <button
        className="scroll-section-editor__add"
        onClick={onAddItem}
        title={__("Add item", "kotlinskidev")}
        type="button"
      >
        +
      </button>
    </div>
  );
}

export default function Edit({
  clientId,
  attributes,
  setAttributes,
}: {
  clientId: string;
  attributes: ScrollSectionAttributes;
  setAttributes: (attrs: Partial<ScrollSectionAttributes>) => void;
}) {
  const { itemCount, addItem, removeLastItem } = useBlockItems(
    clientId,
    "kotlinskidev/scroll-section-item"
  );

  return (
    <>
      <InspectorControls>
        <BehaviourPanel attributes={attributes} setAttributes={setAttributes} />
        <BackgroundPanel attributes={attributes} setAttributes={setAttributes} />
        <ItemsPanel itemCount={itemCount} onAddItem={addItem} onRemoveLastItem={removeLastItem} />
      </InspectorControls>

      <EditorCanvas attributes={attributes} onAddItem={addItem} />
    </>
  );
}
