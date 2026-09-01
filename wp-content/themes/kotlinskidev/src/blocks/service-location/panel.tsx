import React from "react";
import { registerPlugin } from "@wordpress/plugins";
import { PluginDocumentSettingPanel } from "@wordpress/editor";
import { TextControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { useEntityProp } from "@wordpress/core-data";
import { __ } from "@wordpress/i18n";

interface ServiceLocationMeta {
  city?: string;
}

function ServiceLocationPanel() {
  const postType = useSelect(
    (select) =>
      (select("core/editor") as { getCurrentPostType: () => string }).getCurrentPostType(),
    []
  );

  const [meta, setMeta] = useEntityProp<ServiceLocationMeta>(
    "postType",
    postType,
    "meta"
  ) as unknown as [ServiceLocationMeta, (value: ServiceLocationMeta) => void];

  const city = meta?.city ?? "";

  return (
    <PluginDocumentSettingPanel
      name="kotlinskidev-service-location"
      title={__("City Details", "kotlinskidev")}
    >
      <TextControl
        label={__("City", "kotlinskidev")}
        help={__(
          "Every city mention on the page is bound to this field — changing it updates the whole page.",
          "kotlinskidev"
        )}
        value={city}
        onChange={(value) => setMeta({ ...meta, city: value })}
      />
    </PluginDocumentSettingPanel>
  );
}

registerPlugin("kotlinskidev-service-location-panel", { render: ServiceLocationPanel });
