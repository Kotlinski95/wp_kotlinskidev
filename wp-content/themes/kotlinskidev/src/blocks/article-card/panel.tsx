import React from "react";
import { registerPlugin } from "@wordpress/plugins";
import { PluginDocumentSettingPanel } from "@wordpress/editor";
import { ComboboxControl, TextareaControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useCurrentPostMeta } from "../shared/use-current-post";
import { usePublishedPostOptions } from "../shared/use-post-options";

interface ArticleCardMeta {
  linked_article_id?: number;
  card_description?: string;
}

function ArticleCardPanel() {
  const [meta, setMeta] = useCurrentPostMeta<ArticleCardMeta>();
  const options = usePublishedPostOptions("post");

  const linkedArticleId = meta?.linked_article_id ?? 0;
  const cardDescription = meta?.card_description ?? "";

  return (
    <PluginDocumentSettingPanel
      name="kotlinskidev-article-card"
      title={__("Linked Article", "kotlinskidev")}
    >
      <ComboboxControl
        key={`${linkedArticleId}-${options.length}`}
        label={__("Article", "kotlinskidev")}
        value={linkedArticleId ? String(linkedArticleId) : ""}
        options={options}
        onChange={(value) => setMeta({ ...meta, linked_article_id: value ? Number(value) : 0 })}
        allowReset={true}
        help={__(
          "Picking an article fills this card's image, text, and link. Card layout, colors, and typography are edited once for every card via the Site Editor template.",
          "kotlinskidev"
        )}
      />
      <TextareaControl
        label={__("Card description (optional)", "kotlinskidev")}
        help={__("Leave empty to use the article's title.", "kotlinskidev")}
        value={cardDescription}
        onChange={(value) => setMeta({ ...meta, card_description: value })}
      />
    </PluginDocumentSettingPanel>
  );
}

registerPlugin("kotlinskidev-article-card-panel", { render: ArticleCardPanel });
