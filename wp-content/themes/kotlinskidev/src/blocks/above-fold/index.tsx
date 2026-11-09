import React from "react";
import { __, _n, sprintf } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorAdvancedControls } from "@wordpress/block-editor";
import { Notice, ToggleControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { Fragment } from "@wordpress/element";

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

interface DeferrableBlocksGlobal {
  kotlinskidevDeferrableBlocks?: { blocks?: Record<string, boolean> };
}

interface EditorBlock {
  name: string;
  attributes?: { kotlinskidevAboveFold?: boolean };
  innerBlocks?: EditorBlock[];
}

const getDeferrableBlockDefaults = (): Record<string, boolean> =>
  (window as unknown as DeferrableBlocksGlobal).kotlinskidevDeferrableBlocks?.blocks || {};

const ABOVE_FOLD_BLOCKS = [
  "core/image",
  "core/cover",
  "core/video",
  "kotlinskidev/hero-carousel",
  "kotlinskidev/device-frame",
];

const isAboveFoldBlock = (name?: string): boolean =>
  !!name && (name in getDeferrableBlockDefaults() || ABOVE_FOLD_BLOCKS.includes(name));

const addAboveFoldAttribute = (settings: BlockSettings): BlockSettings => {
  if (!isAboveFoldBlock(settings.name)) {
    return settings;
  }

  const defaultValue = getDeferrableBlockDefaults()[settings.name as string] ?? false;

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      kotlinskidevAboveFold: {
        type: "boolean",
        default: defaultValue,
      },
    },
  };
};

const migrateSkipLazyAttribute = (attributes: Record<string, unknown>): Record<string, unknown> => {
  if (!attributes || !("kotlinskidevSkipLazy" in attributes)) {
    return attributes;
  }
  const { kotlinskidevSkipLazy, ...rest } = attributes;
  return kotlinskidevSkipLazy === true ? { ...rest, kotlinskidevAboveFold: true } : rest;
};

const countFlagged = (blocks: EditorBlock[]): number =>
  blocks.reduce(
    (total, block) =>
      total +
      (isAboveFoldBlock(block.name) && block.attributes?.kotlinskidevAboveFold ? 1 : 0) +
      countFlagged(block.innerBlocks || []),
    0
  );

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & {
    kotlinskidevAboveFold?: boolean;
  };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const useFlaggedCount = (): number =>
  useSelect((select) => {
    const store = select("core/block-editor") as { getBlocks?: () => EditorBlock[] } | undefined;
    return countFlagged(store?.getBlocks?.() || []);
  }, []);

const AboveFoldControl = ({ attributes, setAttributes }: BlockEditProps) => {
  const flaggedCount = useFlaggedCount();

  return (
    <InspectorAdvancedControls>
      <ToggleControl
        label={__("Above the fold", "kotlinskidev")}
        help={__(
          "Turn on only for content visible without scrolling. The first such element on the page gets high fetch priority and a preload; others load eagerly.",
          "kotlinskidev"
        )}
        checked={!!attributes.kotlinskidevAboveFold}
        onChange={(value) => setAttributes({ kotlinskidevAboveFold: value })}
      />
      {flaggedCount > 1 && (
        <Notice status="warning" isDismissible={false}>
          {sprintf(
            // translators: %d: number of elements marked above the fold
            _n(
              "%d element on this page is marked above the fold. Only the first gets high priority.",
              "%d elements on this page are marked above the fold. Only the first gets high priority.",
              flaggedCount,
              "kotlinskidev"
            ),
            flaggedCount
          )}
        </Notice>
      )}
    </InspectorAdvancedControls>
  );
};

const withAboveFoldControl = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!isAboveFoldBlock(props.name)) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <AboveFoldControl {...props} />
      </Fragment>
    );
  };
}, "withAboveFoldControl");

addFilter("blocks.registerBlockType", "kotlinskidev/above-fold-attribute", addAboveFoldAttribute);

addFilter(
  "blocks.getBlockAttributes",
  "kotlinskidev/above-fold-migrate-skip-lazy",
  (attributes: Record<string, unknown>) => migrateSkipLazyAttribute(attributes)
);

addFilter("editor.BlockEdit", "kotlinskidev/above-fold-controls", withAboveFoldControl);
