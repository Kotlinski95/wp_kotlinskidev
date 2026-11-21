import React from "react";
import { useBlockProps, useInnerBlocksProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";

export interface MarqueeItemAttributes {
  modalId: number;
}

interface MarqueeItemEditProps {
  attributes: MarqueeItemAttributes;
  setAttributes: (attrs: Partial<MarqueeItemAttributes>) => void;
}

interface ModalPost {
  id: number;
  title: { rendered: string };
}

interface CoreDataSelectors {
  getEntityRecords: (
    kind: string,
    name: string,
    query: Record<string, unknown>
  ) => ModalPost[] | null;
}

type InnerTemplate = [string, Record<string, unknown>, InnerTemplate[]?];

const ITEM_TEMPLATE: InnerTemplate[] = [
  [
    "core/group",
    {},
    [
      ["core/image", { className: "kt-marquee-icon", sizeSlug: "thumbnail" }],
      [
        "core/paragraph",
        {
          className: "kt-marquee-label",
          placeholder: __("Technology name…", "kotlinskidev"),
        },
      ],
    ],
  ],
];

const buildModalOptions = (modals: ModalPost[] | null) => [
  {
    label:
      modals === null
        ? __("Loading…", "kotlinskidev")
        : __("— None (not clickable) —", "kotlinskidev"),
    value: 0,
  },
  ...(modals ?? []).map((post) => ({
    label: post.title.rendered || String(post.id),
    value: post.id,
  })),
];

export default function Edit({ attributes, setAttributes }: MarqueeItemEditProps) {
  const { modalId } = attributes;
  const blockProps = useBlockProps({ className: "kt-marquee-item-editor" });
  const innerBlocksProps = useInnerBlocksProps(blockProps, {
    template: ITEM_TEMPLATE,
  });

  const modals = useSelect(
    (select) =>
      (select("core") as unknown as CoreDataSelectors).getEntityRecords("postType", "kt_modal", {
        per_page: 100,
        status: "publish",
      }),
    []
  );

  const modalOptions = buildModalOptions(modals);

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Modal", "kotlinskidev")} initialOpen>
          <SelectControl
            label={__("Open on click", "kotlinskidev")}
            help={__(
              "Selecting a modal makes this item clickable/keyboard-activatable.",
              "kotlinskidev"
            )}
            value={modalId}
            options={modalOptions}
            onChange={(value) => setAttributes({ modalId: Number(value) })}
          />
        </PanelBody>
      </InspectorControls>

      <div {...innerBlocksProps} />
    </>
  );
}
