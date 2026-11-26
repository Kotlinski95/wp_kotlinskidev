import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl, SelectControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { selectCoreEntityRecords } from "@utils/core-entity-records";
import { buildModalOptions } from "@utils/modal-options";
import type { BlockSettings } from "@utils/block-filter-types";

const MODAL_TRIGGER_BLOCKS = [
  "kotlinskidev/button",
  "kotlinskidev/nav-link",
  "core/button",
  "core/navigation-link",
  "core/navigation-submenu",
];

const MODAL_QUERY = { per_page: 100, status: "publish" };

interface ModalPost {
  id: number;
  title: { rendered: string };
}

const supportsModalTrigger = (name?: string): boolean =>
  Boolean(name && MODAL_TRIGGER_BLOCKS.includes(name));

const addModalTriggerAttributes = (settings: BlockSettings): BlockSettings => {
  if (!supportsModalTrigger(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      opensInModal: { type: "boolean", default: false },
      modalId: { type: "number", default: 0 },
    },
  };
};

export interface ModalTriggerBlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & {
    opensInModal?: boolean;
    modalId?: number;
  };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const ModalTriggerPanel = ({
  opensInModal,
  modalId,
  setAttributes,
}: {
  opensInModal: boolean;
  modalId: number;
  setAttributes: ModalTriggerBlockEditProps["setAttributes"];
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

  const modalOptions = buildModalOptions(modals, __("— Select modal —", "kotlinskidev"));

  return (
    <InspectorControls>
      <PanelBody title={__("Modal", "kotlinskidev")}>
        <ToggleControl
          label={__("Open in a modal", "kotlinskidev")}
          checked={opensInModal}
          onChange={(value) => setAttributes({ opensInModal: value })}
        />
        {opensInModal && (
          <SelectControl
            label={__("Modal", "kotlinskidev")}
            value={modalId}
            options={modalOptions}
            onChange={(value) => setAttributes({ modalId: Number(value) })}
          />
        )}
      </PanelBody>
    </InspectorControls>
  );
};

export const withModalTriggerControls = createHigherOrderComponent((BlockEdit) => {
  return (props: ModalTriggerBlockEditProps) => {
    if (!supportsModalTrigger(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;

    return (
      <Fragment>
        <BlockEdit {...props} />
        <ModalTriggerPanel
          opensInModal={Boolean(attributes.opensInModal)}
          modalId={attributes.modalId ?? 0}
          setAttributes={setAttributes}
        />
      </Fragment>
    );
  };
}, "withModalTriggerControls");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/modal-trigger-attributes",
  addModalTriggerAttributes
);

addFilter("editor.BlockEdit", "kotlinskidev/modal-trigger-controls", withModalTriggerControls);
