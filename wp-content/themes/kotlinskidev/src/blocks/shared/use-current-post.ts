import { useSelect } from "@wordpress/data";
import { useEntityProp } from "@wordpress/core-data";

export function useCurrentPostType(): string {
  return useSelect(
    (select) =>
      (select("core/editor") as { getCurrentPostType: () => string }).getCurrentPostType(),
    []
  );
}

export function useCurrentPostMeta<Meta>(): [Meta, (value: Meta) => void] {
  const postType = useCurrentPostType();
  return useEntityProp<Meta>("postType", postType, "meta") as unknown as [
    Meta,
    (value: Meta) => void,
  ];
}
