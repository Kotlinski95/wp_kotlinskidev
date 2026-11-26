import React from "react";
import {
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import {
  PanelBody,
  ToggleControl,
  TextControl,
  TextareaControl,
  RangeControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { DEFAULT_BACKGROUND_OPACITY, type OverlayValues } from "./overlay-attributes";

interface OverlayPanelProps {
  values: OverlayValues;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const useBackgroundColorChange = (
  setAttributes: OverlayPanelProps["setAttributes"]
): ((value: string | undefined) => void) => {
  const pendingColorRef = React.useRef<string | null>(null);
  return (value) => {
    if (value !== undefined) {
      pendingColorRef.current = value;
      setAttributes({ kotlinskidevOverlayBackgroundColor: value });
    } else if (pendingColorRef.current !== null) {
      pendingColorRef.current = null;
    } else {
      setAttributes({ kotlinskidevOverlayBackgroundColor: "" });
    }
  };
};

interface OverlayDetailsProps extends OverlayPanelProps {
  onBackgroundColorChange: (value: string | undefined) => void;
}

const OverlayTextFields = ({ values, setAttributes }: OverlayPanelProps): JSX.Element => (
  <>
    <TextControl
      label={__("Heading", "kotlinskidev")}
      value={values.heading}
      onChange={(value) => setAttributes({ kotlinskidevOverlayHeading: value })}
    />
    <TextareaControl
      label={__("Description", "kotlinskidev")}
      value={values.description}
      onChange={(value) => setAttributes({ kotlinskidevOverlayDescription: value })}
    />
  </>
);

interface OverlayTextColorFieldProps {
  textColor: string;
  setAttributes: OverlayPanelProps["setAttributes"];
}

const OverlayTextColorField = ({
  textColor,
  setAttributes,
}: OverlayTextColorFieldProps): JSX.Element => (
  <ColorGradientControl
    label={__("Overlay text color", "kotlinskidev")}
    colorValue={textColor || undefined}
    onColorChange={(value: string | undefined) =>
      setAttributes({ kotlinskidevOverlayTextColor: value ?? "" })
    }
    enableAlpha={true}
    clearable={true}
    __experimentalIsRenderedInSidebar={true}
    __nextHasNoMarginBottom
  />
);

const OverlayColorFields = ({
  values,
  setAttributes,
  onBackgroundColorChange,
}: OverlayDetailsProps): JSX.Element => {
  const { backgroundColor, backgroundOpacity, textColor } = values;
  const isBackgroundGradient = backgroundColor.includes("gradient");

  return (
    <>
      <ColorGradientControl
        label={__("Overlay background color", "kotlinskidev")}
        colorValue={backgroundColor && !isBackgroundGradient ? backgroundColor : undefined}
        gradientValue={isBackgroundGradient ? backgroundColor : undefined}
        onColorChange={onBackgroundColorChange}
        onGradientChange={onBackgroundColorChange}
        enableAlpha={true}
        clearable={true}
        __experimentalIsRenderedInSidebar={true}
        __nextHasNoMarginBottom
      />
      <RangeControl
        label={__("Overlay background opacity", "kotlinskidev")}
        value={backgroundOpacity}
        min={0}
        max={100}
        onChange={(value) =>
          setAttributes({
            kotlinskidevOverlayBackgroundOpacity: value ?? DEFAULT_BACKGROUND_OPACITY,
          })
        }
      />
      <OverlayTextColorField textColor={textColor} setAttributes={setAttributes} />
    </>
  );
};

const OverlayDetails = (props: OverlayDetailsProps): JSX.Element => (
  <>
    <OverlayTextFields values={props.values} setAttributes={props.setAttributes} />
    <OverlayColorFields {...props} />
  </>
);

export const OverlayPanel = ({ values, setAttributes }: OverlayPanelProps): JSX.Element => {
  const { enabled } = values;
  const onBackgroundColorChange = useBackgroundColorChange(setAttributes);

  return (
    <InspectorControls>
      <PanelBody title={__("Hover Overlay", "kotlinskidev")} initialOpen={false}>
        <ToggleControl
          label={__("Show text overlay on hover", "kotlinskidev")}
          checked={enabled}
          onChange={(next) => setAttributes({ kotlinskidevOverlayEnabled: next })}
        />
        {enabled && (
          <OverlayDetails
            values={values}
            setAttributes={setAttributes}
            onBackgroundColorChange={onBackgroundColorChange}
          />
        )}
      </PanelBody>
    </InspectorControls>
  );
};
