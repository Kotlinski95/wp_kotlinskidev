import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { selectCoreEntityRecords } from "@utils/core-entity-records";
import { buildModalOptions } from "@utils/modal-options";
import type { BlockSettings } from "@utils/block-filter-types";

const MODAL_QUERY = { per_page: 100, status: "publish" };

interface ModalPost {
  id: number;
  title: { rendered: string };
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

const SlideModalPanel = ({
  modalId,
  setAttributes,
}: {
  modalId: number;
  setAttributes: BlockEditProps["setAttributes"];
}) => {
  const modals = useSelect(
    (select) =>
      selectCoreEntityRecords<ModalPost>(select, {
        kind: "postType",
        name: "kt_modal",
        query: MODAL_QUERY,
      }),
    []
  );

  const modalOptions = buildModalOptions(modals, __("— None (not clickable) —", "kotlinskidev"));

  return (
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
  );
};

const withSlideModalControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!isSliderSlide(props.name, props.attributes.className)) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <SlideModalPanel
          modalId={props.attributes.modalId ?? 0}
          setAttributes={props.setAttributes}
        />
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
