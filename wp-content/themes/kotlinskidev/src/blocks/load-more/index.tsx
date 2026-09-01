import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl, RangeControl, TextControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const GROUP_BLOCK = "core/group";
const LOAD_MORE_CLASS = "kt-has-load-more";

interface LoadMoreAttribute {
  enabled: boolean;
  initialCount: number;
  buttonLabel: string;
}

const DEFAULT_LOAD_MORE: LoadMoreAttribute = {
  enabled: false,
  initialCount: 6,
  buttonLabel: "",
};

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const addLoadMoreAttribute = (settings: BlockSettings): BlockSettings => {
  if (settings.name !== GROUP_BLOCK) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      loadMore: { type: "object", default: DEFAULT_LOAD_MORE },
    },
  };
};

interface BlockEditProps {
  name?: string;
  attributes: { loadMore?: LoadMoreAttribute };
  setAttributes: (attrs: { loadMore: LoadMoreAttribute }) => void;
}

const withLoadMoreControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (props.name !== GROUP_BLOCK) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const loadMore = attributes.loadMore ?? DEFAULT_LOAD_MORE;

    const updateLoadMore = (changes: Partial<LoadMoreAttribute>) => {
      setAttributes({ loadMore: { ...loadMore, ...changes } });
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Load More", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Enable Load More", "kotlinskidev")}
              checked={loadMore.enabled}
              onChange={(value) => updateLoadMore({ enabled: value })}
              help={__(
                "Show only the first items on load; a button reveals the rest.",
                "kotlinskidev"
              )}
            />

            {loadMore.enabled && (
              <>
                <RangeControl
                  label={__("Items to show initially", "kotlinskidev")}
                  value={loadMore.initialCount}
                  onChange={(value) => updateLoadMore({ initialCount: value ?? 1 })}
                  min={1}
                  max={24}
                />
                <TextControl
                  label={__("Button label", "kotlinskidev")}
                  value={loadMore.buttonLabel}
                  onChange={(value) => updateLoadMore({ buttonLabel: value })}
                  placeholder={__("Load more", "kotlinskidev")}
                  help={__("Leave empty to use the default label.", "kotlinskidev")}
                />
              </>
            )}
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withLoadMoreControls");

interface BlockListBlockProps {
  name?: string;
  attributes?: { loadMore?: LoadMoreAttribute };
  className?: string;
  [key: string]: unknown;
}

const withLoadMorePreviewClass = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    if (props.name !== GROUP_BLOCK || !props.attributes?.loadMore?.enabled) {
      return <BlockListBlock {...props} />;
    }

    return (
      <BlockListBlock {...props} className={`${props.className ?? ""} ${LOAD_MORE_CLASS}`.trim()} />
    );
  };
}, "withLoadMorePreviewClass");

addFilter("blocks.registerBlockType", "kotlinskidev/load-more-attribute", addLoadMoreAttribute);
addFilter("editor.BlockEdit", "kotlinskidev/load-more-controls", withLoadMoreControls);
addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/load-more-preview-class",
  withLoadMorePreviewClass
);
