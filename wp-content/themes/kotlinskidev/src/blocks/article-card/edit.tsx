import React from "react";
import ServerSideRender from "@wordpress/server-side-render";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, ComboboxControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { usePublishedPostOptions } from "../shared/use-post-options";

export interface ArticleCardAttributes {
  cardId?: number;
}

export interface ArticleCardEditProps {
  attributes: ArticleCardAttributes;
  setAttributes: (attrs: Partial<ArticleCardAttributes>) => void;
}

export default function ArticleCardEdit(props: ArticleCardEditProps) {
  const { attributes, setAttributes } = props;
  const cardId = attributes.cardId ?? 0;

  const options = usePublishedPostOptions("kt_article_card");

  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Article Card", "kotlinskidev")} initialOpen={true}>
          <ComboboxControl
            label={__("Card", "kotlinskidev")}
            value={cardId ? String(cardId) : ""}
            options={options}
            onChange={(value) => setAttributes({ cardId: value ? Number(value) : 0 })}
            allowReset={true}
            help={__(
              "Manage the card's linked article, image, and text from Article Cards in the admin menu. Editing the shared card layout there updates every card wherever it's embedded.",
              "kotlinskidev"
            )}
          />
        </PanelBody>
      </InspectorControls>
      <ServerSideRender block="kotlinskidev/article-card" attributes={attributes} />
    </div>
  );
}
