const INDEPENDENT_COLUMNS_CLASS = "kt-faq-independent-columns";
const INDEPENDENT_COLUMNS_COUNTED_PATTERN = /^kt-faq-independent-columns-(\d+)$/;
const DEFAULT_COLUMN_COUNT = 2;
const COLUMN_CLASS = "kt-faq-column";

const getIndependentColumnsCount = (group: Element): number | null => {
  for (const className of Array.from(group.classList)) {
    if (className === INDEPENDENT_COLUMNS_CLASS) {
      return DEFAULT_COLUMN_COUNT;
    }
    const match = className.match(INDEPENDENT_COLUMNS_COUNTED_PATTERN);
    if (match) {
      return Number(match[1]);
    }
  }
  return null;
};

const createColumns = (group: Element, columnCount: number): HTMLDivElement[] => {
  const columns: HTMLDivElement[] = [];
  for (let i = 0; i < columnCount; i++) {
    const column = document.createElement("div");
    column.className = COLUMN_CLASS;
    columns.push(column);
    group.appendChild(column);
  }
  return columns;
};

const distributeItems = (items: HTMLDetailsElement[], columns: HTMLDivElement[]): void => {
  const columnCount = columns.length;
  const itemsPerColumn = Math.ceil(items.length / columnCount);
  items.forEach((item, index) => {
    const columnIndex = Math.min(Math.floor(index / itemsPerColumn), columnCount - 1);
    columns[columnIndex].appendChild(item);
  });
};

const splitGroup = (group: Element): void => {
  const columnCount = getIndependentColumnsCount(group);
  if (!columnCount) {
    return;
  }

  const items = Array.from(group.children).filter(
    (el): el is HTMLDetailsElement => el instanceof HTMLDetailsElement
  );
  if (items.length === 0) {
    return;
  }

  distributeItems(items, createColumns(group, columnCount));
};

export const splitIntoIndependentColumns = (): void => {
  const groups = document.querySelectorAll(
    `.${INDEPENDENT_COLUMNS_CLASS}, [class*="${INDEPENDENT_COLUMNS_CLASS}-"]`
  );
  groups.forEach(splitGroup);
};
