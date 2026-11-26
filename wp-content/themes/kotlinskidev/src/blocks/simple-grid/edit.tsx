import React from "react";
import { useBlockProps, InnerBlocks, InspectorControls } from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";
import { PanelBody, SelectControl, TextControl, Modal, Button } from "@wordpress/components";
import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import "./style.scss";

const ALLOWED_BLOCKS = ["kotlinskidev/holder"];

const TEMPLATE: [string, Record<string, unknown>][] = [
  ["kotlinskidev/holder", {}],
  ["kotlinskidev/holder", {}],
];

interface HolderBlock {
  clientId: string;
  innerBlocks: unknown[];
}

interface BlockEditorStore {
  getBlock: (id: string) => { innerBlocks: HolderBlock[] } | undefined;
}

interface BlockEditorDispatch {
  insertBlock: (block: unknown, index?: number, rootClientId?: string) => void;
  removeBlocks: (clientIds: string[]) => void;
}

export interface SimpleGridAttributes {
  label: string;
  mobileColumns?: number;
  tabletColumns?: number;
}

const COLUMN_CHOICES = [2, 3, 4];

type SelectOption = { label: string; value: string };

function buildColumnOptions(colCount: number): SelectOption[] {
  return [...new Set([...COLUMN_CHOICES, colCount])]
    .sort((a, b) => a - b)
    .map((count) => ({ label: String(count), value: String(count) }));
}

function buildMobileColumnOptions(colCount: number): SelectOption[] {
  return [
    { label: __("Same as desktop", "kotlinskidev"), value: "0" },
    { label: __("1 column", "kotlinskidev"), value: "1" },
    ...(colCount >= 2 ? [{ label: __("2 columns", "kotlinskidev"), value: "2" }] : []),
  ];
}

function buildTabletColumnOptions(colCount: number): SelectOption[] {
  return [
    { label: __("Same as desktop", "kotlinskidev"), value: "0" },
    ...Array.from({ length: colCount }, (_, i) => i + 1).map((count) => ({
      label:
        count === 1 ? __("1 column", "kotlinskidev") : `${count} ${__("columns", "kotlinskidev")}`,
      value: String(count),
    })),
  ];
}

function useGridHolders(clientId: string) {
  const { innerBlocks } = useSelect(
    (select) => ({
      innerBlocks:
        (select("core/block-editor") as unknown as BlockEditorStore).getBlock(clientId)
          ?.innerBlocks ?? [],
    }),
    [clientId]
  );

  const { insertBlock, removeBlocks } = useDispatch(
    "core/block-editor"
  ) as unknown as BlockEditorDispatch;

  return { innerBlocks, insertBlock, removeBlocks };
}

function useColumnCountChange(clientId: string) {
  const { innerBlocks, insertBlock, removeBlocks } = useGridHolders(clientId);
  const [pendingRemovalIds, setPendingRemovalIds] = useState<string[] | null>(null);

  const onColumnsChange = (value: string) => {
    const target = Number.parseInt(value, 10);
    if (!Number.isFinite(target) || target < 1 || target === innerBlocks.length) {
      return;
    }
    if (target > innerBlocks.length) {
      for (let i = innerBlocks.length; i < target; i += 1) {
        insertBlock(createBlock("kotlinskidev/holder"), undefined, clientId);
      }
      return;
    }
    const removed = innerBlocks.slice(target);
    const hasContent = removed.some((holder) => holder.innerBlocks.length > 0);
    const removedIds = removed.map((holder) => holder.clientId);
    if (hasContent) {
      setPendingRemovalIds(removedIds);
      return;
    }
    removeBlocks(removedIds);
  };

  const confirmRemoval = () => {
    if (pendingRemovalIds) {
      removeBlocks(pendingRemovalIds);
    }
    setPendingRemovalIds(null);
  };

  return {
    colCount: Math.max(1, innerBlocks.length),
    onColumnsChange,
    pendingRemovalIds,
    cancelRemoval: () => setPendingRemovalIds(null),
    confirmRemoval,
  };
}

