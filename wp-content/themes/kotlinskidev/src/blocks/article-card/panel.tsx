import React from "react";
import { registerPlugin } from "@wordpress/plugins";
import { PluginDocumentSettingPanel } from "@wordpress/editor";
import { ComboboxControl, TextareaControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { useEntityProp } from "@wordpress/core-data";
import { __ } from "@wordpress/i18n";

interface ArticleRecord {
  id: number;
  title: { rendered: string };
}

interface ArticleCardMeta {
  linked_article_id?: number;
  card_description?: string;
}

function ArticleCardPanel() {
  const postType = useSelect(
    (select) =>
      (select("core/editor") as { getCurrentPostType: () => string }).getCurrentPostType(),
    []
  );

  const [meta, setMeta] = useEntityProp<ArticleCardMeta>(
    "postType",
    postType,
    "meta"
  ) as unknown as [ArticleCardMeta, (value: ArticleCardMeta) => void];

  const linkedArticleId = meta?.linked_article_id ?? 0;
  const cardDescription = meta?.card_description ?? "";

  const articles = useSelect<ArticleRecord[]>(
    (select) =>
      (
        select("core") as {
          getEntityRecords: (
            kind: string,
            type: string,
            query: Record<string, unknown>
          ) => ArticleRecord[] | null;
        }
      ).getEntityRecords("postType", "post", {
        per_page: -1,
        status: "publish",
        orderby: "title",
        order: "asc",
        _fields: ["id", "title"],
      }) ?? [],
    []
  );

  const options = articles.map((article) => ({
    value: String(article.id),
    label: article.title.rendered || __("(no title)", "kotlinskidev"),
  }));

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
