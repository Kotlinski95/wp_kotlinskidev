import React from "react";
import ServerSideRender from "@wordpress/server-side-render";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, ComboboxControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";

interface CardRecord {
  id: number;
  title: { rendered: string };
}

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

  const cards = useSelect<CardRecord[]>(
    (select) =>
      (
        select("core") as {
          getEntityRecords: (
            kind: string,
            type: string,
            query: Record<string, unknown>
          ) => CardRecord[] | null;
        }
      ).getEntityRecords("postType", "kt_project_card", {
        per_page: -1,
        status: "publish",
        orderby: "title",
        order: "asc",
        _fields: ["id", "title"],
      }) ?? [],
    []
  );

  const options = cards.map((card) => ({
    value: String(card.id),
    label: card.title.rendered || __("(no title)", "kotlinskidev"),
  }));

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
