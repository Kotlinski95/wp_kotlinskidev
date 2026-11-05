import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import "./index";
import "../button/index";
import type { ButtonAttributes } from "../button/edit";
import buttonMetadata from "../button/block.json";
import { initModalManager } from "../../scripts/modal-manager";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";

interface ModalTriggerAttributes extends ButtonAttributes {
  opensInModal: boolean;
  modalId: number;
}

function ModalTriggerControlsStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ModalTriggerAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/button"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

function ModalTriggerFrontendStory() {
  useEffect(() => {
    initModalManager();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <a href="#kt-modal-1" data-kt-modal-target="kt-modal-1" className="wp-block-button__link">
        Open modal
      </a>
      {createPortal(
        <div
          id="kt-modal-1"
          className="kt-modal kt-modal--medium"
          role="dialog"
          aria-modal="true"
          aria-hidden="true"
          aria-label="Storybook mock modal"
        >
          <div className="kt-modal__backdrop" data-kt-modal-close></div>
          <div className="kt-modal__dialog">
            <button
              type="button"
              className="kt-modal__close"
              data-kt-modal-close
              aria-label="Close"
            >
              &times;
            </button>
            <div className="kt-modal__content">
              <p>This is a Storybook mock of a real kt_modal post&apos;s content.</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const meta: Meta = {
  title: "Blocks/Modal Trigger",
  parameters: {
    docs: {
      description: {
        component:
          "`modal-trigger` isn't a block — it's an `editor.BlockEdit` filter (`withModalTriggerControls`) that wraps `kotlinskidev/button`/`nav-link`/core button+nav blocks with a \"Modal\" InspectorControls panel. The `InspectorControls` story below renders the REAL filter pipeline by going through `@wordpress/block-editor`'s own `BlockEdit` dispatcher (`RealBlockEdit`, see `docs/storybook.md`) instead of calling `ButtonEdit` directly — that dispatcher is also what seeds the block-edit context `InspectorControls.Slot` needs to actually display Fill content in the sidebar, a gap every other block's story silently had. The modal picker's dropdown stays on \"Loading…\" — same known gap as `content-block`/`navigation` (`core`'s real `getEntityRecords('postType', 'kt_modal', ...)` has no live WP backend to resolve). The `Frontend` story demonstrates the real click-to-open behavior via `initModalManager()` (refactored out of `modal-manager.ts`'s module-scope `DOMContentLoaded` listener, which never re-fires once Storybook's page has already loaded) against the exact modal-shell markup `functions/modals.php`'s `kotlinskidev_render_modal_shells()` renders on `wp_footer`.",
      },
    },
  },
};

export default meta;

export const InspectorControls: StoryObj = {
  args: {
    attributes: {
      ...getDefaultAttributes<ButtonAttributes>(buttonMetadata.attributes),
      text: "Get in touch",
      opensInModal: false,
      modalId: 0,
    },
  },
  render: ModalTriggerControlsStory,
};

export const Frontend: StoryObj = {
  render: ModalTriggerFrontendStory,
};
