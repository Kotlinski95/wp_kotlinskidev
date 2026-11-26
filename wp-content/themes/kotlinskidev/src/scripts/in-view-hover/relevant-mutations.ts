import { IN_VIEW_HOVER_SELECTOR } from "../in-view-hover-selector";

const isRelevantNode = (node: Node): boolean =>
  node instanceof Element &&
  (node.matches(IN_VIEW_HOVER_SELECTOR) || node.querySelector(IN_VIEW_HOVER_SELECTOR) !== null);

export const hasRelevantMutation = (records: MutationRecord[]): boolean =>
  records.some(
    (record) =>
      Array.from(record.addedNodes).some(isRelevantNode) ||
      Array.from(record.removedNodes).some(isRelevantNode)
  );
