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

export default function Edit({
  clientId,
  attributes,
  setAttributes,
}: {
  clientId: string;
  attributes: SimpleGridAttributes;
  setAttributes: (attrs: Partial<SimpleGridAttributes>) => void;
}) {
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

  const [pendingRemovalIds, setPendingRemovalIds] = useState<string[] | null>(null);

  const colCount = Math.max(1, innerBlocks.length);

  const columnOptions = [...new Set([...COLUMN_CHOICES, colCount])]
    .sort((a, b) => a - b)
    .map((count) => ({
      label: String(count),
      value: String(count),
    }));

  const onColumnsChange = (value: string) => {
    const target = parseInt(value, 10);
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

  const mobileColumnOptions = [
    { label: __("Same as desktop", "kotlinskidev"), value: "0" },
    { label: __("1 column", "kotlinskidev"), value: "1" },
    ...(colCount >= 2 ? [{ label: __("2 columns", "kotlinskidev"), value: "2" }] : []),
  ];

  const onMobileColumnsChange = (value: string) => {
    const mobileColumns = parseInt(value, 10);
    setAttributes({ mobileColumns: mobileColumns > 0 ? mobileColumns : undefined });
  };

  const tabletColumnOptions = [
    { label: __("Same as desktop", "kotlinskidev"), value: "0" },
    ...Array.from({ length: colCount }, (_, i) => i + 1).map((count) => ({
      label:
        count === 1 ? __("1 column", "kotlinskidev") : `${count} ${__("columns", "kotlinskidev")}`,
      value: String(count),
    })),
  ];

  const onTabletColumnsChange = (value: string) => {
    const tabletColumns = parseInt(value, 10);
    setAttributes({ tabletColumns: tabletColumns > 0 ? tabletColumns : undefined });
  };

  const blockProps = useBlockProps({
    className: "kt-simple-grid",
    style: { "--kt-sg-cols": colCount } as React.CSSProperties,
  });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Navigation", "kotlinskidev")} initialOpen>
          <TextControl
            label={__("Nav label", "kotlinskidev")}
            value={attributes.label}
            onChange={(label) => setAttributes({ label })}
            help={__("Label shown in the navigation bar trigger.", "kotlinskidev")}
          />
        </PanelBody>
        <PanelBody title={__("Columns", "kotlinskidev")}>
          <SelectControl
            label={__("Columns", "kotlinskidev")}
            value={String(colCount)}
            options={columnOptions}
            onChange={onColumnsChange}
          />
          <SelectControl
            label={__("Tablet layout", "kotlinskidev")}
            value={String(attributes.tabletColumns ?? 0)}
            options={tabletColumnOptions}
            onChange={onTabletColumnsChange}
            help={__(
              "Applied between the mobile and desktop breakpoints on the front end. The editor canvas always shows the desktop layout.",
              "kotlinskidev"
            )}
          />
          <SelectControl
            label={__("Mobile layout", "kotlinskidev")}
            value={String(attributes.mobileColumns ?? 0)}
            options={mobileColumnOptions}
            onChange={onMobileColumnsChange}
            help={__(
              "Applied below the mobile breakpoint on the front end. The editor canvas always shows the desktop layout.",
              "kotlinskidev"
            )}
          />
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <InnerBlocks allowedBlocks={ALLOWED_BLOCKS} template={TEMPLATE} templateLock={false} />
      </div>

      {pendingRemovalIds && (
        <Modal
          title={__("Reduce columns?", "kotlinskidev")}
          onRequestClose={() => setPendingRemovalIds(null)}
        >
          <p>
            {__(
              "Reducing columns will delete the content of the removed column(s). Continue?",
              "kotlinskidev"
            )}
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <Button variant="tertiary" onClick={() => setPendingRemovalIds(null)}>
              {__("Cancel", "kotlinskidev")}
            </Button>
            <Button
              variant="primary"
              isDestructive
              onClick={() => {
                removeBlocks(pendingRemovalIds);
                setPendingRemovalIds(null);
              }}
            >
              {__("Continue", "kotlinskidev")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
