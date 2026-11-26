import React from "react";
import ServerSideRender from "@wordpress/server-side-render";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, ComboboxControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { usePublishedPostOptions } from "../shared/use-post-options";

export interface ProjectCardAttributes {
  cardId?: number;
}

export interface ProjectCardEditProps {
  attributes: ProjectCardAttributes;
  setAttributes: (attrs: Partial<ProjectCardAttributes>) => void;
}

export default function ProjectCardEdit(props: ProjectCardEditProps) {
  const { attributes, setAttributes } = props;
  const cardId = attributes.cardId ?? 0;

  const options = usePublishedPostOptions("kt_project_card");

  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Project Card", "kotlinskidev")} initialOpen={true}>
          <ComboboxControl
            key={`${cardId}-${options.length}`}
            label={__("Card", "kotlinskidev")}
            value={cardId ? String(cardId) : ""}
            options={options}
            onChange={(value) => setAttributes({ cardId: value ? Number(value) : 0 })}
            allowReset={true}
            help={__(
              "Manage the card's image, description, tags, and link from Project Cards in the admin menu. Editing the shared card layout there updates every card wherever it's embedded.",
              "kotlinskidev"
            )}
          />
        </PanelBody>
      </InspectorControls>
      <ServerSideRender block="kotlinskidev/project-card" attributes={attributes} />
    </div>
  );
}
