import React from "react";
import ServerSideRender from "@wordpress/server-side-render";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { SolidColorControl } from "../shared/solid-color-control";

export interface SearchFormDynamicAttributes {
  wrapperBackgroundColor?: string;
  inputBorderColor?: string;
  labelColor?: string;
}

export interface SearchFormDynamicEditProps {
  attributes: SearchFormDynamicAttributes;
  setAttributes: (attrs: Partial<SearchFormDynamicAttributes>) => void;
}

function searchFormColorFields(): { field: keyof SearchFormDynamicAttributes; label: string }[] {
  return [
    { field: "wrapperBackgroundColor", label: __("Panel background color", "kotlinskidev") },
    { field: "inputBorderColor", label: __("Input/select border color", "kotlinskidev") },
    { field: "labelColor", label: __("Label color", "kotlinskidev") },
  ];
}

function SearchFormColorsPanel({ attributes, setAttributes }: SearchFormDynamicEditProps) {
  return (
    <PanelBody title={__("Search Form Colors", "kotlinskidev")} initialOpen={false}>
      {searchFormColorFields().map(({ field, label }) => (
        <SolidColorControl
          key={field}
          label={label}
          value={attributes[field] ?? ""}
          onChange={(value) => setAttributes({ [field]: value })}
        />
      ))}
      <p className="components-base-control__help">
        {__(
          "Leave empty to keep the theme's default colors. The search button keeps its own gradient hover effect regardless of these settings.",
          "kotlinskidev"
        )}
      </p>
    </PanelBody>
  );
}

export default function Edit({ attributes, setAttributes }: SearchFormDynamicEditProps) {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <SearchFormColorsPanel attributes={attributes} setAttributes={setAttributes} />
      </InspectorControls>
      <ServerSideRender block="kotlinskidev/search-form-dynamic" attributes={attributes} />
    </div>
  );
}
