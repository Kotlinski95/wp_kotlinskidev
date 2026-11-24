import React from "react";
import { registerPlugin } from "@wordpress/plugins";
import { PluginDocumentSettingPanel } from "@wordpress/editor";
import { TextControl, TextareaControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useCurrentPostMeta } from "../shared/use-current-post";

interface ProjectCardMeta {
  project_description?: string;
  project_tags?: string;
  project_url?: string;
}

function ProjectCardPanel() {
  const [meta, setMeta] = useCurrentPostMeta<ProjectCardMeta>();

  const description = meta?.project_description ?? "";
  const tags = meta?.project_tags ?? "";
  const url = meta?.project_url ?? "";

  return (
    <PluginDocumentSettingPanel
      name="kotlinskidev-project-card"
      title={__("Project Details", "kotlinskidev")}
    >
      <TextareaControl
        label={__("Description (hover overlay text)", "kotlinskidev")}
        help={__("Shown as overlay text when hovering the card image.", "kotlinskidev")}
        value={description}
        onChange={(value) => setMeta({ ...meta, project_description: value })}
      />
      <TextControl
        label={__("Tags", "kotlinskidev")}
        help={__('Space-separated, e.g. "WordPress Elementor Yoast SEO".', "kotlinskidev")}
        value={tags}
        onChange={(value) => setMeta({ ...meta, project_tags: value })}
      />
      <TextControl
        label={__("Project URL", "kotlinskidev")}
        type="url"
        help={__("Where the arrow icon links to.", "kotlinskidev")}
        value={url}
        onChange={(value) => setMeta({ ...meta, project_url: value })}
      />
    </PluginDocumentSettingPanel>
  );
}

registerPlugin("kotlinskidev-project-card-panel", { render: ProjectCardPanel });
