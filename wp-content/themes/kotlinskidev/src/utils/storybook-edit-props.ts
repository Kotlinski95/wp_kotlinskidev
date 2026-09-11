import { createElement, useRef, useState, type ComponentType, type ReactNode } from "react";
import { createBlock } from "@wordpress/blocks";
import type { BlockEditProps, Block } from "@wordpress/blocks";
import * as blockEditor from "@wordpress/block-editor";
import { useArgs } from "storybook/preview-api";
import { action } from "storybook/actions";

interface RealBlockEditProps {
  name: string;
  clientId: string;
  isSelected: boolean;
  mayDisplayControls: boolean;
  attributes: Record<string, unknown>;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

interface BlockEditorProviderProps {
  value: Block[];
  onInput: (blocks: Block[]) => void;
  onChange: (blocks: Block[]) => void;
  settings?: Record<string, unknown>;
  children?: ReactNode;
}

const { BlockEdit: WPBlockEdit, BlockEditorProvider } = blockEditor as unknown as {
  BlockEdit: ComponentType<RealBlockEditProps>;
  BlockEditorProvider: ComponentType<BlockEditorProviderProps>;
};

export function RealBlockEdit({
  name,
  attributes,
  setAttributes,
}: {
  name: string;
  attributes: Record<string, unknown>;
  setAttributes: (attrs: Record<string, unknown>) => void;
}) {
  const [blocks, setBlocks] = useState<Block[]>(() => [createBlock(name, {}, [])]);
  const clientId = blocks[0].clientId;

  return createElement(
    BlockEditorProvider,
    { value: blocks, onInput: setBlocks, onChange: setBlocks, settings: {} },
    createElement(WPBlockEdit, {
      name,
      clientId,
      isSelected: true,
      mayDisplayControls: true,
      attributes,
      setAttributes,
    })
  );
}

interface AttributeSchemaEntry {
  default?: unknown;
}

export function getDefaultAttributes<T extends object>(
  schema: Record<string, AttributeSchemaEntry>
): T {
  return Object.fromEntries(
    Object.entries(schema).map(([key, value]) => [key, value.default])
  ) as unknown as T;
}

export function buildEditProps<T extends object>(attributes: T): BlockEditProps<T> {
  return {
    attributes,
    setAttributes: () => {},
    clientId: "storybook-preview-block",
    isSelected: false,
    context: {},
    className: "",
  };
}

export function useInteractiveAttributes<T extends object>(): [T, (next: Partial<T>) => void] {
  const [{ attributes }, updateArgs] = useArgs<{ attributes: T }>();
  const latestAttributesRef = useRef(attributes);
  latestAttributesRef.current = attributes;

  const setAttributes = (next: Partial<T>) => {
    action("setAttributes")(next);
    latestAttributesRef.current = { ...latestAttributesRef.current, ...next };
    updateArgs({ attributes: latestAttributesRef.current });
  };

  return [attributes, setAttributes];
}
