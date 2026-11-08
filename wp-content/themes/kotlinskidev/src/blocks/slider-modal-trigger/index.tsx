import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

interface ModalPost {
  id: number;
  title: { rendered: string };
}

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const isSliderSlide = (name?: string, className?: unknown): boolean =>
  name === "core/cover" &&
  typeof className === "string" &&
  className.split(/\s+/).includes("swiper-slide");

const addSlideModalAttribute = (settings: BlockSettings): BlockSettings => {
  if (settings.name !== "core/cover") {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      modalId: { type: "number", default: 0 },
    },
  };
};

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & {
    className?: string;
    modalId?: number;
  };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withSlideModalControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!isSliderSlide(props.name, props.attributes.className)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const modalId = attributes.modalId ?? 0;

    const modals = useSelect((select) => {
      return (select("core") as any).getEntityRecords("postType", "kt_modal", {
        per_page: 100,
        status: "publish",
      }) as ModalPost[] | null;
    }, []);

    const modalOptions = [
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

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Slide Modal", "kotlinskidev")}>
            <SelectControl
              label={__("Open on click", "kotlinskidev")}
              help={__(
                "Selecting a modal makes this whole slide clickable/keyboard-activatable.",
                "kotlinskidev"
              )}
              value={modalId}
              options={modalOptions}
              onChange={(value) => setAttributes({ modalId: Number(value) })}
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withSlideModalControls");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/slider-modal-attribute",
  addSlideModalAttribute
);

addFilter("editor.BlockEdit", "kotlinskidev/slider-modal-controls", withSlideModalControls);
