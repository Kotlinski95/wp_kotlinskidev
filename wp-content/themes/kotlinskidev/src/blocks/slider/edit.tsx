import React from "react";
import { useBlockProps, useBlockEditContext } from "@wordpress/block-editor";
import type { SliderSettingsProps } from "./slider-attributes";
import { SliderCanvas } from "./slider-canvas";
import { SliderSettingsPanel } from "./settings-panel";
import { useSliderInnerBlocksProps } from "./use-slider-inner-blocks-props";
import "./editor.scss";

export type { SliderAttributes } from "./slider-attributes";

export default function Edit({
  attributes,
  setAttributes,
}: SliderSettingsProps): React.ReactElement {
  const { clientId } = useBlockEditContext();
  const blockProps = useBlockProps();
  const innerBlocksProps = useSliderInnerBlocksProps(attributes.spaceBetween);

  return (
    <>
      <div {...blockProps}>
        <SliderCanvas
          clientId={clientId}
          innerBlocksProps={innerBlocksProps}
          attributes={attributes}
        />
      </div>

      <SliderSettingsPanel attributes={attributes} setAttributes={setAttributes} />
    </>
  );
}