interface GridSettingsProps {
  attributes: SimpleGridAttributes;
  setAttributes: (attrs: Partial<SimpleGridAttributes>) => void;
  colCount: number;
  onColumnsChange: (value: string) => void;
}

function NavigationPanel({
  attributes,
  setAttributes,
}: Pick<GridSettingsProps, "attributes" | "setAttributes">) {
  return (
    <PanelBody title={__("Navigation", "kotlinskidev")} initialOpen>
      <TextControl
        label={__("Nav label", "kotlinskidev")}
        value={attributes.label}
        onChange={(label) => setAttributes({ label })}
        help={__("Label shown in the navigation bar trigger.", "kotlinskidev")}
      />
    </PanelBody>
  );
}

function parsePositiveColumns(value: string): number | undefined {
  const columns = Number.parseInt(value, 10);
  return columns > 0 ? columns : undefined;
}

function ColumnsPanel(props: GridSettingsProps) {
  const { attributes, setAttributes, colCount, onColumnsChange } = props;
  const onMobileColumnsChange = (value: string) =>
    setAttributes({ mobileColumns: parsePositiveColumns(value) });
  const onTabletColumnsChange = (value: string) =>
    setAttributes({ tabletColumns: parsePositiveColumns(value) });

  return (
    <PanelBody title={__("Columns", "kotlinskidev")}>
      <SelectControl
        label={__("Columns", "kotlinskidev")}
        value={String(colCount)}
        options={buildColumnOptions(colCount)}
        onChange={onColumnsChange}
      />
      <SelectControl
        label={__("Tablet layout", "kotlinskidev")}
        value={String(attributes.tabletColumns ?? 0)}
        options={buildTabletColumnOptions(colCount)}
        onChange={onTabletColumnsChange}
        help={__(
          "Applied between the mobile and desktop breakpoints on the front end. The editor canvas always shows the desktop layout.",
          "kotlinskidev"
        )}
      />
      <SelectControl
        label={__("Mobile layout", "kotlinskidev")}
        value={String(attributes.mobileColumns ?? 0)}
        options={buildMobileColumnOptions(colCount)}
        onChange={onMobileColumnsChange}
        help={__(
          "Applied below the mobile breakpoint on the front end. The editor canvas always shows the desktop layout.",
          "kotlinskidev"
        )}
      />
    </PanelBody>
  );
}

function GridSettingsPanels(props: GridSettingsProps) {
  return (
    <>
      <NavigationPanel attributes={props.attributes} setAttributes={props.setAttributes} />
      <ColumnsPanel {...props} />
    </>
  );
}

function ReduceColumnsModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title={__("Reduce columns?", "kotlinskidev")} onRequestClose={onCancel}>
      <p>
        {__(
          "Reducing columns will delete the content of the removed column(s). Continue?",
          "kotlinskidev"
        )}
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <Button variant="tertiary" onClick={onCancel}>
          {__("Cancel", "kotlinskidev")}
        </Button>
        <Button variant="primary" isDestructive onClick={onConfirm}>
          {__("Continue", "kotlinskidev")}
        </Button>
      </div>
    </Modal>
  );
}

export default function Edit({
  clientId,
  attributes,
  setAttributes,
}: {
  clientId: string;
  attributes: SimpleGridAttributes;
  setAttributes: (attrs: Partial<SimpleGridAttributes>) => void;
}) {
  const { colCount, onColumnsChange, pendingRemovalIds, cancelRemoval, confirmRemoval } =
    useColumnCountChange(clientId);

  const blockProps = useBlockProps({
    className: "kt-simple-grid",
    style: { "--kt-sg-cols": colCount } as React.CSSProperties,
  });

  return (
    <>
      <InspectorControls>
        <GridSettingsPanels
          attributes={attributes}
          setAttributes={setAttributes}
          colCount={colCount}
          onColumnsChange={onColumnsChange}
        />
      </InspectorControls>

      <div {...blockProps}>
        <InnerBlocks allowedBlocks={ALLOWED_BLOCKS} template={TEMPLATE} templateLock={false} />
      </div>

      {pendingRemovalIds && (
        <ReduceColumnsModal onCancel={cancelRemoval} onConfirm={confirmRemoval} />
      )}
    </>
  );
}
