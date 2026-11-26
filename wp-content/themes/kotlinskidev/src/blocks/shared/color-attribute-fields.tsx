import React from "react";
import { __experimentalColorGradientControl as ColorGradientControl } from "@wordpress/block-editor";

export interface ColorAttributeField<Attributes> {
  field: keyof Attributes & string;
  label: string;
}

interface ColorAttributeFieldsProps<Attributes> {
  fields: ColorAttributeField<Attributes>[];
  attributes: Attributes;
  setAttributes: (attributes: Partial<Attributes>) => void;
}

export function ColorAttributeFields<Attributes>({
  fields,
  attributes,
  setAttributes,
}: ColorAttributeFieldsProps<Attributes>) {
  return (
    <>
      {fields.map(({ field, label }) => (
        <ColorGradientControl
          key={field}
          label={label}
          colorValue={(attributes[field] as unknown as string) || undefined}
          onColorChange={(value?: string) =>
            setAttributes({ [field]: value || "" } as unknown as Partial<Attributes>)
          }
          enableAlpha={true}
          clearable={true}
          __experimentalIsRenderedInSidebar={true}
          __nextHasNoMarginBottom
        />
      ))}
    </>
  );
}
