import React from "react";
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { useSelect } from "@wordpress/data";
import { selectCoreEntityRecords } from "@utils/core-entity-records";
import type { BlockEditProps } from "@utils/block-filter-types";
import { BackgroundEffectPanel } from "./background-effect-panel";
import {
  addBackgroundEffectAttribute,
  applyBackgroundEffectClass,
  isBackgroundEffectExcludedBlock,
} from "./background-effect-attributes";
import type { BackgroundEffectAttributes } from "./background-effect-attributes";

interface BgEffectPresetRecord {
  id: number;
  title: { rendered: string };
}

const PRESET_QUERY = {
  per_page: -1,
  status: "publish",
  orderby: "title",
  order: "asc",
  _fields: ["id", "title"],
};

const withBackgroundEffectControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps<BackgroundEffectAttributes>) => {
    const { attributes, setAttributes, name } = props;

    const presets = useSelect<BgEffectPresetRecord[]>(
      (select) =>
        selectCoreEntityRecords<BgEffectPresetRecord>(select, {
          kind: "postType",
          name: "kt_bg_effect_preset",
          query: PRESET_QUERY,
        }) ?? [],
      []
    );

    if (isBackgroundEffectExcludedBlock(name)) {
      return <BlockEdit {...props} />;
    }

    const presetOptions = presets.map((preset) => ({
      value: String(preset.id),
      label: preset.title.rendered || __("(no title)", "kotlinskidev"),
    }));

    return (
      <>
        <BlockEdit {...props} />
        <BackgroundEffectPanel
          attributes={attributes}
          setAttributes={setAttributes}
          presetOptions={presetOptions}
        />
      </>
    );
  };
}, "withBackgroundEffectControls");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/background-effect-attribute",
  addBackgroundEffectAttribute
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/background-effect-controls",
  withBackgroundEffectControls
);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/background-effect-class",
  applyBackgroundEffectClass
);
