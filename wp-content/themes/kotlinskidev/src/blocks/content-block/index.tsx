import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import { selectCoreEntityRecords } from "@utils/core-entity-records";

const REUSABLE_BLOCK_QUERY = { per_page: 100, status: "publish" };

interface ReusableBlockPost {
  id: number;
  slug: string;
  title: { rendered: string };
}

export interface ContentBlockAttributes {
  contentSlug: string;
  className: string;
}

interface EditProps {
  attributes: ContentBlockAttributes;
  setAttributes: (attrs: Partial<ContentBlockAttributes>) => void;
}

const buildContentOptions = (
  reusableBlocks: ReusableBlockPost[] | null
): Array<{ label: string; value: string }> => [
  {
    label:
      reusableBlocks === null
        ? __("Loading…", "kotlinskidev")
        : __("— Select content —", "kotlinskidev"),
    value: "",
  },
  ...(reusableBlocks ?? []).map((post) => ({
    label: post.title.rendered || post.slug,
    value: post.slug,
  })),
];

export function Edit({ attributes, setAttributes }: EditProps) {
  const blockProps = useBlockProps({ className: "kt-editor-placeholder" });

  const reusableBlocks = useSelect(
    (select) =>
      selectCoreEntityRecords<ReusableBlockPost>(select, {
        kind: "postType",
        name: "wp_block",
        query: REUSABLE_BLOCK_QUERY,
      }),
    []
  );

  const contentOptions = buildContentOptions(reusableBlocks);

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Content Block", "kotlinskidev")} initialOpen={true}>
          <SelectControl
            label={__("Reusable block", "kotlinskidev")}
            value={attributes.contentSlug}
            options={contentOptions}
            onChange={(contentSlug) => setAttributes({ contentSlug })}
          />
        </PanelBody>
      </InspectorControls>
      <span className="kt-editor-placeholder__icon dashicons dashicons-layout" />
      <span className="kt-editor-placeholder__label">
        {attributes.contentSlug || __("Content Block", "kotlinskidev")}
      </span>
    </div>
  );
}

registerBlockType<ContentBlockAttributes>("kotlinskidev/content-block", {
  title: "Content Block",
  category: "kotlinskidev",
  attributes: {
    contentSlug: { type: "string", default: "" },
    className: { type: "string", default: "" },
  },
  edit: Edit,
  save() {
    return null;
  },
});
