import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import { selectCoreEntityRecords } from "@utils/core-entity-records";

interface TitledPost {
  id: number;
  title: { rendered: string };
}

export interface PostOption {
  value: string;
  label: string;
}

export function usePublishedPostOptions(postType: string): PostOption[] {
  const posts = useSelect<TitledPost[]>(
    (select) =>
      selectCoreEntityRecords<TitledPost>(select, {
        kind: "postType",
        name: postType,
        query: {
          per_page: -1,
          status: "publish",
          orderby: "title",
          order: "asc",
          _fields: ["id", "title"],
        },
      }) ?? [],
    [postType]
  );

  return posts.map((post) => ({
    value: String(post.id),
    label: post.title.rendered || __("(no title)", "kotlinskidev"),
  }));
}
