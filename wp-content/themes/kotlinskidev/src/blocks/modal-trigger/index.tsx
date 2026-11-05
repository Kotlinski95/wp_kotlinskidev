import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl, SelectControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const MODAL_TRIGGER_BLOCKS = [
  "kotlinskidev/button",
  "kotlinskidev/nav-link",
  "core/button",
  "core/navigation-link",
  "core/navigation-submenu",
];

interface ModalPost {
  id: number;
  title: { rendered: string };
}

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
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

export const withModalTriggerControls = createHigherOrderComponent((BlockEdit) => {
  return (props: ModalTriggerBlockEditProps) => {
    if (!supportsModalTrigger(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const opensInModal = Boolean(attributes.opensInModal);
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
          modals === null ? __("Loading…", "kotlinskidev") : __("— Select modal —", "kotlinskidev"),
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
