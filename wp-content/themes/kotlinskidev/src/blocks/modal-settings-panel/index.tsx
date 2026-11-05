import React from "react";
import { registerPlugin } from "@wordpress/plugins";
import { PluginDocumentSettingPanel } from "@wordpress/edit-post";
import { SelectControl } from "@wordpress/components";
import { useEntityProp } from "@wordpress/core-data";
import { __ } from "@wordpress/i18n";

const MODAL_SIZE_OPTIONS = [
  { label: __("Small", "kotlinskidev"), value: "small" },
  { label: __("Medium", "kotlinskidev"), value: "medium" },
  { label: __("Large", "kotlinskidev"), value: "large" },
  { label: __("Full screen", "kotlinskidev"), value: "full" },
];

interface ModalMeta {
  kt_modal_size?: string;
}

function ModalSettingsPanel() {
  const [meta, setMeta] = useEntityProp<ModalMeta>("postType", "kt_modal", "meta");

  return (
    <PluginDocumentSettingPanel
      name="kt-modal-settings"
      title={__("Modal Settings", "kotlinskidev")}
    >
      <SelectControl
        label={__("Size", "kotlinskidev")}
        value={meta.kt_modal_size ?? "medium"}
        options={MODAL_SIZE_OPTIONS}
        onChange={(size) => setMeta({ ...meta, kt_modal_size: size })}
      />
    </PluginDocumentSettingPanel>
  );
}

registerPlugin("kotlinskidev-modal-settings-panel", { render: ModalSettingsPanel });
