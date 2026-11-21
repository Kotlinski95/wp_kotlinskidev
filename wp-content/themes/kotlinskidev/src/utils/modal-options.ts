import { __ } from "@wordpress/i18n";

interface ModalPostRecord {
  id: number;
  title: { rendered: string };
}

export const buildModalOptions = (
  modals: ModalPostRecord[] | null,
  emptyOptionLabel: string
): Array<{ label: string; value: number }> => [
  {
    label: modals === null ? __("Loading…", "kotlinskidev") : emptyOptionLabel,
    value: 0,
  },
  ...(modals ?? []).map((post) => ({
    label: post.title.rendered || String(post.id),
    value: post.id,
  })),
];
